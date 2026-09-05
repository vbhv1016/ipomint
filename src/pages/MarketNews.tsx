import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getMarketNews } from "@/lib/market-news.functions";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Newspaper, Loader2, ExternalLink, Activity } from "lucide-react";

function timeAgo(iso: string) {
  const d = new Date(iso).getTime();
  if (!d) return "";
  const s = Math.floor((Date.now() - d) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export default function MarketNews() {
  const fetchNews = useServerFn(getMarketNews);
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["market-news"],
    queryFn: () => fetchNews(),
    refetchInterval: 5 * 60 * 1000, // 5 min
    staleTime: 2 * 60 * 1000,
  });

  const items = data?.items ?? [];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-6 md:py-10">
        <div className="mb-4">
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-foreground mb-2 flex items-center gap-2">
            <Newspaper className="h-7 w-7 text-primary" />
            Stock Market & IPO News
          </h1>
          <p className="text-sm text-muted-foreground max-w-3xl">
            Latest news on Indian IPOs, Nifty, Sensex and stock market — aggregated from trusted sources and auto-refreshed every 5 minutes.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4 bg-card border border-border rounded-md px-3 py-2 w-fit">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gain opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-gain"></span>
          </span>
          <Activity className="h-3.5 w-3.5" />
          <span>{isFetching ? "Refreshing…" : "Live news feed"}</span>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            News feed unavailable right now. Please try again shortly.
          </div>
        ) : (
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {items.map((n, idx) => (
              <li key={`${n.link}-${idx}`}>
                <a
                  href={n.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block rounded-lg border border-border bg-card p-4 hover:border-primary/50 transition-colors h-full"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-[10px] uppercase tracking-wider text-primary font-medium">
                      {n.source}
                    </span>
                    <span className="text-[10px] text-muted-foreground shrink-0">
                      {timeAgo(n.pubDate)}
                    </span>
                  </div>
                  <h2 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors mb-1 line-clamp-3">
                    {n.title}
                  </h2>
                  {n.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">{n.description}</p>
                  )}
                  <div className="mt-2 inline-flex items-center gap-1 text-[11px] text-muted-foreground group-hover:text-primary transition-colors">
                    Read on source <ExternalLink className="h-3 w-3" />
                  </div>
                </a>
              </li>
            ))}
          </ul>
        )}
      </main>
      <Footer />
    </div>
  );
}
