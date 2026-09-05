import { siteOrigin } from '@/lib/utils';
import { useMemo } from 'react';
import { Link } from '@/lib/router-compat';
import { useIPOs, useLatestGMP, formatCurrency } from '@/hooks/useIPOData';
import { Loader2 } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import StatusBadge from '@/components/StatusBadge';

const UpcomingIPO = () => {
  const { data: ipos = [], isLoading } = useIPOs();
  const upcoming = useMemo(() => ipos.filter(i => i.status === 'upcoming' || i.status === 'open'), [ipos]);
  const ipoIds = useMemo(() => upcoming.map(i => i.id), [upcoming]);
  const { data: gmpMap = {} } = useLatestGMP(ipoIds);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SEOHead
        title="Upcoming IPOs 2025 | New IPO List India"
        description="Complete list of upcoming IPOs in India for 2025. Check opening dates, price bands, GMP and lot sizes for NSE & BSE IPOs."
        canonical={`${siteOrigin()}/upcoming-ipo`}
      />
      <Header />
      <main className="flex-1 container mx-auto px-4 py-6 md:py-10">
        <h1 className="font-serif text-2xl md:text-3xl font-bold text-foreground mb-2">Upcoming IPOs in India</h1>
        <p className="text-sm text-muted-foreground mb-6">Complete list of upcoming and open IPOs on NSE & BSE.</p>

        {isLoading ? (
          <div className="flex items-center justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : upcoming.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">No upcoming IPOs at the moment.</div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-border bg-card shadow-xs">
            <table className="finance-table w-full">
              <thead>
                <tr>
                  <th>IPO Name</th>
                  <th>Price Band</th>
                  <th>GMP (₹)</th>
                  <th>Lot Size</th>
                  <th>Open Date</th>
                  <th>Close Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {upcoming.map(ipo => {
                  const gmp = gmpMap[ipo.id] ?? 0;
                  return (
                    <tr key={ipo.id}>
                      <td><Link to={`/ipo/${ipo.slug}`} className="font-medium text-foreground hover:text-primary transition-colors">{ipo.name}</Link></td>
                      <td className="whitespace-nowrap">₹{Number(ipo.price_band_low)} - ₹{Number(ipo.price_band_high)}</td>
                      <td><span className={gmp >= 0 ? 'gmp-positive' : 'gmp-negative'}>{gmp >= 0 ? '+' : ''}₹{gmp}</span></td>
                      <td>{ipo.lot_size}</td>
                      <td className="whitespace-nowrap">{new Date(ipo.open_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                      <td className="whitespace-nowrap">{new Date(ipo.close_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
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

export default UpcomingIPO;
