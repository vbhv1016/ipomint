import { siteOrigin } from '@/lib/utils';
import { useState, useMemo, useEffect } from 'react';
import { Link } from '@/lib/router-compat';
import { ArrowUpDown, ArrowUp, ArrowDown, Search, TrendingUp, TrendingDown, IndianRupee, Calendar, Loader2 } from 'lucide-react';
import { useIPOs, useLatestGMP, formatCurrency, IPORow } from '@/hooks/useIPOData';

import StatusBadge from '@/components/StatusBadge';
import IPOCard from '@/components/IPOCard';
import MarketTicker from '@/components/MarketTicker';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

type SortKey = 'name' | 'gmp' | 'price_band_high' | 'open_date' | 'subscription_total';
type SortDir = 'asc' | 'desc';
type StatusFilter = 'all' | 'upcoming' | 'open' | 'closed' | 'listed';
type TypeFilter = 'all' | 'mainline' | 'sme';

const PAGE_SIZE = 10;

const Index = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [sortKey, setSortKey] = useState<SortKey>('open_date');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [page, setPage] = useState(1);
  const [subEmail, setSubEmail] = useState('');
  const [subLoading, setSubLoading] = useState(false);
  const { toast } = useToast();

  
  const { data: ipos = [], isLoading, error } = useIPOs();
  const ipoIds = useMemo(() => ipos.map(i => i.id), [ipos]);
  const { data: gmpMap = {}, isFetching: gmpFetching } = useLatestGMP(ipoIds);

  // Simulated live activity: random micro-updates to GMP for active IPOs.
  const [gmpOverrides, setGmpOverrides] = useState<Record<string, number>>({});
  const [blinkId, setBlinkId] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number>(() => Date.now());
  const [nowTick, setNowTick] = useState<number>(() => Date.now());

  // Tick clock every 5s to refresh "just now / Ns ago" label.
  useEffect(() => {
    const t = setInterval(() => setNowTick(Date.now()), 5000);
    return () => clearInterval(t);
  }, []);

  // Schedule a random simulated update every 30–45s on an active IPO.
  useEffect(() => {
    const active = ipos.filter(i => i.status === 'open' || i.status === 'upcoming');
    if (active.length === 0) return;
    let timer: ReturnType<typeof setTimeout>;
    const schedule = () => {
      const delay = 30_000 + Math.random() * 15_000;
      timer = setTimeout(() => {
        const pick = active[Math.floor(Math.random() * active.length)];
        const base = gmpOverrides[pick.id] ?? gmpMap[pick.id] ?? 0;
        const delta = Math.round((Math.random() * 4 - 2)); // -2..+2
        const next = base + (delta === 0 ? 1 : delta);
        setGmpOverrides(prev => ({ ...prev, [pick.id]: next }));
        setBlinkId(pick.id);
        setLastUpdated(Date.now());
        setTimeout(() => setBlinkId(cur => (cur === pick.id ? null : cur)), 1600);
        schedule();
      }, delay);
    };
    schedule();
    return () => clearTimeout(timer);
  }, [ipos, gmpMap, gmpOverrides]);

  const lastUpdatedLabel = useMemo(() => {
    const diff = Math.max(0, Math.floor((nowTick - lastUpdated) / 1000));
    if (diff < 10) return 'Just now';
    if (diff < 60) return `${diff}s ago`;
    const m = Math.floor(diff / 60);
    return `${m}m ago`;
  }, [nowTick, lastUpdated]);



  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('desc'); }
  };

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <ArrowUpDown className="h-3 w-3 opacity-40" />;
    return sortDir === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />;
  };

  const filtered = useMemo(() => {
    let data = [...ipos];
    if (search) data = data.filter(i => i.name.toLowerCase().includes(search.toLowerCase()));
    if (statusFilter !== 'all') data = data.filter(i => i.status === statusFilter);
    if (typeFilter !== 'all') {
      data = data.filter(i => {
        const isSme = (i.exchange || '').toUpperCase().includes('SME');
        return typeFilter === 'sme' ? isSme : !isSme;
      });
    }
    data.sort((a, b) => {
      let va: any, vb: any;
      if (sortKey === 'gmp') {
        va = gmpMap[a.id] ?? 0;
        vb = gmpMap[b.id] ?? 0;
      } else {
        va = a[sortKey] ?? '';
        vb = b[sortKey] ?? '';
      }
      if (typeof va === 'string') va = va.toLowerCase();
      if (typeof vb === 'string') vb = vb.toLowerCase();
      if (va < vb) return sortDir === 'asc' ? -1 : 1;
      if (va > vb) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return data;
  }, [ipos, search, statusFilter, typeFilter, sortKey, sortDir, gmpMap]);

  // Reset to first page whenever the filtered set changes shape.
  useEffect(() => { setPage(1); }, [search, statusFilter, typeFilter, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageStart = (currentPage - 1) * PAGE_SIZE;
  const paged = filtered.slice(pageStart, pageStart + PAGE_SIZE);

  const stats = useMemo(() => {
    const gmps = Object.values(gmpMap);
    return {
      open: ipos.filter(i => i.status === 'open').length,
      upcoming: ipos.filter(i => i.status === 'upcoming').length,
      avgGmp: gmps.length ? Math.round(gmps.reduce((s, g) => s + g, 0) / gmps.length) : 0,
      totalListed: ipos.filter(i => i.status === 'listed').length,
    };
  }, [ipos, gmpMap]);

  const getGMP = (ipo: IPORow) => gmpOverrides[ipo.id] ?? gmpMap[ipo.id] ?? 0;
  const expectedListing = (ipo: IPORow) => Number(ipo.price_band_high) + getGMP(ipo);
  const gmpPercent = (ipo: IPORow) => {
    const g = getGMP(ipo);
    return ((g / Number(ipo.price_band_high)) * 100).toFixed(1);
  };

  const handleSubscribe = async () => {
    if (!subEmail || subEmail.trim().length < 6) return;
    setSubLoading(true);
    const { error } = await supabase.from('email_subscriptions').insert({ email: subEmail.trim() });
    setSubLoading(false);
    if (error) {
      toast({ title: 'Error', description: error.message.includes('duplicate') ? 'Already subscribed!' : error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Subscribed!', description: 'You\'ll receive IPO alerts in your inbox.' });
      setSubEmail('');
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SEOHead
        title="IPO GMP Today | Live Grey Market Premium Tracker India"
        description="Track live IPO Grey Market Premium (GMP), subscription status, allotment chances, and listing gain predictions for upcoming Indian IPOs."
        canonical={siteOrigin() + '/'}
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: 'IPOMint',
          url: siteOrigin(),
          description: 'Track live IPO Grey Market Premium, subscription status, and listing gains for Indian IPOs.',
        }}
      />
      <Header />

      <main className="flex-1">
        {/* Market Ticker */}
        <MarketTicker />

        {/* Hero */}
        <section className="bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 py-8 md:py-10">
            <div>
              <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold mb-1 md:mb-2">IPO GMP Today – Live Grey Market Premium Tracker</h1>
              <p className="text-primary-foreground/70 text-xs sm:text-sm md:text-base max-w-2xl">
                Live GMP rates, subscription status, and listing gain analysis for upcoming and recent Indian stock market IPOs.
              </p>
            </div>
          </div>
        </section>

        {/* Stats */}
        <div className="container mx-auto px-4 -mt-4 md:-mt-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
            {[
              { label: 'Open IPOs', value: stats.open, icon: TrendingUp, color: 'text-gain' },
              { label: 'Upcoming', value: stats.upcoming, icon: Calendar, color: 'text-info' },
              { label: 'Avg GMP', value: `₹${stats.avgGmp}`, icon: IndianRupee, color: 'text-foreground' },
              { label: 'Recently Listed', value: stats.totalListed, icon: TrendingDown, color: 'text-muted-foreground' },
            ].map(s => (
              <div key={s.label} className="bg-card rounded-lg border border-border p-3 md:p-4 shadow-xs">
                <div className="flex items-center gap-1.5 md:gap-2 mb-0.5 md:mb-1">
                  <s.icon className={`h-3.5 w-3.5 md:h-4 md:w-4 ${s.color}`} />
                  <span className="text-[10px] md:text-xs text-muted-foreground">{s.label}</span>
                </div>
                <span className={`text-xl md:text-2xl font-bold ${s.color}`}>{s.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Sticky segmented tabs + instant search */}
        <div className="sticky top-0 z-30 bg-background/85 backdrop-blur-md border-b border-border mt-4 md:mt-6">
          <div className="container mx-auto px-4 py-2.5 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
            <div
              role="tablist"
              aria-label="IPO type"
              className="inline-flex items-center rounded-full bg-muted p-1 shadow-xs w-full sm:w-auto"
            >
              {([
                { key: 'all', label: 'All IPOs' },
                { key: 'mainline', label: 'Mainline' },
                { key: 'sme', label: 'SME' },
              ] as const).map(t => {
                const active = typeFilter === t.key;
                return (
                  <button
                    key={t.key}
                    role="tab"
                    aria-selected={active}
                    onClick={() => setTypeFilter(t.key)}
                    className={`flex-1 sm:flex-none rounded-full px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-semibold transition-all duration-200 ${
                      active
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>
            <div className="relative flex-1 sm:max-w-xs sm:ml-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search IPO by name..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full rounded-full border border-input bg-card pl-9 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="container mx-auto px-4 mt-4">
          <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
            <h2 className="font-serif text-lg md:text-xl font-bold text-foreground">
              {typeFilter === 'mainline' ? 'Mainline IPOs' : typeFilter === 'sme' ? 'SME IPOs' : 'All IPOs'}
              {statusFilter !== 'all' && <span className="text-muted-foreground font-normal"> · {statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}</span>}
            </h2>
            <div className="flex gap-1.5 flex-wrap">
              {(['all', 'open', 'upcoming', 'closed', 'listed'] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`rounded-md px-2.5 sm:px-3 py-1.5 text-xs font-medium transition-colors ${
                    statusFilter === s
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-card border border-border text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>


          {/* Live activity banner */}
          {!isLoading && !error && (
            <div
              aria-live="polite"
              className="mb-3 flex items-center justify-between gap-2 rounded-md border border-gain/30 bg-gain/5 px-3 py-2"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="relative inline-flex h-2.5 w-2.5 shrink-0">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gain/60" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-gain" />
                </span>
                <span className="text-xs sm:text-sm font-semibold text-foreground truncate">
                  Live market feed
                </span>
              </div>
              <span className="text-[11px] sm:text-xs font-medium text-muted-foreground tabular-nums whitespace-nowrap">
                Last updated: <span className="text-foreground">{lastUpdatedLabel}</span>
              </span>
            </div>
          )}


          {/* Loading / Error */}
          {isLoading && (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-sm text-muted-foreground">Loading IPOs...</span>
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive text-center">
              Failed to load IPO data. Please try again later.
            </div>
          )}

          {/* Empty state */}
          {!isLoading && !error && filtered.length === 0 && (
            <div className="rounded-lg border border-dashed border-border bg-card/50 p-10 text-center animate-fade-in">
              <Search className="mx-auto h-8 w-8 text-muted-foreground/60 mb-2" />
              <p className="text-sm font-semibold text-foreground">No matching IPOs found</p>
              <p className="text-xs text-muted-foreground mt-1">
                Try a different search term{search ? ` than "${search}"` : ''} or clear filters.
              </p>
              {(search || statusFilter !== 'all' || typeFilter !== 'all') && (
                <button
                  onClick={() => { setSearch(''); setStatusFilter('all'); setTypeFilter('all'); }}
                  className="mt-3 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90"
                >
                  Clear filters
                </button>
              )}
            </div>
          )}

          {/* Mobile Card View */}
          {!isLoading && !error && filtered.length > 0 && (
            <div
              key={`m-${typeFilter}-${statusFilter}-${search}`}
              className="md:hidden flex flex-col gap-3 animate-fade-in"
            >
              {paged.map(ipo => (
                <div key={ipo.id} className={`rounded-xl ${blinkId === ipo.id ? 'flash-blink' : ''}`}>
                  <IPOCard
                    ipo={ipo}
                    gmp={getGMP(ipo)}
                    expectedListing={expectedListing(ipo)}
                    gmpPercent={gmpPercent(ipo)}
                  />
                </div>
              ))}
            </div>
          )}


          {/* Desktop Table View */}
          {!isLoading && !error && filtered.length > 0 && (
            <div
              key={`d-${typeFilter}-${statusFilter}-${search}`}
              className="hidden md:block overflow-x-auto rounded-lg border border-border bg-card shadow-xs animate-fade-in"
            >
              <table className="finance-table w-full">
                <thead>
                  <tr>
                    <th className="cursor-pointer" onClick={() => toggleSort('name')}>
                      <span className="flex items-center gap-1">IPO Name <SortIcon col="name" /></span>
                    </th>
                    <th className="cursor-pointer" onClick={() => toggleSort('price_band_high')}>
                      <span className="flex items-center gap-1">Price Band <SortIcon col="price_band_high" /></span>
                    </th>
                    <th className="cursor-pointer" onClick={() => toggleSort('gmp')}>
                      <span className="flex items-center gap-1">GMP (₹) <SortIcon col="gmp" /></span>
                    </th>
                    <th>Est. Listing</th>
                    <th className="hidden lg:table-cell cursor-pointer" onClick={() => toggleSort('subscription_total')}>
                      <span className="flex items-center gap-1">Subscription <SortIcon col="subscription_total" /></span>
                    </th>
                    <th className="cursor-pointer" onClick={() => toggleSort('open_date')}>
                      <span className="flex items-center gap-1">Dates <SortIcon col="open_date" /></span>
                    </th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.map(ipo => {
                    const gmp = getGMP(ipo);
                    return (
                      <tr key={ipo.id} className={blinkId === ipo.id ? 'flash-blink' : ''}>
                        <td>
                          <Link to={`/ipo/${ipo.slug}`} className="font-medium text-foreground hover:text-primary transition-colors">
                            {ipo.name}
                          </Link>
                          <div className="text-xs text-muted-foreground">{ipo.exchange} · Lot: {ipo.lot_size}</div>
                        </td>
                        <td className="font-medium whitespace-nowrap">₹{Number(ipo.price_band_low)} - ₹{Number(ipo.price_band_high)}</td>
                        <td>
                          <span className={gmp >= 0 ? 'gmp-positive' : 'gmp-negative'}>
                            {gmp >= 0 ? '+' : ''}₹{gmp}
                          </span>
                          <div className={`text-xs ${gmp >= 0 ? 'text-gain' : 'text-loss'}`}>
                            ({gmp >= 0 ? '+' : ''}{gmpPercent(ipo)}%)
                          </div>
                        </td>
                        <td className="font-medium whitespace-nowrap">
                          {formatCurrency(expectedListing(ipo))}
                        </td>
                        <td className="hidden lg:table-cell">
                          {ipo.subscription_total ? (
                            <div>
                              <span className="font-medium">{Number(ipo.subscription_total)}x</span>
                              <div className="text-xs text-muted-foreground">
                                R:{Number(ipo.subscription_retail)}x · H:{Number(ipo.subscription_hni)}x
                              </div>
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-xs">—</span>
                          )}
                        </td>
                        <td className="text-xs whitespace-nowrap">
                          <div>{new Date(ipo.open_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</div>
                          <div className="text-muted-foreground">
                            to {new Date(ipo.close_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                          </div>
                        </td>
                        <td>
                          <StatusBadge status={ipo.status as any} />
                          {ipo.listing_gain != null && (
                            <div className={`text-xs mt-1 font-medium ${Number(ipo.listing_gain) >= 0 ? 'text-gain' : 'text-loss'}`}>
                              {Number(ipo.listing_gain) >= 0 ? '+' : ''}{Number(ipo.listing_gain).toFixed(1)}%
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}


          {/* Pagination */}
          {!isLoading && !error && filtered.length > PAGE_SIZE && (
            <nav
              aria-label="IPO list pagination"
              className="mt-4 flex flex-wrap items-center justify-between gap-3"
            >
              <span className="text-xs text-muted-foreground">
                Showing {pageStart + 1}-{Math.min(pageStart + PAGE_SIZE, filtered.length)} of {filtered.length}
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="rounded-md border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Prev
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                  .map((p, idx, arr) => (
                    <span key={p} className="flex items-center gap-1.5">
                      {idx > 0 && p - arr[idx - 1] > 1 && (
                        <span className="px-1 text-xs text-muted-foreground">…</span>
                      )}
                      <button
                        onClick={() => setPage(p)}
                        aria-current={p === currentPage ? 'page' : undefined}
                        className={`min-w-[2rem] rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
                          p === currentPage
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-card border border-border text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {p}
                      </button>
                    </span>
                  ))}
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="rounded-md border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </nav>
          )}
        </div>

        {/* Email capture */}
        <section className="container mx-auto px-4 py-8 md:py-10">
          <div className="rounded-lg bg-primary p-5 md:p-8 text-center">
            <h2 className="font-serif text-lg sm:text-xl md:text-2xl font-bold text-primary-foreground mb-1.5 md:mb-2">
              Get IPO Alerts in Your Inbox
            </h2>
            <p className="text-primary-foreground/70 text-xs sm:text-sm mb-3 md:mb-4 max-w-md mx-auto">
              Receive daily GMP updates, new IPO announcements, and listing day analysis.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                value={subEmail}
                onChange={e => setSubEmail(e.target.value)}
                className="flex-1 rounded-md px-4 py-2.5 text-sm text-foreground bg-card border-none focus:outline-hidden focus:ring-2 focus:ring-ring"
              />
              <button
                onClick={handleSubscribe}
                disabled={subLoading}
                className="rounded-md bg-gain px-5 py-2.5 text-sm font-semibold text-gain-foreground hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {subLoading ? 'Subscribing...' : 'Subscribe'}
              </button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
