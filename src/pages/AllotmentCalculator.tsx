import { siteOrigin } from '@/lib/utils';
import { useState, useMemo, useCallback, useEffect } from 'react';
import { useSearchParams } from '@/lib/router-compat';
import { Calculator, Info, RotateCcw } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';

const CHANCE_LEVELS = [
  { max: 5, label: 'Very Low', color: 'bg-loss/15 text-loss' },
  { max: 15, label: 'Low', color: 'bg-warning/15 text-warning' },
  { max: 30, label: 'Medium', color: 'bg-info/15 text-info' },
  { max: 100, label: 'High', color: 'bg-gain/15 text-gain' },
] as const;

const inputCls = "w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm text-foreground focus:outline-hidden focus:ring-2 focus:ring-ring transition-shadow placeholder:text-muted-foreground/60";

const AllotmentCalculator = () => {
  const [searchParams] = useSearchParams();
  const [category, setCategory] = useState<'retail' | 'hni' | 'qib'>('retail');
  const [lotsStr, setLotsStr] = useState('');
  const [subRateStr, setSubRateStr] = useState('');

  useEffect(() => {
    const lots = searchParams.get('lots');
    const subRate = searchParams.get('subRate');
    const cat = searchParams.get('category');
    if (lots && Number.isFinite(Number(lots))) setLotsStr(lots);
    if (subRate && Number.isFinite(Number(subRate))) setSubRateStr(subRate);
    if (cat && ['retail', 'hni', 'qib'].includes(cat)) setCategory(cat as any);
  }, [searchParams]);

  const lots = lotsStr === '' ? null : Number(lotsStr);
  const subscriptionRate = subRateStr === '' ? null : Number(subRateStr);

  const hasInput = lots !== null && subscriptionRate !== null && lotsStr !== '' && subRateStr !== '';
  const isValid = hasInput && Number.isFinite(lots) && Number.isFinite(subscriptionRate) && lots! >= 1 && subscriptionRate! > 0;

  const result = useMemo(() => {
    if (!isValid) return null;
    const base = (1 / subscriptionRate!) * 100;
    const adjusted = Math.min(base * (1 + Math.log(Math.max(1, lots!)) * 0.3), 100);
    const probability = Math.round(adjusted * 100) / 100;
    const level = CHANCE_LEVELS.find(l => probability <= l.max) || CHANCE_LEVELS[3];
    return { probability, level };
  }, [lots, subscriptionRate, isValid]);

  const errors = useMemo(() => {
    const e: string[] = [];
    if (lotsStr !== '' && (lots === null || !Number.isFinite(lots) || lots < 1)) e.push('Lots must be at least 1');
    if (lotsStr !== '' && lots !== null && lots > 500) e.push('Lots cannot exceed 500');
    if (subRateStr !== '' && (subscriptionRate === null || !Number.isFinite(subscriptionRate) || subscriptionRate <= 0)) e.push('Subscription rate must be greater than 0');
    if (subRateStr !== '' && subscriptionRate !== null && subscriptionRate > 10000) e.push('Subscription rate seems too high');
    return e;
  }, [lots, lotsStr, subscriptionRate, subRateStr]);

  const handleReset = useCallback(() => {
    setCategory('retail');
    setLotsStr('');
    setSubRateStr('');
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SEOHead
        title="IPO Allotment Probability Calculator | Estimate Your Chances"
        description="Calculate your IPO allotment probability based on subscription rate, investor category, and lots applied. Free tool for Indian IPO investors."
        canonical={`${siteOrigin()}/ipo-allotment-calculator`}
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'WebApplication',
          name: 'IPO Allotment Probability Calculator',
          description: 'Estimate IPO allotment chances based on subscription demand.',
          applicationCategory: 'FinanceApplication',
        }}
      />
      <Header />
      <main className="flex-1 container mx-auto px-4 py-6 md:py-10">
        <h1 className="font-serif text-2xl md:text-3xl font-bold text-foreground mb-2">IPO Allotment Probability Calculator</h1>
        <p className="text-sm text-muted-foreground mb-6 max-w-2xl">
          Estimate your chances of getting IPO allotment based on subscription demand and the number of lots applied.
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Input Card */}
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
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Investor Category</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value as any)}
                  className={inputCls}
                >
                  <option value="retail">Retail Individual Investor (RII)</option>
                  <option value="hni">High Net-Worth Individual (HNI)</option>
                  <option value="qib">Qualified Institutional Buyer (QIB)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Number of Lots Applied</label>
                <input
                  type="number"
                  min={1}
                  max={500}
                  value={lotsStr}
                  onChange={e => setLotsStr(e.target.value)}
                  className={inputCls}
                  placeholder="e.g. 1, 2, 5"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">IPO Subscription Rate (x)</label>
                <input
                  type="number"
                  min={0.1}
                  step={0.1}
                  value={subRateStr}
                  onChange={e => setSubRateStr(e.target.value)}
                  className={inputCls}
                  placeholder="e.g. 10, 25, 50"
                />
                <p className="text-xs text-muted-foreground mt-1">Enter the overall subscription multiplier</p>
              </div>
            </div>

            {/* Validation errors */}
            {errors.length > 0 && (
              <div className="mt-4 rounded-md bg-destructive/10 p-3">
                {errors.map((err, i) => (
                  <p key={i} className="text-xs text-destructive">{err}</p>
                ))}
              </div>
            )}
          </div>

          {/* Result Card */}
          <div className="bg-card border border-border rounded-lg p-5 md:p-6 flex flex-col">
            <h2 className="font-serif text-lg font-bold text-foreground mb-5">Allotment Probability</h2>

            <div className="flex-1 flex flex-col items-center justify-center text-center min-h-[140px]">
              {result ? (
                <>
                  <div className="text-5xl md:text-6xl font-bold text-foreground mb-2 tabular-nums transition-all duration-300">
                    {result.probability.toFixed(2)}%
                  </div>
                  <span className={`inline-flex rounded-full px-4 py-1 text-sm font-medium ${result.level.color} transition-all duration-300`}>
                    {result.level.label} Chance
                  </span>
                </>
              ) : (
                <div className="text-center">
                  <div className="text-4xl text-muted-foreground/30 font-bold mb-2">—</div>
                  <p className="text-sm text-muted-foreground">Enter values to see your allotment probability</p>
                </div>
              )}
            </div>

            <div className="mt-6 grid grid-cols-4 gap-1.5">
              {CHANCE_LEVELS.map(l => (
                <div key={l.label} className={`rounded px-2 py-1.5 text-center text-[10px] font-medium transition-opacity duration-200 ${l.color} ${result && result.level.label === l.label ? 'ring-2 ring-ring' : 'opacity-40'}`}>
                  {l.label}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Explanation */}
        <div className="mt-6 bg-card border border-border rounded-lg p-5">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 text-info shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground leading-relaxed">
              IPO allotment probability is estimated based on subscription demand and the number of lots applied. Actual allotment depends on the lottery system used by stock exchanges. For retail investors, applying with more lots in oversubscribed IPOs does not significantly increase chances as allotment is typically on a lottery basis per application.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AllotmentCalculator;
