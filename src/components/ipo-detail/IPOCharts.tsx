import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import type { GMPUpdate, SubscriptionHistoryRow } from '@/hooks/useIPOData';

interface Props {
  gmpHistory: GMPUpdate[];
  subHistory: SubscriptionHistoryRow[];
}

const IPOCharts = ({ gmpHistory, subHistory }: Props) => {
  const gmpChartData = gmpHistory.map(g => ({ date: g.date, gmp: Number(g.gmp) }));
  const subChartData = subHistory.map(s => ({ date: s.day_label, retail: Number(s.retail), hni: Number(s.hni), qib: Number(s.qib) }));

  if (gmpChartData.length === 0 && subChartData.length === 0) return null;

  return (
    <div className="grid md:grid-cols-2 gap-6 mb-6">
      {gmpChartData.length > 0 && (
        <section className="bg-card border border-border rounded-lg p-5">
          <h2 className="font-serif text-lg font-bold text-foreground mb-4">GMP Trend</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={gmpChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={v => new Date(v).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: number) => [`₹${v}`, 'GMP']} />
              <Line type="monotone" dataKey="gmp" stroke="hsl(var(--gain))" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </section>
      )}

      {subChartData.length > 0 && (
        <section className="bg-card border border-border rounded-lg p-5">
          <h2 className="font-serif text-lg font-bold text-foreground mb-4">Subscription Trend</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={subChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: number) => [`${v}x`, '']} />
              <Legend />
              <Bar dataKey="retail" fill="hsl(var(--primary))" name="Retail" />
              <Bar dataKey="hni" fill="hsl(var(--warning, 38 92% 50%))" name="HNI" />
              <Bar dataKey="qib" fill="hsl(var(--gain))" name="QIB" />
            </BarChart>
          </ResponsiveContainer>
        </section>
      )}
    </div>
  );
};

export default IPOCharts;
