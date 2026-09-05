import { siteOrigin } from '@/lib/utils';
import { useState, useMemo, useCallback, useEffect } from 'react';
import { useSearchParams } from '@/lib/router-compat';
import { Calculator, TrendingUp, TrendingDown, RotateCcw } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import { formatCurrency } from '@/hooks/useIPOData';

const inputCls = "w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm text-foreground focus:outline-hidden focus:ring-2 focus:ring-ring transition-shadow placeholder:text-muted-foreground/60";

const ListingGainCalculator = () => {
  const [searchParams] = useSearchParams();
  const [ipoPriceStr, setIpoPriceStr] = useState('');
  const [gmpStr, setGmpStr] = useState('');
  const [lotSizeStr, setLotSizeStr] = useState('');
  const [lotsAppliedStr, setLotsAppliedStr] = useState('');

  useEffect(() => {
    const price = searchParams.get('price');
    const gmp = searchParams.get('gmp');
    const lotSize = searchParams.get('lotSize');
    const lots = searchParams.get('lots');
    if (price && Number.isFinite(Number(price))) setIpoPriceStr(price);
    if (gmp && Number.isFinite(Number(gmp))) setGmpStr(gmp);
    if (lotSize && Number.isFinite(Number(lotSize))) setLotSizeStr(lotSize);
    if (lots && Number.isFinite(Number(lots))) setLotsAppliedStr(lots);
  }, [searchParams]);

  const ipoPrice = ipoPriceStr === '' ? null : Number(ipoPriceStr);
  const gmp = gmpStr === '' ? null : Number(gmpStr);
  const lotSize = lotSizeStr === '' ? null : Number(lotSizeStr);
  const lotsApplied = lotsAppliedStr === '' ? null : Number(lotsAppliedStr);

  const allFilled = ipoPrice !== null && gmp !== null && lotSize !== null && lotsApplied !== null
    && ipoPriceStr !== '' && gmpStr !== '' && lotSizeStr !== '' && lotsAppliedStr !== '';

  const isValid = allFilled
    && Number.isFinite(ipoPrice!) && Number.isFinite(gmp!) && Number.isFinite(lotSize!) && Number.isFinite(lotsApplied!)
    && ipoPrice! > 0 && lotSize! >= 1 && lotsApplied! >= 1;

  const errors = useMemo(() => {
    const e: string[] = [];
    if (ipoPriceStr !== '' && (ipoPrice === null || !Number.isFinite(ipoPrice) || ipoPrice <= 0)) e.push('IPO price must be greater than 0');
    if (ipoPriceStr !== '' && ipoPrice !== null && ipoPrice > 100000) e.push('IPO price seems unrealistically high');
    if (lotSizeStr !== '' && (lotSize === null || !Number.isFinite(lotSize) || lotSize < 1)) e.push('Lot size must be at least 1');
    if (lotsAppliedStr !== '' && (lotsApplied === null || !Number.isFinite(lotsApplied) || lotsApplied < 1)) e.push('Lots applied must be at least 1');
    if (lotsAppliedStr !== '' && lotsApplied !== null && lotsApplied > 500) e.push('Lots applied cannot exceed 500');
    return e;
  }, [ipoPrice, ipoPriceStr, lotSize, lotSizeStr, lotsApplied, lotsAppliedStr]);

  const result = useMemo(() => {
    if (!isValid) return null;
    const estListingPrice = ipoPrice! + gmp!;
    const totalShares = lotSize! * lotsApplied!;
    const investment = ipoPrice! * totalShares;
    const totalProfit = gmp! * totalShares;
    const roi = (gmp! / ipoPrice!) * 100;
    return { estListingPrice, investment, totalProfit, roi, totalShares };
  }, [ipoPrice, gmp, lotSize, lotsApplied, isValid]);

  const isProfit = result ? result.totalProfit >= 0 : true;

  const handleReset = useCallback(() => {
    setIpoPriceStr('');
    setGmpStr('');
    setLotSizeStr('');
    setLotsAppliedStr('');
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SEOHead
        title="IPO Listing Gain Calculator | Estimate Profit from GMP"
        description="Calculate expected IPO listing gains using Grey Market Premium (GMP). Estimate profit, ROI and total investment for Indian IPO investors."
        canonical={`${siteOrigin()}/ipo-listing-gain-calculator`}
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'WebApplication',
          name: 'IPO Listing Gain Calculator',
          description: 'Estimate IPO listing profit using GMP data.',
          applicationCategory: 'FinanceApplication',
        }}
      />
      <Header />
      <main className="flex-1 container mx-auto px-4 py-6 md:py-10">
        <h1 className="font-serif text-2xl md:text-3xl font-bold text-foreground mb-2">IPO Listing Gain Calculator</h1>
        <p className="text-sm text-muted-foreground mb-6 max-w-2xl">
          Estimate your expected listing profit based on the current Grey Market Premium (GMP).
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Inputs */}
          <div className="bg-card border border-border rounded-lg p-5 md:p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Calculator className="h-5 w-5 text-primary" />
                <h2 className="font-serif text-lg font-bold text-foreground">Calculator Inputs</h2>
              </div>
              <button
                onClick={handleReset}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Reset calculator"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Reset
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">IPO Price Band (Upper) ₹</label>
                <input
                  type="number"
                  min={1}
                  value={ipoPriceStr}
                  onChange={e => setIpoPriceStr(e.target.value)}
                  className={inputCls}
                  placeholder="e.g. 200, 500, 1000"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Grey Market Premium (GMP) ₹</label>
                <input
                  type="number"
                  value={gmpStr}
                  onChange={e => setGmpStr(e.target.value)}
                  className={inputCls}
                  placeholder="e.g. 50, -10, 120"
                />
                <p className="text-xs text-muted-foreground mt-1">Can be negative for discount listings</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Lot Size (shares)</label>
                <input
                  type="number"
                  min={1}
                  value={lotSizeStr}
                  onChange={e => setLotSizeStr(e.target.value)}
                  className={inputCls}
                  placeholder="e.g. 50, 75, 100"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Number of Lots Applied</label>
                <input
                  type="number"
                  min={1}
                  max={500}
                  value={lotsAppliedStr}
                  onChange={e => setLotsAppliedStr(e.target.value)}
                  className={inputCls}
                  placeholder="e.g. 1, 2, 3"
                />
              </div>
            </div>

            {errors.length > 0 && (
              <div className="mt-4 rounded-md bg-destructive/10 p-3">
                {errors.map((err, i) => (
                  <p key={i} className="text-xs text-destructive">{err}</p>
                ))}
              </div>
            )}
          </div>

          {/* Results */}
          <div className="bg-card border border-border rounded-lg p-5 md:p-6">
            <h2 className="font-serif text-lg font-bold text-foreground mb-5">Expected Returns</h2>

            {result ? (
              <div className="space-y-4">
                {[
                  { label: 'Estimated Listing Price', value: formatCurrency(result.estListingPrice) },
                  { label: 'Total Investment', value: formatCurrency(result.investment) },
                  { label: 'Total Shares', value: result.totalShares.toLocaleString('en-IN') },
                ].map(r => (
                  <div key={r.label} className="flex justify-between items-center border-b border-border pb-3">
                    <span className="text-sm text-muted-foreground">{r.label}</span>
                    <span className="font-semibold text-foreground tabular-nums">{r.value}</span>
                  </div>
                ))}

                <div className={`rounded-lg p-4 transition-colors duration-300 ${isProfit ? 'bg-gain/10' : 'bg-loss/10'}`}>
                  <div className="flex items-center gap-2 mb-1">
                    {isProfit ? <TrendingUp className="h-4 w-4 text-gain" /> : <TrendingDown className="h-4 w-4 text-loss" />}
                    <span className="text-sm font-medium text-foreground">Expected {isProfit ? 'Profit' : 'Loss'}</span>
                  </div>
                  <div className={`text-3xl font-bold tabular-nums ${isProfit ? 'text-gain' : 'text-loss'}`}>
                    {isProfit ? '+' : ''}{formatCurrency(result.totalProfit)}
                  </div>
                  <div className={`text-sm mt-1 ${isProfit ? 'text-gain' : 'text-loss'}`}>
                    ROI: {isProfit ? '+' : ''}{result.roi.toFixed(2)}%
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center min-h-[200px] text-center">
                <div className="text-4xl text-muted-foreground/30 font-bold mb-2">—</div>
                <p className="text-sm text-muted-foreground">Fill in the inputs to see expected returns</p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 bg-card border border-border rounded-lg p-5">
          <p className="text-sm text-muted-foreground leading-relaxed">
            <strong className="text-foreground">Disclaimer:</strong> Listing gain calculations are based on current GMP which is an unofficial grey market indicator. Actual listing price may vary. This is not investment advice.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ListingGainCalculator;
