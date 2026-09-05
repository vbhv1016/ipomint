import { ExternalLink } from "lucide-react";
import { BROKERS } from "@/lib/brokers";

export default function BrokerApplyLinks({ ipoName, compact = false }: { ipoName?: string; compact?: boolean }) {
  return (
    <div className="rounded-md border border-border bg-muted/30 p-3">
      <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">
        {ipoName ? `Apply to ${ipoName} IPO` : "Apply to this IPO"}
      </div>
      <div className={`grid gap-2 ${compact ? "grid-cols-2" : "grid-cols-2 md:grid-cols-4"}`}>
        {BROKERS.map((b) => (
          <a
            key={b.id}
            href={b.url}
            target="_blank"
            rel="sponsored noopener noreferrer"
            className="flex flex-col rounded-md border border-border bg-card px-3 py-2 hover:border-primary hover:bg-accent transition-colors"
          >
            <span className="text-sm font-semibold text-foreground flex items-center gap-1">
              {b.name}
              <ExternalLink className="h-3 w-3 text-muted-foreground" />
            </span>
            <span className="text-[11px] text-muted-foreground">{b.tagline}</span>
          </a>
        ))}
      </div>
      <p className="text-[10px] text-muted-foreground mt-2">
        Links open the broker's official account-opening page. We may earn a referral commission at no cost to you.
      </p>
    </div>
  );
}
