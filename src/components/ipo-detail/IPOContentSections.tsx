import { Banknote, Target, Building2, TrendingUp, TrendingDown } from 'lucide-react';
import { formatCurrency, formatCrore } from '@/hooks/useIPOData';
import type { IPORow } from '@/hooks/useIPOData';

interface Props {
  ipo: IPORow;
  latestGmp: number;
  expectedListing: number;
}

const IPOContentSections = ({ ipo, latestGmp, expectedListing }: Props) => {
  const minInvestment = ipo.lot_size * Number(ipo.price_band_high);

  return (
    <>
      {/* About the Company */}
      <section className="bg-card border border-border rounded-lg p-5 mb-6">
        <h2 className="font-serif text-lg font-bold text-foreground mb-3">About {ipo.name}</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {ipo.company_description || `${ipo.name} is an Indian company planning to raise capital through an Initial Public Offering (IPO) on the ${ipo.exchange}.`}
        </p>
        {ipo.ipo_objective && (
          <>
            <h3 className="text-sm font-semibold text-foreground mt-4 mb-1">IPO Objective</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{ipo.ipo_objective}</p>
          </>
        )}
      </section>

      {/* GMP Today */}
      <section className="bg-card border border-border rounded-lg p-5 mb-6">
        <h2 className="font-serif text-lg font-bold text-foreground mb-3">IPO GMP Today</h2>
        <p className="text-sm text-muted-foreground leading-relaxed mb-3">
          The Grey Market Premium (GMP) of {ipo.name} IPO today is{' '}
          <span className={`font-bold ${latestGmp >= 0 ? 'text-gain' : 'text-loss'}`}>₹{latestGmp}</span>.
          This indicates the stock is expected to list at{' '}
          <span className="font-bold text-foreground">{formatCurrency(expectedListing)}</span>,
          which is a{' '}
          <span className={latestGmp >= 0 ? 'text-gain' : 'text-loss'}>
            {((latestGmp / Number(ipo.price_band_high)) * 100).toFixed(1)}% {latestGmp >= 0 ? 'premium' : 'discount'}
          </span>{' '}
          over the upper price band of ₹{Number(ipo.price_band_high)}.
        </p>
      </section>

      {/* Price Band */}
      <section className="bg-card border border-border rounded-lg p-5 mb-6">
        <h2 className="font-serif text-lg font-bold text-foreground mb-3">IPO Price Band</h2>
        <div className="flex items-center gap-2 mb-3">
          <Banknote className="h-5 w-5 text-muted-foreground" />
          <span className="text-lg font-semibold text-foreground">₹{Number(ipo.price_band_low)} – ₹{Number(ipo.price_band_high)}</span>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          The price band for {ipo.name} IPO has been fixed at ₹{Number(ipo.price_band_low)} to ₹{Number(ipo.price_band_high)} per share.
          Retail investors can apply at the cut-off price of ₹{Number(ipo.price_band_high)}.
        </p>
      </section>

      {/* Lot Size & Min Investment */}
      <section className="bg-card border border-border rounded-lg p-5 mb-6">
        <h2 className="font-serif text-lg font-bold text-foreground mb-3">Lot Size and Minimum Investment</h2>
        <div className="grid grid-cols-2 gap-4 mb-3">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-muted-foreground" />
            <div>
              <div className="text-xs text-muted-foreground">Lot Size</div>
              <div className="font-semibold text-foreground">{ipo.lot_size} shares</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-muted-foreground" />
            <div>
              <div className="text-xs text-muted-foreground">Min Investment</div>
              <div className="font-semibold text-foreground">{formatCurrency(minInvestment)}</div>
            </div>
          </div>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          The minimum lot size for {ipo.name} IPO is {ipo.lot_size} shares. At the upper price band of ₹{Number(ipo.price_band_high)},
          the minimum investment required is {formatCurrency(minInvestment)} for retail investors.
        </p>
      </section>

      {/* Subscription Status */}
      <section className="bg-card border border-border rounded-lg p-5 mb-6">
        <h2 className="font-serif text-lg font-bold text-foreground mb-3">IPO Subscription Status</h2>
        {ipo.subscription_total ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
              {[
                { label: 'Retail', value: ipo.subscription_retail },
                { label: 'HNI', value: ipo.subscription_hni },
                { label: 'QIB', value: ipo.subscription_qib },
                { label: 'Total', value: ipo.subscription_total },
              ].map(cat => (
                <div key={cat.label} className="bg-background rounded-md p-3 text-center">
                  <div className="text-xs text-muted-foreground">{cat.label}</div>
                  <div className="text-lg font-bold text-foreground">{cat.value != null ? `${Number(cat.value)}x` : 'N/A'}</div>
                </div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {ipo.name} IPO has been subscribed {Number(ipo.subscription_total)}x overall.
              The retail category was subscribed {ipo.subscription_retail ? `${Number(ipo.subscription_retail)}x` : 'N/A'},
              HNI {ipo.subscription_hni ? `${Number(ipo.subscription_hni)}x` : 'N/A'},
              and QIB {ipo.subscription_qib ? `${Number(ipo.subscription_qib)}x` : 'N/A'}.
            </p>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">Subscription data is not yet available for this IPO.</p>
        )}
      </section>

      {/* Expected Listing Price */}
      <section className="bg-card border border-border rounded-lg p-5 mb-6">
        <h2 className="font-serif text-lg font-bold text-foreground mb-3">Expected Listing Price</h2>
        <div className="flex items-center gap-3 mb-3">
          {latestGmp >= 0 ? (
            <TrendingUp className="h-6 w-6 text-gain" />
          ) : (
            <TrendingDown className="h-6 w-6 text-loss" />
          )}
          <span className="text-2xl font-bold text-foreground">{formatCurrency(expectedListing)}</span>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Based on the current GMP of ₹{latestGmp}, {ipo.name} IPO is expected to list at approximately {formatCurrency(expectedListing)} per share.
          This represents a {latestGmp >= 0 ? 'gain' : 'loss'} of {formatCurrency(Math.abs(latestGmp))} per share
          over the issue price of ₹{Number(ipo.price_band_high)}.
        </p>
        {ipo.listing_gain != null && (
          <div className="mt-3 p-3 bg-background rounded-md">
            <span className="text-xs text-muted-foreground">Actual Listing: </span>
            <span className={`font-bold ${Number(ipo.listing_gain) >= 0 ? 'text-gain' : 'text-loss'}`}>
              {Number(ipo.listing_gain) >= 0 ? '+' : ''}{Number(ipo.listing_gain).toFixed(1)}% ({formatCurrency(Number(ipo.listing_price!))})
            </span>
          </div>
        )}
      </section>

      {/* IPO Timeline */}
      <section className="bg-card border border-border rounded-lg p-5 mb-6">
        <h2 className="font-serif text-lg font-bold text-foreground mb-3">IPO Timeline</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground block text-xs">Open Date</span>
            <span className="font-medium">{new Date(ipo.open_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
          </div>
          <div>
            <span className="text-muted-foreground block text-xs">Close Date</span>
            <span className="font-medium">{new Date(ipo.close_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
          </div>
          {ipo.listing_date && (
            <div>
              <span className="text-muted-foreground block text-xs">Listing Date</span>
              <span className="font-medium">{new Date(ipo.listing_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            </div>
          )}
        </div>
      </section>

      {/* Company Financials */}
      <section className="bg-card border border-border rounded-lg p-5 mb-6">
        <h2 className="font-serif text-lg font-bold text-foreground mb-3">Company Financials</h2>
        {ipo.revenue != null ? (
          <div className="space-y-3">
            <div className="flex justify-between items-center border-b border-border pb-3">
              <span className="text-sm text-muted-foreground">Revenue (FY25)</span>
              <span className="font-semibold text-foreground">{formatCrore(Number(ipo.revenue))}</span>
            </div>
            <div className="flex justify-between items-center border-b border-border pb-3">
              <span className="text-sm text-muted-foreground">Net Profit (FY25)</span>
              <span className={`font-semibold ${Number(ipo.profit!) >= 0 ? 'text-gain' : 'text-loss'}`}>
                {formatCrore(Number(ipo.profit!))}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Profit Margin</span>
              <span className="font-semibold text-foreground">
                {((Number(ipo.profit!) / Number(ipo.revenue)) * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Financial data not yet available for {ipo.name}.</p>
        )}
      </section>
    </>
  );
};

export default IPOContentSections;
