import { siteOrigin } from '@/lib/utils';
import { useMemo } from 'react';
import { Link } from '@/lib/router-compat';
import { useIPOs, useLatestGMP, formatCurrency } from '@/hooks/useIPOData';
import { Loader2 } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import StatusBadge from '@/components/StatusBadge';

const IPOGMPList = () => {
  const { data: ipos = [], isLoading } = useIPOs();
  const ipoIds = useMemo(() => ipos.map(i => i.id), [ipos]);
  const { data: gmpMap = {} } = useLatestGMP(ipoIds);

  const sorted = useMemo(() =>
    [...ipos].sort((a, b) => (gmpMap[b.id] ?? 0) - (gmpMap[a.id] ?? 0)),
    [ipos, gmpMap]
  );

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SEOHead
        title="IPO GMP List Today | All IPO Grey Market Premium"
        description="Complete list of IPO Grey Market Premium (GMP) for all active and upcoming Indian IPOs. Updated daily with latest GMP rates."
        canonical={`${siteOrigin()}/ipo-gmp-list`}
      />
      <Header />
      <main className="flex-1 container mx-auto px-4 py-6 md:py-10">
        <h1 className="font-serif text-2xl md:text-3xl font-bold text-foreground mb-2">IPO GMP List Today</h1>
        <p className="text-sm text-muted-foreground mb-6">Latest Grey Market Premium for all active IPOs, sorted by GMP.</p>

        {isLoading ? (
          <div className="flex items-center justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-border bg-card shadow-xs">
            <table className="finance-table w-full">
              <thead>
                <tr>
                  <th>IPO Name</th>
                  <th>Price Band</th>
                  <th>GMP (₹)</th>
                  <th>GMP %</th>
                  <th>Est. Listing</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map(ipo => {
                  const gmp = gmpMap[ipo.id] ?? 0;
                  const pct = ((gmp / Number(ipo.price_band_high)) * 100).toFixed(1);
                  return (
                    <tr key={ipo.id}>
                      <td><Link to={`/ipo/${ipo.slug}`} className="font-medium text-foreground hover:text-primary transition-colors">{ipo.name}</Link></td>
                      <td className="whitespace-nowrap">₹{Number(ipo.price_band_low)} - ₹{Number(ipo.price_band_high)}</td>
                      <td><span className={gmp >= 0 ? 'gmp-positive' : 'gmp-negative'}>{gmp >= 0 ? '+' : ''}₹{gmp}</span></td>
                      <td className={gmp >= 0 ? 'text-gain' : 'text-loss'}>{gmp >= 0 ? '+' : ''}{pct}%</td>
                      <td className="font-medium whitespace-nowrap">{formatCurrency(Number(ipo.price_band_high) + gmp)}</td>
                      <td><StatusBadge status={ipo.status as any} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default IPOGMPList;
