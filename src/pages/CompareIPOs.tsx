import { siteOrigin } from '@/lib/utils';
import { useState, useMemo } from 'react';
import { Link } from '@/lib/router-compat';
import { X, Plus, Search, GitCompareArrows } from 'lucide-react';
import { useIPOs, useLatestGMP, formatCurrency, IPORow } from '@/hooks/useIPOData';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';

const MAX_COMPARE = 4;

const getGMP = (ipo: IPORow, gmpMap: Record<string, number>) => gmpMap[ipo.id] ?? 0;
const expectedListing = (ipo: IPORow, gmpMap: Record<string, number>) =>
  Number(ipo.price_band_high) + getGMP(ipo, gmpMap);
const gmpPercent = (ipo: IPORow, gmpMap: Record<string, number>) =>
  ((getGMP(ipo, gmpMap) / Number(ipo.price_band_high)) * 100).toFixed(1);

const buildMetrics = (gmpMap: Record<string, number>) => [
  { label: 'Exchange', render: (ipo: IPORow) => ipo.exchange },
  {
    label: 'Price Band',
    render: (ipo: IPORow) => `₹${Number(ipo.price_band_low)} – ₹${Number(ipo.price_band_high)}`,
  },
  { label: 'Lot Size', render: (ipo: IPORow) => ipo.lot_size },
  {
    label: 'Min Investment',
    render: (ipo: IPORow) => formatCurrency(Number(ipo.price_band_high) * ipo.lot_size),
  },
  {
    label: 'GMP (₹)',
    render: (ipo: IPORow) => {
      const g = getGMP(ipo, gmpMap);
      return (
        <span className={g >= 0 ? 'text-gain font-semibold' : 'text-loss font-semibold'}>
          {g >= 0 ? '+' : ''}₹{g}
          <span className="text-xs ml-1">({gmpPercent(ipo, gmpMap)}%)</span>
        </span>
      );
    },
  },
  {
    label: 'Est. Listing',
    render: (ipo: IPORow) => formatCurrency(expectedListing(ipo, gmpMap)),
  },
  {
    label: 'Status',
    render: (ipo: IPORow) => (
      <span className="capitalize font-medium">{ipo.status}</span>
    ),
  },
  {
    label: 'Open Date',
    render: (ipo: IPORow) =>
      new Date(ipo.open_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' }),
  },
  {
    label: 'Close Date',
    render: (ipo: IPORow) =>
      new Date(ipo.close_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' }),
  },
  {
    label: 'Listing Date',
    render: (ipo: IPORow) =>
      ipo.listing_date
        ? new Date(ipo.listing_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })
        : '—',
  },
  {
    label: 'Sub. Retail',
    render: (ipo: IPORow) => (ipo.subscription_retail != null ? `${Number(ipo.subscription_retail)}x` : '—'),
  },
  {
    label: 'Sub. HNI',
    render: (ipo: IPORow) => (ipo.subscription_hni != null ? `${Number(ipo.subscription_hni)}x` : '—'),
  },
  {
    label: 'Sub. QIB',
    render: (ipo: IPORow) => (ipo.subscription_qib != null ? `${Number(ipo.subscription_qib)}x` : '—'),
  },
  {
    label: 'Sub. Total',
    render: (ipo: IPORow) =>
      ipo.subscription_total != null ? (
        <span className="font-semibold">{Number(ipo.subscription_total)}x</span>
      ) : (
        '—'
      ),
  },
  {
    label: 'Listing Price',
    render: (ipo: IPORow) => (ipo.listing_price != null ? formatCurrency(Number(ipo.listing_price)) : '—'),
  },
  {
    label: 'Listing Gain',
    render: (ipo: IPORow) =>
      ipo.listing_gain != null ? (
        <span className={Number(ipo.listing_gain) >= 0 ? 'text-gain font-semibold' : 'text-loss font-semibold'}>
          {Number(ipo.listing_gain) >= 0 ? '+' : ''}
          {Number(ipo.listing_gain).toFixed(1)}%
        </span>
      ) : (
        '—'
      ),
  },
];

/* ── IPO Search Dropdown ── */
const IPOSearchDropdown = ({
  allIPOs,
  selectedIds,
  isLoading,
  onAdd,
}: {
  allIPOs: IPORow[];
  selectedIds: string[];
  isLoading: boolean;
  onAdd: (id: string) => void;
}) => {
  const [open, setOpen] = useState(false);
  const [term, setTerm] = useState('');

  const results = useMemo(() => {
    const pool = allIPOs.filter(i => !selectedIds.includes(i.id));
    if (!term) return pool.slice(0, 8);
    return pool.filter(i => i.name.toLowerCase().includes(term.toLowerCase())).slice(0, 8);
  }, [allIPOs, term, selectedIds]);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 rounded-lg border border-dashed border-border bg-card px-3 py-2 text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors"
      >
        <Plus className="h-3.5 w-3.5" />
        Add IPO
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute top-full mt-1 left-0 z-50 w-72 rounded-lg border border-border bg-card shadow-lg">
            <div className="p-2 border-b border-border">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <input
                  autoFocus
                  type="text"
                  placeholder="Search IPOs..."
                  value={term}
                  onChange={e => setTerm(e.target.value)}
                  className="w-full rounded-md border border-input bg-background pl-8 pr-3 py-1.5 text-sm focus:outline-hidden focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>
            <div className="max-h-52 overflow-y-auto p-1">
              {isLoading ? (
                <p className="text-xs text-muted-foreground text-center py-4">Loading...</p>
              ) : results.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">No IPOs found</p>
              ) : (
                results.map(ipo => (
                  <button
                    key={ipo.id}
                    onClick={() => {
                      onAdd(ipo.id);
                      setOpen(false);
                      setTerm('');
                    }}
                    className="w-full text-left rounded-md px-3 py-2 text-sm hover:bg-accent transition-colors"
                  >
                    <span className="font-medium text-foreground">{ipo.name}</span>
                    <span className="ml-2 text-xs text-muted-foreground">{ipo.exchange}</span>
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

/* ── Side-by-Side Compare Cards (Mobile) ── */
const CompareCardColumn = ({
  ipo,
  metrics,
  onRemove,
}: {
  ipo: IPORow;
  metrics: { label: string; render: (ipo: IPORow) => React.ReactNode }[];
  onRemove: () => void;
}) => (
  <div className="flex-1 min-w-0 rounded-lg border border-border bg-card shadow-xs overflow-hidden">
    <div className="flex items-center justify-between bg-primary px-2 py-2 sm:px-3">
      <Link
        to={`/ipo/${ipo.slug}`}
        className="text-xs sm:text-sm font-semibold text-primary-foreground hover:underline truncate"
      >
        {ipo.name}
      </Link>
      <button onClick={onRemove} className="text-primary-foreground/60 hover:text-destructive transition-colors shrink-0 ml-1">
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
    <div className="divide-y divide-border">
      {metrics.map(m => (
        <div key={m.label} className="px-2 py-2 sm:px-3 sm:py-2.5">
          <div className="text-[10px] sm:text-xs text-muted-foreground font-medium mb-0.5">{m.label}</div>
          <div className="text-xs sm:text-sm text-foreground font-medium truncate">{m.render(ipo)}</div>
        </div>
      ))}
    </div>
  </div>
);

/* ── Main Page ── */
const CompareIPOs = () => {
  const { data: allIPOs = [], isLoading } = useIPOs();
  const ipoIds = useMemo(() => allIPOs.map(i => i.id), [allIPOs]);
  const { data: gmpMap = {} } = useLatestGMP(ipoIds);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const selectedIPOs = useMemo(
    () => selectedIds.map(id => allIPOs.find(i => i.id === id)).filter(Boolean) as IPORow[],
    [selectedIds, allIPOs]
  );

  const metrics = useMemo(() => buildMetrics(gmpMap), [gmpMap]);

  const addIPO = (id: string) => {
    if (selectedIds.length < MAX_COMPARE && !selectedIds.includes(id)) {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const removeIPO = (id: string) => setSelectedIds(selectedIds.filter(i => i !== id));

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SEOHead
        title="Compare IPOs Side-by-Side | IPOMint"
        description="Compare multiple Indian IPOs side-by-side on GMP, subscription, price band, listing gains and more."
        canonical={siteOrigin() + '/compare'}
      />
      <Header />

      <main className="flex-1">
        <section className="bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 py-6 md:py-8">
            <div className="flex items-center gap-3 mb-2">
              <GitCompareArrows className="h-6 w-6 md:h-7 md:w-7" />
              <h1 className="font-serif text-xl md:text-3xl font-bold">Compare IPOs</h1>
            </div>
            <p className="text-primary-foreground/70 text-xs sm:text-sm max-w-xl">
              Select up to {MAX_COMPARE} IPOs to compare side-by-side on key metrics.
            </p>
          </div>
        </section>

        <div className="container mx-auto px-4 py-4 md:py-6">
          {/* Selection chips */}
          <div className="flex flex-wrap gap-2 mb-4 md:mb-6 items-center">
            {selectedIPOs.map(ipo => (
              <div
                key={ipo.id}
                className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 shadow-xs"
              >
                <Link to={`/ipo/${ipo.slug}`} className="text-xs sm:text-sm font-medium text-foreground hover:text-primary transition-colors truncate max-w-[140px] sm:max-w-none">
                  {ipo.name}
                </Link>
                <button onClick={() => removeIPO(ipo.id)} className="text-muted-foreground hover:text-destructive transition-colors shrink-0">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
            {selectedIds.length < MAX_COMPARE && (
              <IPOSearchDropdown allIPOs={allIPOs} selectedIds={selectedIds} isLoading={isLoading} onAdd={addIPO} />
            )}
          </div>

          {/* Empty state */}
          {selectedIPOs.length === 0 && (
            <div className="rounded-lg border border-dashed border-border bg-card p-8 md:p-12 text-center">
              <GitCompareArrows className="h-10 w-10 md:h-12 md:w-12 mx-auto text-muted-foreground/40 mb-3 md:mb-4" />
              <h2 className="font-serif text-base md:text-lg font-bold text-foreground mb-1">No IPOs Selected</h2>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Click "Add IPO" above to select IPOs for comparison.
              </p>
            </div>
          )}

          {selectedIPOs.length === 1 && (
            <div className="rounded-lg border border-border bg-card p-6 md:p-8 text-center">
              <p className="text-xs sm:text-sm text-muted-foreground">Select at least one more IPO to start comparing.</p>
            </div>
          )}

          {/* Mobile: side-by-side columns */}
          {selectedIPOs.length >= 2 && (
            <div className="md:hidden flex gap-2 overflow-x-auto pb-2">
              {selectedIPOs.map(ipo => (
                <CompareCardColumn key={ipo.id} ipo={ipo} metrics={metrics} onRemove={() => removeIPO(ipo.id)} />
              ))}
            </div>
          )}

          {/* Desktop: side-by-side table */}
          {selectedIPOs.length >= 2 && (
            <div className="hidden md:block overflow-x-auto rounded-lg border border-border bg-card shadow-xs">
              <table className="w-full text-sm border-collapse" style={{ minWidth: `${140 + 180 * selectedIPOs.length}px` }}>
                <thead>
                  <tr className="bg-primary text-primary-foreground">
                    <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider sticky left-0 bg-primary z-10 min-w-[140px] border-r border-primary-foreground/10">
                      Metric
                    </th>
                    {selectedIPOs.map(ipo => (
                      <th key={ipo.id} className="text-center px-4 py-3 text-xs font-semibold uppercase tracking-wider min-w-[180px]">
                        <Link to={`/ipo/${ipo.slug}`} className="hover:underline">
                          {ipo.name}
                        </Link>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {metrics.map((m, idx) => (
                    <tr key={m.label} className={`border-b border-border ${idx % 2 === 0 ? 'bg-muted/30' : 'bg-card'}`}>
                      <td className={`px-4 py-3 font-medium text-muted-foreground sticky left-0 z-10 border-r border-border whitespace-nowrap ${idx % 2 === 0 ? 'bg-muted/30' : 'bg-card'}`}>
                        {m.label}
                      </td>
                      {selectedIPOs.map(ipo => (
                        <td key={ipo.id} className="px-4 py-3 text-center text-foreground whitespace-nowrap">
                          {m.render(ipo)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CompareIPOs;
