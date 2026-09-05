import { Link } from '@/lib/router-compat';
import { ArrowRight, Calculator, TrendingUp } from 'lucide-react';
import type { IPORow } from '@/hooks/useIPOData';

interface Props {
  relatedIPOs: IPORow[];
  currentSlug: string;
}

const IPORelatedLinks = ({ relatedIPOs, currentSlug }: Props) => {
  const filtered = relatedIPOs.filter(i => i.slug !== currentSlug).slice(0, 6);

  return (
    <>
      {/* Calculator Links */}
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        <Link
          to="/ipo-allotment-calculator"
          className="flex items-center gap-3 bg-card border border-border rounded-lg p-4 hover:border-primary/50 transition-colors group"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-info/10">
            <Calculator className="h-5 w-5 text-info" />
          </div>
          <div>
            <div className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">Allotment Calculator</div>
            <div className="text-xs text-muted-foreground">Estimate your allotment chances</div>
          </div>
        </Link>
        <Link
          to="/ipo-listing-gain-calculator"
          className="flex items-center gap-3 bg-card border border-border rounded-lg p-4 hover:border-primary/50 transition-colors group"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gain/10">
            <TrendingUp className="h-5 w-5 text-gain" />
          </div>
          <div>
            <div className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">Listing Gain Calculator</div>
            <div className="text-xs text-muted-foreground">Estimate profit from GMP</div>
          </div>
        </Link>
      </section>

      {/* Related IPOs */}
      {filtered.length > 0 && (
        <section className="bg-card border border-border rounded-lg p-5 mb-6">
          <h2 className="font-serif text-lg font-bold text-foreground mb-3">Related IPOs</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {filtered.map(ipo => (
              <Link
                key={ipo.id}
                to={`/ipo/${ipo.slug}`}
                className="flex items-center justify-between p-3 rounded-md bg-background hover:bg-accent transition-colors group"
              >
                <div>
                  <div className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{ipo.name}</div>
                  <div className="text-xs text-muted-foreground">₹{Number(ipo.price_band_high)} · {ipo.status}</div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </Link>
            ))}
          </div>
          <div className="flex gap-3 mt-4 pt-3 border-t border-border">
            <Link to="/upcoming-ipo" className="text-sm text-primary hover:underline">Upcoming IPOs →</Link>
            <Link to="/ipo-gmp-list" className="text-sm text-primary hover:underline">All GMP List →</Link>
          </div>
        </section>
      )}
    </>
  );
};

export default IPORelatedLinks;
