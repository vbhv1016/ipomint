import { useState, useEffect, useRef, useCallback } from 'react';
import { TrendingUp, TrendingDown, Wifi, WifiOff, Clock, Zap } from 'lucide-react';
import { getMarketData } from '@/lib/market-data.functions';
import { subscribeQuotes } from '@/lib/yahoo-stream';

interface MarketIndex {
  name: string;
  value: number;
  change: number;
  changePercent: number;
}

type Dir = 'up' | 'down' | null;

const SYMBOLS: { symbol: string; name: string }[] = [
  { symbol: '^NSEI', name: 'NIFTY 50' },
  { symbol: '^NSEBANK', name: 'BANK NIFTY' },
  { symbol: '^BSESN', name: 'SENSEX' },
];

const SYMBOL_TO_NAME: Record<string, string> = Object.fromEntries(
  SYMBOLS.map((s) => [s.symbol, s.name]),
);

const MarketTicker = () => {
  const [indices, setIndices] = useState<MarketIndex[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [marketOpen, setMarketOpen] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [ticks, setTicks] = useState<Record<string, Dir>>({});
  const prevRef = useRef<Record<string, number>>({});
  const timerRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const streamingRef = useRef(false);

  const flash = useCallback((name: string, prev: number | undefined, next: number) => {
    if (prev === undefined || prev === next) return;
    const dir: Dir = next > prev ? 'up' : 'down';
    setTicks((t) => ({ ...t, [name]: dir }));
    clearTimeout(timerRef.current[name]);
    timerRef.current[name] = setTimeout(() => setTicks((t) => ({ ...t, [name]: null })), 800);
  }, []);

  const fetchMarketData = useCallback(async () => {
    try {
      const data = await getMarketData();
      if (data?.success && data.indices && data.indices.length > 0) {
        const next = data.indices.map((idx: MarketIndex) => ({
          name: idx.name,
          value: Math.round(idx.value * 100) / 100,
          change: Math.round(idx.change * 100) / 100,
          changePercent: Math.round(idx.changePercent * 100) / 100,
        }));
        next.forEach((idx) => {
          flash(idx.name, prevRef.current[idx.name], idx.value);
          prevRef.current[idx.name] = idx.value;
        });
        setIndices(next);
        setIsLive(true);
        setMarketOpen(data.marketOpen !== false);
      } else {
        setIsLive(false);
        setMarketOpen(data?.marketOpen !== false);
      }
      setLastUpdated(new Date());
    } catch {
      setIsLive(false);
    } finally {
      setLoading(false);
    }
  }, [flash]);

  // Baseline snapshot + REST fallback polling (only while the socket is down)
  useEffect(() => {
    let cancelled = false;
    let timeout: ReturnType<typeof setTimeout>;

    const loop = async () => {
      if (cancelled) return;
      const visible = typeof document === 'undefined' || document.visibilityState === 'visible';
      if (visible && !streamingRef.current) await fetchMarketData();
      if (cancelled) return;
      timeout = setTimeout(loop, marketOpen ? 5000 : 300000);
    };
    loop();

    const onVisible = () => {
      if (document.visibilityState === 'visible' && !streamingRef.current) fetchMarketData();
    };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [fetchMarketData, marketOpen]);

  // WebSocket live stream — pushes ticks with sub-second latency
  useEffect(() => {
    const handle = subscribeQuotes(
      SYMBOLS.map((s) => s.symbol),
      (q) => {
        const name = SYMBOL_TO_NAME[q.id];
        if (!name || typeof q.price !== 'number') return;
        const value = Math.round(q.price * 100) / 100;

        setIndices((prev) => {
          const existing = prev.find((p) => p.name === name);
          flash(name, prevRef.current[name], value);
          prevRef.current[name] = value;

          const merged: MarketIndex = {
            name,
            value,
            change:
              typeof q.change === 'number'
                ? Math.round(q.change * 100) / 100
                : (existing?.change ?? 0),
            changePercent:
              typeof q.changePercent === 'number'
                ? Math.round(q.changePercent * 100) / 100
                : (existing?.changePercent ?? 0),
          };

          const next = existing
            ? prev.map((p) => (p.name === name ? merged : p))
            : [...prev, merged];
          return next.sort(
            (a, b) =>
              SYMBOLS.findIndex((s) => s.name === a.name) -
              SYMBOLS.findIndex((s) => s.name === b.name),
          );
        });

        setLastUpdated(new Date());
        setIsLive(true);
        setLoading(false);
      },
      (connected) => {
        streamingRef.current = connected;
        setStreaming(connected);
      },
    );

    return () => handle.close();
  }, [flash]);

  useEffect(() => {
    const timers = timerRef.current;
    return () => {
      Object.values(timers).forEach(clearTimeout);
    };
  }, []);

  if (indices.length === 0 && !loading) return null;

  return (
    <div className="border-b border-border bg-card">
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-between gap-4">
          {/* Market indices */}
          <div className="flex items-center gap-4 sm:gap-6 overflow-x-auto scrollbar-hide min-w-0 flex-1">
            {loading && indices.length === 0
              ? Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-2 animate-pulse shrink-0">
                    <div className="h-3 w-16 rounded bg-muted" />
                    <div className="h-3 w-20 rounded bg-muted" />
                    <div className="h-3 w-24 rounded bg-muted" />
                  </div>
                ))
              : indices.map((idx, i) => {
                  const isPositive = idx.change >= 0;
                  const tick = ticks[idx.name];
                  return (
                    <div key={idx.name} className="flex items-center gap-1.5 shrink-0">
                      {i > 0 && <div className="w-px h-4 bg-border mr-2.5" />}
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        {idx.name}
                      </span>
                      <span
                        className={`text-sm font-bold tabular-nums rounded px-1 transition-colors duration-500 ${
                          tick === 'up'
                            ? 'bg-gain/15 text-gain'
                            : tick === 'down'
                              ? 'bg-loss/15 text-loss'
                              : 'text-foreground'
                        }`}
                      >
                        {idx.value.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                      <span
                        className={`flex items-center gap-0.5 text-xs font-semibold tabular-nums ${
                          isPositive ? 'text-gain' : 'text-loss'
                        }`}
                      >
                        {isPositive ? (
                          <TrendingUp className="h-3 w-3" />
                        ) : (
                          <TrendingDown className="h-3 w-3" />
                        )}
                        {isPositive ? '+' : ''}
                        {idx.change.toFixed(2)}
                        <span className="text-[10px]">
                          ({isPositive ? '+' : ''}
                          {idx.changePercent.toFixed(2)}%)
                        </span>
                      </span>
                    </div>
                  );
                })}
          </div>

          {/* Status indicators */}
          <div className="flex items-center gap-2 shrink-0">
            {!marketOpen && (
              <span className="flex items-center gap-1 text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
                <Clock className="h-2.5 w-2.5" />
                <span className="hidden sm:inline">Closed</span>
              </span>
            )}
            {isLive ? (
              <span className="flex items-center gap-1 text-[10px] text-gain">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gain opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-gain" />
                </span>
                {streaming ? <Zap className="h-2.5 w-2.5" /> : <Wifi className="h-2.5 w-2.5" />}
                <span className="hidden sm:inline">{streaming ? 'Streaming' : 'Live'}</span>
              </span>
            ) : (
              <WifiOff className="h-2.5 w-2.5 text-muted-foreground" />
            )}
            {lastUpdated && (
              <span className="text-[10px] text-muted-foreground hidden sm:inline tabular-nums">
                {lastUpdated.toLocaleTimeString('en-IN', {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                })}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketTicker;
