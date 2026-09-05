// Migrated from supabase/functions/market-data — fetches live Indian market
// indices (NIFTY 50, BANK NIFTY, SENSEX) from Yahoo Finance with in-memory caching.
import { createServerFn } from "@tanstack/react-start";

interface MarketIndexData {
  name: string;
  value: number;
  change: number;
  changePercent: number;
}

interface CachedMarketData {
  indices: MarketIndexData[];
  timestamp: string;
  marketOpen: boolean;
}

export interface MarketDataResult {
  success: boolean;
  indices: MarketIndexData[] | null;
  timestamp?: string;
  marketOpen: boolean;
  cached?: boolean;
  delayed?: boolean;
  error?: string;
}

let cachedData: CachedMarketData | null = null;
let lastFetchTime = 0;

function isIndianMarketOpen(): boolean {
  const now = new Date();
  const istStr = now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
  const ist = new Date(istStr);
  const day = ist.getDay();
  if (day === 0 || day === 6) return false;
  const mins = ist.getHours() * 60 + ist.getMinutes();
  return mins >= 555 && mins <= 930;
}

interface YahooChartResult {
  meta: {
    regularMarketPrice?: number;
    chartPreviousClose?: number;
    previousClose?: number;
  };
}

async function fetchYahooQuote(symbol: string): Promise<YahooChartResult> {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=1d&interval=5m`;
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    },
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`Yahoo ${symbol}: ${res.status}`);
  const data = await res.json();
  const result = data?.chart?.result?.[0];
  if (!result) throw new Error(`No chart data for ${symbol}`);
  return result as YahooChartResult;
}

export const getMarketData = createServerFn({ method: "GET" }).handler(
  async (): Promise<MarketDataResult> => {
    try {
      const now = Date.now();
      const marketOpen = isIndianMarketOpen();

      // Cache: 3s when open (near-live), 5min when closed
      const ttl = marketOpen ? 3000 : 300000;
      if (cachedData && now - lastFetchTime < ttl) {
        return { success: true, ...cachedData, marketOpen, cached: true };
      }

      const symbols = [
        { yahoo: "^NSEI", display: "NIFTY 50" },
        { yahoo: "^NSEBANK", display: "BANK NIFTY" },
        { yahoo: "^BSESN", display: "SENSEX" },
      ];

      const results = await Promise.allSettled(symbols.map((s) => fetchYahooQuote(s.yahoo)));

      const indices: MarketIndexData[] = [];
      for (let i = 0; i < symbols.length; i++) {
        const settled = results[i];
        if (settled.status === "fulfilled") {
          const meta = settled.value.meta;
          const price = meta.regularMarketPrice;
          const prevClose = meta.chartPreviousClose || meta.previousClose;
          if (!price) continue;

          const change = prevClose ? price - prevClose : 0;
          const pct = prevClose ? (change / prevClose) * 100 : 0;

          indices.push({
            name: symbols[i].display,
            value: Math.round(price * 100) / 100,
            change: Math.round(change * 100) / 100,
            changePercent: Math.round(pct * 100) / 100,
          });
        } else {
          console.error(`Failed ${symbols[i].yahoo}:`, settled.reason);
        }
      }

      if (indices.length > 0) {
        cachedData = { indices, timestamp: new Date().toISOString(), marketOpen };
        lastFetchTime = now;
        return { success: true, ...cachedData, cached: false };
      }

      throw new Error("No data available");
    } catch (error: unknown) {
      console.error("Market data error:", error);
      const marketOpen = isIndianMarketOpen();

      if (cachedData) {
        return { success: true, ...cachedData, marketOpen, cached: true, delayed: true };
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        indices: null,
        marketOpen,
      };
    }
  },
);
