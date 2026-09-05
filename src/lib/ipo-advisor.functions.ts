import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

type AdviceShape = {
  verdict: "apply" | "neutral" | "avoid";
  confidence: number;
  pros: string[];
  cons: string[];
  summary: string;
  generated_at: string;
  cached: boolean;
};

const FALLBACK: Omit<AdviceShape, "generated_at" | "cached"> = {
  verdict: "neutral",
  confidence: 50,
  pros: ["Data being analyzed"],
  cons: ["Insufficient live data at this moment"],
  summary: "Analysis temporarily unavailable. Please check back shortly.",
};

function svcClient() {
  const url = process.env.SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

// Minimum seconds between AI regenerations for the same IPO, regardless of caller input.
const MIN_REGEN_INTERVAL_SEC = 6 * 60 * 60; // 6 hours

export const getIpoAdvice = createServerFn({ method: "POST" })
  .inputValidator((input: unknown): { ipoId: string } => {
    const v = input as { ipoId?: unknown };
    if (typeof v?.ipoId !== "string" || !v.ipoId) throw new Error("ipoId required");
    return { ipoId: v.ipoId };
  })
  .handler(async ({ data }): Promise<AdviceShape> => {
    const supabase = svcClient();

    // 1. Load IPO
    const { data: ipo } = await supabase
      .from("ipos")
      .select("*")
      .eq("id", data.ipoId)
      .maybeSingle();
    if (!ipo) throw new Error("IPO not found");

    // 2. Latest GMP
    const { data: gmpRow } = await supabase
      .from("gmp_updates")
      .select("gmp,date")
      .eq("ipo_id", data.ipoId)
      .order("date", { ascending: false })
      .limit(1)
      .maybeSingle();
    const latestGmp = gmpRow ? Number(gmpRow.gmp) : 0;

    // 3. Cache check — server-enforced minimum regeneration interval. The client
    // cannot bypass this; the AI Gateway is only called when the cached advice
    // is stale (older than MIN_REGEN_INTERVAL_SEC) or GMP has moved materially.
    const { data: cached } = await supabase
      .from("ipo_advice")
      .select("*")
      .eq("ipo_id", data.ipoId)
      .maybeSingle();
    if (cached) {
      const ageSec = (Date.now() - new Date(cached.generated_at).getTime()) / 1000;
      const gmpDelta = Math.abs((Number(cached.gmp_at_generation ?? 0)) - latestGmp);
      const gmpStable = gmpDelta < Math.max(5, latestGmp * 0.1);
      if (ageSec < MIN_REGEN_INTERVAL_SEC && gmpStable) {
        return {
          verdict: cached.verdict as AdviceShape["verdict"],
          confidence: cached.confidence,
          pros: (cached.pros as string[]) ?? [],
          cons: (cached.cons as string[]) ?? [],
          summary: cached.summary,
          generated_at: cached.generated_at,
          cached: true,
        };
      }
    }

    // 4. Build context for AI
    const priceHigh = Number(ipo.price_band_high);
    const priceLow = Number(ipo.price_band_low);
    const gmpPct = priceHigh > 0 ? (latestGmp / priceHigh) * 100 : 0;
    const context = {
      name: ipo.name,
      exchange: ipo.exchange,
      priceRange: `₹${priceLow}-₹${priceHigh}`,
      lotSize: ipo.lot_size,
      openDate: ipo.open_date,
      closeDate: ipo.close_date,
      status: ipo.status,
      gmp: latestGmp,
      gmpPctOfIssue: gmpPct.toFixed(1),
      subRetail: ipo.subscription_retail,
      subHNI: ipo.subscription_hni,
      subQIB: ipo.subscription_qib,
      subTotal: ipo.subscription_total,
      revenue: ipo.revenue,
      profit: ipo.profit,
      description: ipo.company_description?.slice(0, 500),
    };

    // 5. Call Lovable AI Gateway
    const key = process.env.LOVABLE_API_KEY;
    let advice: Omit<AdviceShape, "generated_at" | "cached"> = FALLBACK;

    if (key) {
      try {
        const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${key}`,
          },
          body: JSON.stringify({
            model: "google/gemini-3.5-flash",
            messages: [
              {
                role: "system",
                content:
                  "You are an Indian IPO analyst. Analyze the IPO data and give an unbiased Apply/Neutral/Avoid verdict for retail investors based on GMP, subscription, fundamentals, and market conditions. Return ONLY valid JSON. Never guarantee returns. Consider risk. This is educational, not financial advice.",
              },
              {
                role: "user",
                content: `Analyze this IPO and respond as JSON with fields: verdict ("apply"|"neutral"|"avoid"), confidence (0-100 integer), pros (array of 3-5 short strings), cons (array of 2-4 short strings), summary (1-2 sentences max 200 chars).\n\nData:\n${JSON.stringify(context, null, 2)}`,
              },
            ],
            response_format: { type: "json_object" },
            max_completion_tokens: 800,
          }),
        });

        if (res.ok) {
          const json = (await res.json()) as {
            choices?: Array<{ message?: { content?: string } }>;
          };
          const content = json.choices?.[0]?.message?.content;
          if (content) {
            const parsed = JSON.parse(content);
            const verdict = ["apply", "neutral", "avoid"].includes(parsed.verdict)
              ? parsed.verdict
              : "neutral";
            advice = {
              verdict,
              confidence: Math.max(0, Math.min(100, Math.round(Number(parsed.confidence ?? 50)))),
              pros: Array.isArray(parsed.pros) ? parsed.pros.slice(0, 5).map(String) : [],
              cons: Array.isArray(parsed.cons) ? parsed.cons.slice(0, 4).map(String) : [],
              summary: String(parsed.summary ?? "").slice(0, 300),
            };
          }
        } else {
          console.error("AI gateway error", res.status, await res.text());
        }
      } catch (err) {
        console.error("AI advisor call failed", err);
      }
    }

    // 6. Cache result
    const now = new Date().toISOString();
    await supabase
      .from("ipo_advice")
      .upsert({
        ipo_id: data.ipoId,
        verdict: advice.verdict,
        confidence: advice.confidence,
        pros: advice.pros,
        cons: advice.cons,
        summary: advice.summary,
        gmp_at_generation: latestGmp,
        generated_at: now,
      });

    return { ...advice, generated_at: now, cached: false };
  });
