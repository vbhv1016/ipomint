import { useEffect, useRef, useState } from 'react';
import { Link } from '@/lib/router-compat';
import StatusBadge from '@/components/StatusBadge';
import { formatCurrency, IPORow } from '@/hooks/useIPOData';

interface IPOCardProps {
  ipo: IPORow;
  gmp: number;
  expectedListing: number;
  gmpPercent: string;
}

const IPOCard = ({ ipo, gmp, expectedListing, gmpPercent }: IPOCardProps) => {
  const prevGmp = useRef<number>(gmp);
  const [flash, setFlash] = useState<'up' | 'down' | null>(null);

  useEffect(() => {
    if (prevGmp.current !== gmp) {
      setFlash(gmp > prevGmp.current ? 'up' : 'down');
      prevGmp.current = gmp;
      const t = setTimeout(() => setFlash(null), 1200);
      return () => clearTimeout(t);
    }
  }, [gmp]);

  const positive = gmp >= 0;
  const isLive = ipo.status === 'open' || ipo.status === 'upcoming';

  return (
    <Link
      to={`/ipo/${ipo.slug}`}
      className="block rounded-xl border border-border bg-card p-4 shadow-xs hover:shadow-md transition-shadow active:scale-[0.99]"
    >
      {/* Header row */}
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2 mb-3">
        <div className="min-w-0">
          <h3 className="font-semibold text-foreground text-[15px] leading-tight truncate">{ipo.name}</h3>
          <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
            {ipo.exchange} · Lot {ipo.lot_size} · ₹{Number(ipo.price_band_low)}–{Number(ipo.price_band_high)}
          </p>
        </div>
        <span
          className={`shrink-0 rounded-md px-2 py-1 text-[11px] font-bold tabular-nums border ${
            positive
              ? 'bg-gain/10 border-gain/30 text-gain'
              : 'bg-loss/10 border-loss/30 text-loss'
          }`}
          aria-label="Expected gain percent"
        >
          {positive ? '+' : ''}{gmpPercent}%
        </span>
      </div>

      {/* GMP hero */}
      <div
        className={`rounded-lg border ${positive ? 'border-gain/25 bg-gain/5' : 'border-loss/25 bg-loss/5'} px-3 py-2.5 mb-3 ${
          flash === 'up' ? 'flash-up' : flash === 'down' ? 'flash-down' : ''
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">GMP</span>
            {isLive && (
              <span className="flex items-center gap-1">
                <span className={`h-1.5 w-1.5 rounded-full ${positive ? 'bg-gain' : 'bg-loss'} live-dot`} />
                <span className="text-[9px] uppercase tracking-wider font-semibold text-muted-foreground">Live</span>
              </span>
            )}
          </div>
          <StatusBadge status={ipo.status as any} />
        </div>
        <div className="flex items-baseline justify-between mt-1">
          <span className={`text-2xl font-bold tabular-nums ${positive ? 'text-gain' : 'text-loss'}`}>
            {positive ? '+' : ''}₹{gmp}
          </span>
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Est. Listing</div>
            <div className="text-sm font-semibold text-foreground tabular-nums">{formatCurrency(expectedListing)}</div>
          </div>
        </div>
      </div>


      {/* Footer meta */}
      <div className="flex items-center justify-between text-[11px]">
        <span className="text-muted-foreground">
          {new Date(ipo.open_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} – {new Date(ipo.close_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
        </span>
        {ipo.subscription_total ? (
          <span className="font-semibold text-foreground tabular-nums">{Number(ipo.subscription_total)}x subscribed</span>
        ) : ipo.listing_gain != null ? (
          <span className={`font-semibold tabular-nums ${Number(ipo.listing_gain) >= 0 ? 'text-gain' : 'text-loss'}`}>
            {Number(ipo.listing_gain) >= 0 ? '+' : ''}{Number(ipo.listing_gain).toFixed(1)}% listing
          </span>
        ) : null}
      </div>
    </Link>
  );
};

export default IPOCard;
