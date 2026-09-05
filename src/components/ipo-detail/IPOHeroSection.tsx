import { Link } from '@/lib/router-compat';
import { Calculator } from 'lucide-react';
import StatusBadge from '@/components/StatusBadge';
import { formatCurrency } from '@/hooks/useIPOData';
import type { IPORow } from '@/hooks/useIPOData';

interface Props {
  ipo: IPORow;
  latestGmp: number;
  expectedListing: number;
  gmpPercent: string;
}

const IPOHeroSection = ({ ipo, latestGmp, expectedListing, gmpPercent }: Props) => {
  const calcUrl = `/ipo-listing-gain-calculator?price=${Number(ipo.price_band_high)}&gmp=${latestGmp}&lotSize=${ipo.lot_size}&lots=1`;

  return (
    <section className="mb-8">
      <div className="flex items-center gap-3 mb-2">
        <h1 className="font-serif text-2xl md:text-3xl font-bold text-foreground">
          {ipo.name} IPO GMP Today
        </h1>
        <StatusBadge status={ipo.status as any} />
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        {ipo.exchange} · Lot Size: {ipo.lot_size} shares · Price Band: ₹{Number(ipo.price_band_low)} – ₹{Number(ipo.price_band_high)}
      </p>
      <div className="flex flex-wrap gap-3">
        <div className="bg-card border border-border rounded-lg p-4 text-center min-w-[120px]">
          <div className="text-xs text-muted-foreground mb-1">GMP Today</div>
          <div className={`text-2xl font-bold ${latestGmp >= 0 ? 'text-gain' : 'text-loss'}`}>
            {latestGmp >= 0 ? '+' : ''}₹{latestGmp}
          </div>
          <div className={`text-xs ${latestGmp >= 0 ? 'text-gain' : 'text-loss'}`}>({gmpPercent}%)</div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4 text-center min-w-[120px]">
          <div className="text-xs text-muted-foreground mb-1">Est. Listing Price</div>
          <div className="text-2xl font-bold text-foreground">{formatCurrency(expectedListing)}</div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4 text-center min-w-[120px]">
          <div className="text-xs text-muted-foreground mb-1">Min Investment</div>
          <div className="text-2xl font-bold text-foreground">{formatCurrency(ipo.lot_size * Number(ipo.price_band_high))}</div>
        </div>
      </div>
      <div className="mt-4">
        <Link
          to={calcUrl}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Calculator className="h-4 w-4" />
          Calculate Listing Gain
        </Link>
      </div>
    </section>
  );
};

export default IPOHeroSection;
