import { formatCurrency } from '@/hooks/useIPOData';
import type { IPORow } from '@/hooks/useIPOData';

interface Props {
  ipo: IPORow;
  latestGmp: number;
  expectedListing: number;
}

const IPOSEOContent = ({ ipo, latestGmp, expectedListing }: Props) => {
  const minInvestment = ipo.lot_size * Number(ipo.price_band_high);
  const openDate = new Date(ipo.open_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  const closeDate = new Date(ipo.close_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <section className="bg-card border border-border rounded-lg p-5 mb-6">
      <h2 className="font-serif text-lg font-bold text-foreground mb-3">{ipo.name} IPO – Complete Details</h2>
      <div className="text-sm text-muted-foreground leading-relaxed space-y-3">
        <p>
          {ipo.name} IPO is {ipo.status === 'listed' ? 'a recently listed' : ipo.status === 'open' ? 'a currently open' : 'an upcoming'} Initial Public Offering on the {ipo.exchange}.
          {ipo.company_description ? ` ${ipo.company_description}` : ` The company is preparing to list its shares through an IPO process.`}
        </p>
        <p>
          The IPO price band has been set at ₹{Number(ipo.price_band_low)} to ₹{Number(ipo.price_band_high)} per share with a lot size of {ipo.lot_size} shares.
          This means the minimum investment required for retail investors is {formatCurrency(minInvestment)}.
          The IPO {ipo.status === 'listed' ? 'opened' : 'is scheduled to open'} on {openDate} and {ipo.status === 'listed' ? 'closed' : 'will close'} on {closeDate}.
        </p>
        <p>
          The current Grey Market Premium (GMP) for {ipo.name} IPO is ₹{latestGmp}, indicating that the shares are expected to list at approximately {formatCurrency(expectedListing)} per share.
          This represents a {((latestGmp / Number(ipo.price_band_high)) * 100).toFixed(1)}% {latestGmp >= 0 ? 'premium' : 'discount'} over the issue price.
          {latestGmp > 0 ? ' The positive GMP suggests strong demand in the grey market among investors.' : ''}
        </p>
        {ipo.subscription_total && (
          <p>
            The IPO has received a total subscription of {Number(ipo.subscription_total)}x.
            The retail investor category was subscribed {ipo.subscription_retail ? `${Number(ipo.subscription_retail)}x` : 'N/A'},
            while the HNI category saw {ipo.subscription_hni ? `${Number(ipo.subscription_hni)}x` : 'N/A'} subscription
            and QIB category recorded {ipo.subscription_qib ? `${Number(ipo.subscription_qib)}x` : 'N/A'} subscription.
            {Number(ipo.subscription_total) > 10 ? ' The strong subscription numbers indicate high investor confidence in the company.' : ''}
          </p>
        )}
        {ipo.ipo_objective && (
          <p>
            The objective of the IPO is {ipo.ipo_objective.toLowerCase().startsWith('to') ? '' : 'to '}{ipo.ipo_objective.toLowerCase()}.
          </p>
        )}
        <p>
          Investors interested in {ipo.name} IPO should carefully evaluate the company's fundamentals, financials, and market conditions before making an investment decision.
          The GMP is an unofficial indicator and may not reflect the actual listing price. Always consult a SEBI-registered financial advisor before investing.
        </p>
      </div>
    </section>
  );
};

export default IPOSEOContent;
