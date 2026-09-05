import { formatCurrency } from '@/hooks/useIPOData';
import type { IPORow } from '@/hooks/useIPOData';

interface Props {
  ipo: IPORow;
  expectedListing: number;
}

const IPOInvestmentTable = ({ ipo, expectedListing }: Props) => (
  <section className="bg-card border border-border rounded-lg p-5 mb-6">
    <h2 className="font-serif text-lg font-bold text-foreground mb-3">Investment Calculator</h2>
    <div className="overflow-x-auto">
      <table className="finance-table w-full">
        <thead>
          <tr>
            <th>Lots</th>
            <th>Shares</th>
            <th>Investment (₹)</th>
            <th>Est. Listing Value</th>
            <th>Est. Gain/Loss</th>
          </tr>
        </thead>
        <tbody>
          {[1, 2, 3, 5, 10].map(lots => {
            const shares = lots * ipo.lot_size;
            const investment = shares * Number(ipo.price_band_high);
            const listingValue = shares * expectedListing;
            const gainLoss = listingValue - investment;
            return (
              <tr key={lots}>
                <td className="font-medium">{lots}</td>
                <td>{shares.toLocaleString('en-IN')}</td>
                <td>{formatCurrency(investment)}</td>
                <td>{formatCurrency(listingValue)}</td>
                <td className={gainLoss >= 0 ? 'text-gain font-semibold' : 'text-loss font-semibold'}>
                  {gainLoss >= 0 ? '+' : ''}{formatCurrency(gainLoss)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  </section>
);

export default IPOInvestmentTable;
