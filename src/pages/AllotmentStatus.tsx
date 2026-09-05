import { siteOrigin } from '@/lib/utils';
import { useMemo } from 'react';
import { Link } from '@/lib/router-compat';
import { useIPOs, formatCurrency } from '@/hooks/useIPOData';
import { Loader2 } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import StatusBadge from '@/components/StatusBadge';

const AllotmentStatus = () => {
  const { data: ipos = [], isLoading } = useIPOs();
  const listed = useMemo(() =>
    ipos.filter(i => i.status === 'listed' || i.status === 'closed').sort((a, b) => new Date(b.close_date).getTime() - new Date(a.close_date).getTime()),
    [ipos]
  );

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SEOHead
        title="IPO Allotment Status | Check IPO Allotment Result India"
        description="Check IPO allotment status and listing performance for recently closed and listed Indian IPOs. View listing price, gains and subscription data."
        canonical={`${siteOrigin()}/ipo-allotment-status`}
      />
      <Header />
      <main className="flex-1 container mx-auto px-4 py-6 md:py-10">
        <h1 className="font-serif text-2xl md:text-3xl font-bold text-foreground mb-2">IPO Allotment Status</h1>
        <p className="text-sm text-muted-foreground mb-6">Allotment results and listing performance for recently closed IPOs.</p>

        {isLoading ? (
          <div className="flex items-center justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : listed.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">No allotment data available.</div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-border bg-card shadow-xs">
            <table className="finance-table w-full">
              <thead>
                <tr>
                  <th>IPO Name</th>
                  <th>Close Date</th>
                  <th>Listing Date</th>
                  <th>Issue Price</th>
                  <th>Listing Price</th>
                  <th>Listing Gain</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {listed.map(ipo => (
                  <tr key={ipo.id}>
                    <td><Link to={`/ipo/${ipo.slug}`} className="font-medium text-foreground hover:text-primary transition-colors">{ipo.name}</Link></td>
                    <td className="whitespace-nowrap">{new Date(ipo.close_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</td>
                    <td className="whitespace-nowrap">{ipo.listing_date ? new Date(ipo.listing_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—'}</td>
                    <td className="whitespace-nowrap">{formatCurrency(Number(ipo.price_band_high))}</td>
                    <td className="whitespace-nowrap">{ipo.listing_price ? formatCurrency(Number(ipo.listing_price)) : '—'}</td>
                    <td>{ipo.listing_gain != null ? (
                      <span className={`font-semibold ${Number(ipo.listing_gain) >= 0 ? 'text-gain' : 'text-loss'}`}>
                        {Number(ipo.listing_gain) >= 0 ? '+' : ''}{Number(ipo.listing_gain).toFixed(1)}%
                      </span>
                    ) : '—'}</td>
                    <td><StatusBadge status={ipo.status as any} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default AllotmentStatus;
