import { siteOrigin } from '@/lib/utils';
import { useMemo, useEffect, useState } from 'react';
import { Link } from '@/lib/router-compat';
import { useIPOs } from '@/hooks/useIPOData';
import { Loader2, Users, Activity } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import StatusBadge from '@/components/StatusBadge';

const SubscriptionStatus = () => {
  const { data: ipos = [], isLoading, refetch } = useIPOs();
  const [lastPing, setLastPing] = useState<number>(Date.now());

  // Auto-refresh every 45s
  useEffect(() => {
    const id = setInterval(() => {
      refetch();
      setLastPing(Date.now());
    }, 45000);
    return () => clearInterval(id);
  }, [refetch]);

  const withSub = useMemo(() =>
    ipos
      .filter(i => i.subscription_total != null && i.status === 'open')
      .sort((a, b) => Number(b.subscription_total) - Number(a.subscription_total)),
    [ipos]
  );

  const secsAgo = Math.floor((Date.now() - lastPing) / 1000);
  const rel = secsAgo < 5 ? 'Just now' : `${secsAgo}s ago`;

  const barColor = (x: number) =>
    x >= 10 ? 'bg-gain' : x >= 3 ? 'bg-primary' : x >= 1 ? 'bg-amber-500' : 'bg-muted-foreground';

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SEOHead
        title="Live IPO Subscription Status | Retail, HNI, QIB Data"
        description="Live IPO subscription data for Retail, HNI, QIB categories. Real-time × subscribed for all open Indian IPOs, updated every 45s."
        canonical={`${siteOrigin()}/ipo-subscription-status`}
      />
      <Header />
      <main className="flex-1 container mx-auto px-4 py-6 md:py-10">
        <h1 className="font-serif text-2xl md:text-3xl font-bold text-foreground mb-2 flex items-center gap-2">
          <Users className="h-7 w-7 text-primary" />
          Live IPO Subscription Status
        </h1>
        <p className="text-sm text-muted-foreground mb-4">Live subscription data across Retail, HNI, and QIB investor categories for currently open IPOs.</p>

        {/* Live indicator */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4 bg-card border border-border rounded-md px-3 py-2 w-fit">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gain opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-gain"></span>
          </span>
          <Activity className="h-3.5 w-3.5" />
          <span>Live feed · Updated {rel}</span>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : withSub.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No open IPOs with live subscription data right now. Check back during IPO subscription windows.
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto rounded-lg border border-border bg-card shadow-xs">
              <table className="finance-table w-full">
                <thead>
                  <tr>
                    <th>IPO Name</th>
                    <th>Retail</th>
                    <th>HNI</th>
                    <th>QIB</th>
                    <th>Total</th>
                    <th>Progress</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {withSub.map(ipo => {
                    const total = Number(ipo.subscription_total ?? 0);
                    const pct = Math.min(100, (total / 20) * 100);
                    return (
                      <tr key={ipo.id}>
                        <td>
                          <Link to={`/ipo/${ipo.slug}`} className="font-medium text-foreground hover:text-primary transition-colors">
                            {ipo.name}
                          </Link>
                        </td>
                        <td className="font-medium tabular-nums">{ipo.subscription_retail ? `${Number(ipo.subscription_retail)}x` : '—'}</td>
                        <td className="font-medium tabular-nums">{ipo.subscription_hni ? `${Number(ipo.subscription_hni)}x` : '—'}</td>
                        <td className="font-medium tabular-nums">{ipo.subscription_qib ? `${Number(ipo.subscription_qib)}x` : '—'}</td>
                        <td className="font-bold tabular-nums">{total}x</td>
                        <td className="min-w-[120px]">
                          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                            <div className={`h-full ${barColor(total)} transition-all duration-500`} style={{ width: `${pct}%` }} />
                          </div>
                        </td>
                        <td><StatusBadge status={ipo.status as any} /></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden space-y-3">
              {withSub.map(ipo => {
                const total = Number(ipo.subscription_total ?? 0);
                const pct = Math.min(100, (total / 20) * 100);
                return (
                  <Link key={ipo.id} to={`/ipo/${ipo.slug}`} className="block rounded-lg border border-border bg-card p-4 hover:border-primary/50 transition-colors">
                    <div className="flex items-start justify-between mb-3 gap-2">
                      <div className="font-semibold text-foreground text-sm">{ipo.name}</div>
                      <StatusBadge status={ipo.status as any} />
                    </div>
                    <div className="mb-3">
                      <div className="flex justify-between items-baseline mb-1">
                        <span className="text-xs text-muted-foreground uppercase tracking-wider">Total Subscribed</span>
                        <span className="font-bold text-2xl text-foreground tabular-nums">{total}x</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className={`h-full ${barColor(total)} transition-all duration-500`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <div className="text-muted-foreground">Retail</div>
                        <div className="font-medium tabular-nums">{ipo.subscription_retail ? `${Number(ipo.subscription_retail)}x` : '—'}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">HNI</div>
                        <div className="font-medium tabular-nums">{ipo.subscription_hni ? `${Number(ipo.subscription_hni)}x` : '—'}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">QIB</div>
                        <div className="font-medium tabular-nums">{ipo.subscription_qib ? `${Number(ipo.subscription_qib)}x` : '—'}</div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default SubscriptionStatus;
