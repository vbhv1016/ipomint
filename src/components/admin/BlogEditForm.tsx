import { useState, useCallback } from 'react';
import { Save, X } from 'lucide-react';

interface BlogPost {
  id?: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  category: string;
  published: boolean;
  cover_image_url: string | null;
  published_at: string | null;
  [key: string]: any;
}

interface Props {
  initial: BlogPost;
  isNew: boolean;
  onSave: (data: BlogPost) => void;
  onCancel: () => void;
}

const inputCls =
  'w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-hidden focus:ring-2 focus:ring-ring';

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <label className="block text-xs font-medium text-muted-foreground mb-1">{label}</label>
    {children}
  </div>
);

const BlogEditForm = ({ initial, isNew, onSave, onCancel }: Props) => {
  const [form, setForm] = useState<BlogPost>(initial);

  const update = useCallback((patch: Partial<BlogPost>) => {
    setForm(prev => ({ ...prev, ...patch }));
  }, []);

  return (
    <div className="bg-card border border-border rounded-lg p-4 sm:p-5 mb-6 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-serif text-lg font-bold text-foreground">{isNew ? 'New Post' : 'Edit Post'}</h3>
        <button onClick={onCancel} className="text-muted-foreground hover:text-foreground">
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <Field label="Title">
          <input className={inputCls} value={form.title} onChange={e => update({ title: e.target.value, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') })} />
        </Field>
        <Field label="Slug">
          <input className={inputCls} value={form.slug} onChange={e => update({ slug: e.target.value })} />
        </Field>
        <Field label="Category">
          <select className={inputCls} value={form.category} onChange={e => update({ category: e.target.value })}>
            <option value="ipo-review">IPO Review</option>
            <option value="market-analysis">Market Analysis</option>
            <option value="gmp-update">GMP Update</option>
            <option value="news">News</option>
          </select>
        </Field>
        <Field label="Cover Image URL">
          <input className={inputCls} value={form.cover_image_url || ''} onChange={e => update({ cover_image_url: e.target.value || null })} />
        </Field>
      </div>
      <div className="mt-3 sm:mt-4 space-y-3 sm:space-y-4">
        <Field label="Excerpt">
          <textarea className={inputCls + ' min-h-[60px]'} value={form.excerpt || ''} onChange={e => update({ excerpt: e.target.value || null })} />
        </Field>
        <Field label="Content">
          <textarea className={inputCls + ' min-h-[200px]'} value={form.content} onChange={e => update({ content: e.target.value })} />
        </Field>
        <div className="flex items-center gap-2">
          <input type="checkbox" id="published" checked={form.published} onChange={e => update({ published: e.target.checked, published_at: e.target.checked ? new Date().toISOString() : null })} className="rounded border-input" />
          <label htmlFor="published" className="text-sm text-foreground">Published</label>
        </div>
      </div>
      <div className="flex gap-2 mt-4 sm:mt-5">
        <button onClick={() => onSave(form)} className="flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity">
          <Save className="h-3.5 w-3.5" /> Save
        </button>
        <button onClick={onCancel} className="rounded-md bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground hover:bg-accent transition-colors">Cancel</button>
      </div>
    </div>
  );
};

export default BlogEditForm;
