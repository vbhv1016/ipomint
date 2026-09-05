import { createFileRoute } from "@tanstack/react-router";
import { serviceClient, acquireJobLease, releaseJob, pauseJob, verifyJobSecret } from "@/lib/alerts.server";

const JOB = "weekly-blog";
const MODEL = "google/gemini-3.6-flash";

const TOPICS = [
  { category: "ipo-trends", angle: "the week's IPO trends across mainline and SME issues" },
  { category: "gmp-analysis", angle: "what this week's grey market premium moves signal for listing gains" },
  { category: "strategy", angle: "subscription strategies: which category to apply in and how to improve allotment odds" },
];

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80);
}

export const Route = createFileRoute("/api/public/hooks/weekly-blog")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const sb = serviceClient();
        if (!(await verifyJobSecret(sb, request))) {
          return new Response("Unauthorized", { status: 401 });
        }
        const lease = await acquireJobLease(sb, JOB, 10);
        if (!lease.ok) return Response.json({ skipped: lease.reason }, { status: 200 });

        try {
          const apiKey = process.env.LOVABLE_API_KEY;
          if (!apiKey) {
            await pauseJob(sb, JOB, "LOVABLE_API_KEY missing");
            return Response.json({ error: "missing_api_key" }, { status: 500 });
          }

          const week = new Date();
          const weekTag = `${week.getUTCFullYear()}-w${String(Math.ceil(((+week - +new Date(Date.UTC(week.getUTCFullYear(), 0, 1))) / 86400000 + 1) / 7)).padStart(2, "0")}`;
          const topic = TOPICS[week.getUTCDate() % TOPICS.length];

          const { data: ipos = [] } = await sb
            .from("ipos")
            .select("name,exchange,status,open_date,close_date,price_band_low,price_band_high,lot_size,subscription_total,listing_gains_pct")
            .order("open_date", { ascending: false })
            .limit(25);

          const prompt = `You are an Indian IPO market analyst writing for ipomint.in.
Write a 700-900 word SEO article in Markdown about ${topic.angle}, using ONLY the live data below.
Rules: start with a single "# " H1 title, use "## " subheadings, include a short bullet list of the notable IPOs,
add a "## FAQs" section with 3 pairs formatted exactly as "**Q: question**" then a new line "A: answer".
End with a one-line disclaimer that GMP is unofficial and this is not investment advice. No tables, no images.

Live IPO data (JSON):
${JSON.stringify(ipos)}`;

          const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
            body: JSON.stringify({ model: MODEL, messages: [{ role: "user", content: prompt }] }),
          });

          if (resp.status === 402 || resp.status === 403) {
            const msg = await resp.text();
            await pauseJob(sb, JOB, `AI blocked (${resp.status}): ${msg.slice(0, 300)}`);
            return Response.json({ error: "ai_blocked", status: resp.status }, { status: 200 });
          }
          if (!resp.ok) {
            await releaseJob(sb, JOB, { last_error: `ai_${resp.status}` });
            return Response.json({ error: "ai_failed", status: resp.status }, { status: 200 });
          }

          const json = (await resp.json()) as any;
          const content: string = json.choices?.[0]?.message?.content ?? "";
          if (!content.trim()) {
            await releaseJob(sb, JOB, { last_error: "empty_ai_response" });
            return Response.json({ error: "empty_response" }, { status: 200 });
          }

          const titleLine = content.split("\n").find((l) => l.startsWith("# "));
          const title = (titleLine ? titleLine.slice(2) : `IPO Market Update ${weekTag}`).trim();
          const slug = `${slugify(title)}-${weekTag}`;
          const excerpt = content
            .split("\n")
            .find((l) => l.trim() && !l.startsWith("#"))
            ?.replace(/[*_]/g, "")
            .slice(0, 180) ?? title;

          const { error } = await sb.from("blog_posts").upsert(
            {
              title,
              slug,
              excerpt,
              content,
              category: topic.category,
              published: true,
              published_at: new Date().toISOString(),
            },
            { onConflict: "slug" },
          );
          if (error) {
            await releaseJob(sb, JOB, { last_error: error.message });
            return Response.json({ error: "db_write_failed" }, { status: 500 });
          }

          await releaseJob(sb, JOB, { last_error: null });
          return Response.json({ ok: true, slug, title });
        } catch (e) {
          await releaseJob(sb, JOB, { last_error: e instanceof Error ? e.message : String(e) });
          return Response.json({ error: "weekly_blog_failed" }, { status: 500 });
        }
      },
    },
  },
});
