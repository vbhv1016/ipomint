import { useMemo, useState } from "react";
import { Link } from "@/lib/router-compat";
import { useIPOs } from "@/hooks/useIPOData";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Loader2, TrendingUp, TrendingDown, Award } from "lucide-react";

type SortKey = "gain_desc" | "gain_asc" | "date_desc";

const IPOPerformance = () => {
  const { data: ipos = [], isLoading } = useIPOs();
  const [year, setYear] = useState<string>("all");
  const [exchange, setExchange] = useState<"all" | "mainline" | "sme">("all");
  const [sort, setSort] = useState<SortKey>("gain_desc");

  const listed = useMemo(() => ipos.filter((i) => i.status === "listed"), [ipos]);
  const years = useMemo(() => {
    const set = new Set<string>();
    listed.forEach((i) => {
      if (i.listing_date) set.add(String(new Date(i.listing_date).getFullYear()));
    });
    return Array.from(set).sort().reverse();
  }, [listed]);

  const rows = useMemo(() => {
    let arr = listed.map((i) => {
      const priceHigh = Number(i.price_band_high) || 0;
      const anyI = i as unknown as Record<string, unknown>;
      const listPrice = anyI.listing_price != null ? Number(anyI.listing_price) : null;
      const rawPct = anyI.listing_gains_pct ?? i.listing_gain;
      const gainPct =
        rawPct != null
          ? Number(rawPct)
          : listPrice != null && priceHigh > 0
          ? ((listPrice - priceHigh) / priceHigh) * 100
          : null;
      const isSme = /SME/i.test(i.exchange || "");
      return { ipo: i, priceHigh, listPrice, gainPct, isSme };
    });

    if (year !== "all") arr = arr.filter((r) => String(new Date(r.ipo.listing_date!).getFullYear()) === year);
    if (exchange === "sme") arr = arr.filter((r) => r.isSme);
    if (exchange === "mainline") arr = arr.filter((r) => !r.isSme);

    arr.sort((a, b) => {
      if (sort === "date_desc") {
        return new Date(b.ipo.listing_date || 0).getTime() - new Date(a.ipo.listing_date || 0).getTime();
      }
      const av = a.gainPct ?? -Infinity;
      const bv = b.gainPct ?? -Infinity;
      return sort === "gain_desc" ? bv - av : av - bv;
    });
    return arr;
  }, [listed, year, exchange, sort]);

  const topGainer = rows.filter((r) => r.gainPct != null).sort((a, b) => (b.gainPct! - a.gainPct!))[0];
  const topLoser = rows.filter((r) => r.gainPct != null).sort((a, b) => (a.gainPct! - b.gainPct!))[0];
  const avgGain = rows.filter((r) => r.gainPct != null).reduce((s, r, _, arr) => s + r.gainPct! / arr.length, 0);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-6 md:py-10">
        <div className="mb-6">
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-foreground mb-2 flex items-center gap-2">
            <Award className="h-7 w-7 text-primary" />
            IPO Performance Tracker
          </h1>
          <p className="text-sm text-muted-foreground max-w-3xl">
            Post-listing performance of Indian IPOs. Track listing-day gains, best and worst performers, and historical returns by year.
          </p>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="text-xs uppercase text-muted-foreground tracking-wider mb-1">Best Performer</div>
            {topGainer ? (
              <>
                <div className="font-semibold text-foreground text-sm truncate">{topGainer.ipo.name}</div>
                <div className="text-2xl font-bold text-gain tabular-nums">+{topGainer.gainPct!.toFixed(1)}%</div>
              </>
            ) : (
              <div className="text-sm text-muted-foreground">—</div>
            )}
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="text-xs uppercase text-muted-foreground tracking-wider mb-1">Worst Performer</div>
            {topLoser ? (
              <>
                <div className="font-semibold text-foreground text-sm truncate">{topLoser.ipo.name}</div>
                <div className="text-2xl font-bold text-loss tabular-nums">{topLoser.gainPct!.toFixed(1)}%</div>
              </>
            ) : (
              <div className="text-sm text-muted-foreground">—</div>
            )}
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="text-xs uppercase text-muted-foreground tracking-wider mb-1">Average Listing Gain</div>
            <div className={`text-2xl font-bold tabular-nums ${avgGain >= 0 ? "text-gain" : "text-loss"}`}>
              {avgGain >= 0 ? "+" : ""}
              {avgGain.toFixed(1)}%
            </div>
            <div className="text-xs text-muted-foreground">across {rows.length} listings</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-4 sticky top-16 z-20 bg-background/95 backdrop-blur py-2 border-b border-border">
          <select value={year} onChange={(e) => setYear(e.target.value)} className="rounded-md border border-border bg-card px-3 py-1.5 text-sm">
            <option value="all">All Years</option>
            {years.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
          <div className="inline-flex rounded-md border border-border overflow-hidden">
            {(["all", "mainline", "sme"] as const).map((k) => (
              <button
                key={k}
                onClick={() => setExchange(k)}
                className={`px-3 py-1.5 text-sm capitalize transition-colors ${exchange === k ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:bg-accent"}`}
              >
                {k === "all" ? "All" : k === "sme" ? "SME" : "Mainline"}
              </button>
            ))}
          </div>
          <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)} className="rounded-md border border-border bg-card px-3 py-1.5 text-sm">
            <option value="gain_desc">Highest Gain</option>
            <option value="gain_asc">Lowest Gain</option>
            <option value="date_desc">Latest Listed</option>
          </select>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : rows.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">No listed IPOs match your filters.</div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto rounded-lg border border-border bg-card shadow-xs">
              <table className="finance-table w-full">
                <thead>
                  <tr>
                    <th>IPO</th>
                    <th>Listed On</th>
                    <th>Issue Price</th>
                    <th>Listing Price</th>
                    <th>Listing Gain</th>
                    <th>Type</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map(({ ipo, priceHigh, listPrice, gainPct, isSme }) => (
                    <tr key={ipo.id}>
                      <td>
                        <Link to={`/ipo/${ipo.slug}`} className="font-medium text-foreground hover:text-primary transition-colors">
                          {ipo.name}
                        </Link>
                      </td>
                      <td className="text-muted-foreground text-sm">{ipo.listing_date ? new Date(ipo.listing_date).toLocaleDateString("en-IN") : "—"}</td>
                      <td className="tabular-nums">₹{priceHigh}</td>
                      <td className="tabular-nums">{listPrice != null ? `₹${listPrice}` : "—"}</td>
                      <td>
                        {gainPct != null ? (
                          <span className={`inline-flex items-center gap-1 font-bold tabular-nums ${gainPct >= 0 ? "text-gain" : "text-loss"}`}>
                            {gainPct >= 0 ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                            {gainPct >= 0 ? "+" : ""}{gainPct.toFixed(2)}%
                          </span>
                        ) : "—"}
                      </td>
                      <td>
                        <span className={`inline-flex px-2 py-0.5 rounded text-[11px] font-medium ${isSme ? "bg-amber-500/10 text-amber-600" : "bg-primary/10 text-primary"}`}>
                          {isSme ? "SME" : "Mainline"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden space-y-3">
              {rows.map(({ ipo, priceHigh, listPrice, gainPct, isSme }) => (
                <Link key={ipo.id} to={`/ipo/${ipo.slug}`} className="block rounded-lg border border-border bg-card p-4 hover:border-primary/50 transition-colors">
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <div className="font-semibold text-foreground text-sm flex-1">{ipo.name}</div>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${isSme ? "bg-amber-500/10 text-amber-600" : "bg-primary/10 text-primary"}`}>
                      {isSme ? "SME" : "Mainline"}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <div className="text-muted-foreground">Issue</div>
                      <div className="font-medium tabular-nums">₹{priceHigh}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Listed</div>
                      <div className="font-medium tabular-nums">{listPrice != null ? `₹${listPrice}` : "—"}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Gain</div>
                      <div className={`font-bold tabular-nums ${gainPct != null && gainPct >= 0 ? "text-gain" : "text-loss"}`}>
                        {gainPct != null ? `${gainPct >= 0 ? "+" : ""}${gainPct.toFixed(1)}%` : "—"}
                      </div>
                    </div>
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-2">
                    {ipo.listing_date ? `Listed ${new Date(ipo.listing_date).toLocaleDateString("en-IN")}` : ""}
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default IPOPerformance;
