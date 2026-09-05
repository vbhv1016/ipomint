import { useState, useCallback } from 'react';
import { Save, X } from 'lucide-react';

type IPORow = {
  id?: string;
  name: string;
  slug: string;
  exchange: string;
  price_band_low: number;
  price_band_high: number;
  lot_size: number;
  open_date: string;
  close_date: string;
  listing_date: string | null;
  status: string;
  subscription_retail: number | null;
  subscription_hni: number | null;
  subscription_qib: number | null;
  subscription_total: number | null;
  listing_price: number | null;
  listing_gain: number | null;
  company_description: string | null;
  revenue: number | null;
  profit: number | null;
  ipo_objective: string | null;
};

interface Props {
  initial: Partial<IPORow>;
  isNew: boolean;
  onSave: (data: Partial<IPORow>) => void;
  onCancel: () => void;
}

const generateSlug = (name: string) =>
  name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const inputCls =
  'w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-hidden focus:ring-2 focus:ring-ring';

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <label className="block text-xs font-medium text-muted-foreground mb-1">{label}</label>
    {children}
  </div>
);

const IPOEditForm = ({ initial, isNew, onSave, onCancel }: Props) => {
  const [form, setForm] = useState<Partial<IPORow>>(initial);

  const update = useCallback((patch: Partial<IPORow>) => {
    setForm(prev => ({ ...prev, ...patch }));
  }, []);

  return (
    <div className="bg-card border border-border rounded-lg p-4 sm:p-5 mb-6 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-serif text-lg font-bold text-foreground">{isNew ? 'New IPO' : 'Edit IPO'}</h3>
        <button onClick={onCancel} className="text-muted-foreground hover:text-foreground">
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <Field label="Company Name">
          <input className={inputCls} value={form.name || ''} onChange={e => update({ name: e.target.value, slug: generateSlug(e.target.value) })} />
        </Field>
        <Field label="Slug">
          <input className={inputCls} value={form.slug || ''} onChange={e => update({ slug: e.target.value })} />
        </Field>
        <Field label="Exchange">
          <select className={inputCls} value={form.exchange || 'NSE & BSE'} onChange={e => update({ exchange: e.target.value })}>
            <option>NSE & BSE</option><option>NSE</option><option>BSE</option>
          </select>
        </Field>
        <Field label="Price Band Low (₹)">
          <input type="number" inputMode="numeric" className={inputCls} value={form.price_band_low || ''} onChange={e => update({ price_band_low: +e.target.value })} />
        </Field>
        <Field label="Price Band High (₹)">
          <input type="number" inputMode="numeric" className={inputCls} value={form.price_band_high || ''} onChange={e => update({ price_band_high: +e.target.value })} />
        </Field>
        <Field label="Lot Size">
          <input type="number" inputMode="numeric" className={inputCls} value={form.lot_size || ''} onChange={e => update({ lot_size: +e.target.value })} />
        </Field>
        <Field label="Open Date">
          <input type="date" className={inputCls} value={form.open_date || ''} onChange={e => update({ open_date: e.target.value })} />
        </Field>
        <Field label="Close Date">
          <input type="date" className={inputCls} value={form.close_date || ''} onChange={e => update({ close_date: e.target.value })} />
        </Field>
        <Field label="Listing Date">
          <input type="date" className={inputCls} value={form.listing_date || ''} onChange={e => update({ listing_date: e.target.value || null })} />
        </Field>
        <Field label="Status">
          <select className={inputCls} value={form.status || 'upcoming'} onChange={e => update({ status: e.target.value })}>
            <option value="upcoming">Upcoming</option><option value="open">Open</option>
            <option value="closed">Closed</option><option value="listed">Listed</option>
          </select>
        </Field>
        <Field label="Listing Price (₹)">
          <input type="number" inputMode="decimal" className={inputCls} value={form.listing_price ?? ''} onChange={e => update({ listing_price: e.target.value ? +e.target.value : null })} />
        </Field>
        <Field label="Listing Gain (%)">
          <input type="number" inputMode="decimal" step="0.01" className={inputCls} value={form.listing_gain ?? ''} onChange={e => update({ listing_gain: e.target.value ? +e.target.value : null })} />
        </Field>
        <Field label="Sub. Retail (x)">
          <input type="number" inputMode="decimal" step="0.01" className={inputCls} value={form.subscription_retail ?? ''} onChange={e => update({ subscription_retail: e.target.value ? +e.target.value : null })} />
        </Field>
        <Field label="Sub. HNI (x)">
          <input type="number" inputMode="decimal" step="0.01" className={inputCls} value={form.subscription_hni ?? ''} onChange={e => update({ subscription_hni: e.target.value ? +e.target.value : null })} />
        </Field>
        <Field label="Sub. QIB (x)">
          <input type="number" inputMode="decimal" step="0.01" className={inputCls} value={form.subscription_qib ?? ''} onChange={e => update({ subscription_qib: e.target.value ? +e.target.value : null })} />
        </Field>
        <Field label="Sub. Total (x)">
          <input type="number" inputMode="decimal" step="0.01" className={inputCls} value={form.subscription_total ?? ''} onChange={e => update({ subscription_total: e.target.value ? +e.target.value : null })} />
        </Field>
        <Field label="Revenue (₹ Cr)">
          <input type="number" inputMode="numeric" className={inputCls} value={form.revenue ?? ''} onChange={e => update({ revenue: e.target.value ? +e.target.value : null })} />
        </Field>
        <Field label="Profit (₹ Cr)">
          <input type="number" inputMode="numeric" className={inputCls} value={form.profit ?? ''} onChange={e => update({ profit: e.target.value ? +e.target.value : null })} />
        </Field>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:gap-4 mt-3 sm:mt-4">
        <Field label="Company Description">
          <textarea className={inputCls + ' min-h-[80px]'} value={form.company_description || ''} onChange={e => update({ company_description: e.target.value || null })} />
        </Field>
        <Field label="IPO Objective">
          <textarea className={inputCls + ' min-h-[60px]'} value={form.ipo_objective || ''} onChange={e => update({ ipo_objective: e.target.value || null })} />
        </Field>
      </div>
      <div className="flex gap-2 mt-4 sm:mt-5">
        <button onClick={() => onSave(form)} className="flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity">
          <Save className="h-3.5 w-3.5" /> Save
        </button>
        <button onClick={onCancel} className="rounded-md bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground hover:bg-accent transition-colors">
          Cancel
        </button>
      </div>
    </div>
  );
};

export default IPOEditForm;
