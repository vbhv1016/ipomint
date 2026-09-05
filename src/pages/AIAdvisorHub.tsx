import { useMemo } from "react";
import { Link } from "@/lib/router-compat";
import { useIPOs } from "@/hooks/useIPOData";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Sparkles, Loader2, ArrowRight } from "lucide-react";

export default function AIAdvisorHub() {
  const { data: ipos = [], isLoading } = useIPOs();

  const eligible = useMemo(
    () =>
      ipos
        .filter((i) => i.status === "open" || i.status === "upcoming")
        .sort((a, b) => new Date(a.open_date).getTime() - new Date(b.open_date).getTime()),
    [ipos]
  );

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-6 md:py-10">
        <div className="mb-6">
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-foreground mb-2 flex items-center gap-2">
            <Sparkles className="h-7 w-7 text-primary" />
            AI IPO Advisor
          </h1>
          <p className="text-sm text-muted-foreground max-w-3xl">
            Get an unbiased AI verdict — Apply, Neutral, or Avoid — for every open and upcoming Indian IPO, based on GMP, subscription, valuation and fundamentals.
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : eligible.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No open or upcoming IPOs right now. Check back soon.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {eligible.map((ipo) => (
              <Link
                key={ipo.id}
                to={`/advisor/${ipo.slug}`}
                className="group rounded-lg border border-border bg-card p-4 hover:border-primary/50 transition-colors flex flex-col gap-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="font-semibold text-foreground text-sm">{ipo.name}</div>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wider ${
                      ipo.status === "open"
                        ? "bg-gain/10 text-gain"
                        : "bg-primary/10 text-primary"
                    }`}
                  >
                    {ipo.status}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground tabular-nums">
                  ₹{ipo.price_band_low}–₹{ipo.price_band_high} · Lot {ipo.lot_size}
                </div>
                <div className="mt-auto pt-2 inline-flex items-center gap-1 text-xs text-primary font-medium group-hover:gap-2 transition-all">
                  Get AI Verdict <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
