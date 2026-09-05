import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { getIpoAdvice } from "@/lib/ipo-advisor.functions";
import { Sparkles, ThumbsUp, ThumbsDown, Loader2, Share2 } from "lucide-react";
import BrokerApplyLinks from "@/components/BrokerApplyLinks";


type Advice = Awaited<ReturnType<typeof getIpoAdvice>>;

const verdictStyles = {
  apply: { label: "APPLY", bg: "bg-gain/10", text: "text-gain", ring: "ring-gain/30", icon: ThumbsUp },
  avoid: { label: "AVOID", bg: "bg-loss/10", text: "text-loss", ring: "ring-loss/30", icon: ThumbsDown },
  neutral: { label: "NEUTRAL", bg: "bg-amber-500/10", text: "text-amber-600", ring: "ring-amber-500/30", icon: Sparkles },
} as const;

export default function AIAdvisorCard({ ipoId, ipoName, initial }: { ipoId: string; ipoName: string; initial?: Advice | null }) {
  const [advice, setAdvice] = useState<Advice | null>(initial ?? null);
  const fetchAdvice = useServerFn(getIpoAdvice);
  const mutation = useMutation({
    mutationFn: () => fetchAdvice({ data: { ipoId } }),
    onSuccess: (d) => setAdvice(d),
  });

  const style = advice ? verdictStyles[advice.verdict] : null;

  const share = () => {
    if (typeof window === "undefined") return;
    const text = `AI Verdict on ${ipoName} IPO: ${style?.label} — ${advice?.summary}`;
    const url = window.location.href;
    if (navigator.share) navigator.share({ title: `${ipoName} IPO AI Verdict`, text, url }).catch(() => {});
    else navigator.clipboard.writeText(`${text}\n${url}`);
  };

  return (
    <section className="rounded-lg border border-border bg-card p-4 md:p-6 shadow-xs" aria-labelledby="ai-advisor-title">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h2 id="ai-advisor-title" className="font-serif text-lg md:text-xl font-bold text-foreground flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Should You Apply? AI Verdict
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            AI-generated analysis based on GMP, subscription, and fundamentals. Not investment advice.
          </p>
        </div>
        {advice && (
          <button onClick={share} className="p-2 rounded-md border border-border hover:bg-accent" aria-label="Share verdict">
            <Share2 className="h-4 w-4" />
          </button>
        )}
      </div>

      {!advice && !mutation.isPending && (
        <button
          onClick={() => mutation.mutate()}
          className="w-full py-3 rounded-md bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
        >
          <Sparkles className="h-4 w-4 inline mr-2" />
          Get AI Verdict
        </button>
      )}

      {mutation.isPending && (
        <div className="flex flex-col items-center py-6 gap-2 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="text-sm">Analyzing IPO data…</span>
        </div>
      )}

      {mutation.isError && (
        <div className="text-sm text-loss py-2">Failed to generate verdict. Please try again.</div>
      )}

      {advice && style && (
        <div className="space-y-4">
          <div className={`flex items-center justify-between gap-3 rounded-md p-4 ${style.bg} ring-1 ${style.ring}`}>
            <div className="flex items-center gap-3">
              <div className={`h-12 w-12 rounded-full ${style.bg} flex items-center justify-center`}>
                <style.icon className={`h-6 w-6 ${style.text}`} />
              </div>
              <div>
                <div className={`text-2xl font-bold ${style.text}`}>{style.label}</div>
                <div className="text-xs text-muted-foreground">Confidence: {advice.confidence}%</div>
              </div>
            </div>
            <div className="w-24">
              <div className="h-2 bg-background rounded-full overflow-hidden">
                <div className={`h-full ${style.text.replace("text-", "bg-")}`} style={{ width: `${advice.confidence}%` }} />
              </div>
            </div>
          </div>

          {advice.summary && <p className="text-sm text-foreground leading-relaxed">{advice.summary}</p>}

          <BrokerApplyLinks ipoName={ipoName} />


          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="rounded-md border border-border p-3">
              <div className="text-xs uppercase tracking-wider text-gain font-semibold mb-2 flex items-center gap-1">
                <ThumbsUp className="h-3.5 w-3.5" /> Pros
              </div>
              <ul className="space-y-1.5">
                {advice.pros.map((p, i) => (
                  <li key={i} className="text-sm text-foreground flex gap-2">
                    <span className="text-gain mt-0.5">•</span>
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-md border border-border p-3">
              <div className="text-xs uppercase tracking-wider text-loss font-semibold mb-2 flex items-center gap-1">
                <ThumbsDown className="h-3.5 w-3.5" /> Cons
              </div>
              <ul className="space-y-1.5">
                {advice.cons.map((c, i) => (
                  <li key={i} className="text-sm text-foreground flex gap-2">
                    <span className="text-loss mt-0.5">•</span>
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-2 border-t border-border">
            <span>Generated {new Date(advice.generated_at).toLocaleString("en-IN")}{advice.cached ? " (cached)" : ""}</span>
            <button onClick={() => mutation.mutate()} className="hover:text-foreground underline underline-offset-2">
              Regenerate
            </button>
          </div>

          <div className="text-[10px] text-muted-foreground italic border-t border-border pt-2">
            ⚠️ Disclaimer: AI-generated analysis for educational purposes only. Not SEBI-registered investment advice. Consult a financial advisor before investing.
          </div>
        </div>
      )}
    </section>
  );
}
