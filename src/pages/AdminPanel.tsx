import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { LogOut, Plus, Edit2, Trash2, TrendingUp, BarChart3, BookOpen } from 'lucide-react';
import { Link } from '@/lib/router-compat';
import { useToast } from '@/hooks/use-toast';
import { generateIPOBlogContent } from '@/lib/generateIPOBlogContent';
import IPOEditForm from '@/components/admin/IPOEditForm';
import BlogEditForm from '@/components/admin/BlogEditForm';

type IPORow = {
  id: string;
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

const emptyIPO: Omit<IPORow, 'id'> = {
  name: '', slug: '', exchange: 'NSE & BSE',
  price_band_low: 0, price_band_high: 0, lot_size: 0,
  open_date: '', close_date: '', listing_date: null,
  status: 'upcoming',
  subscription_retail: null, subscription_hni: null, subscription_qib: null, subscription_total: null,
  listing_price: null, listing_gain: null,
  company_description: null, revenue: null, profit: null, ipo_objective: null,
};

const inputCls =
  'w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-hidden focus:ring-2 focus:ring-ring';

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <label className="block text-xs font-medium text-muted-foreground mb-1">{label}</label>
    {children}
  </div>
);

const AdminPanel = () => {
  const { signOut, user } = useAuth();
  const { toast } = useToast();
  const [tab, setTab] = useState<'ipos' | 'gmp' | 'blog'>('ipos');
  const [ipos, setIpos] = useState<IPORow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingInitial, setEditingInitial] = useState<Partial<IPORow> | null>(null);
  const [isNew, setIsNew] = useState(false);

  // GMP state
  const [gmpIpoId, setGmpIpoId] = useState('');
  const [gmpDate, setGmpDate] = useState('');
  const [gmpValue, setGmpValue] = useState('');

  // Blog state
  const [blogPosts, setBlogPosts] = useState<any[]>([]);
  const [editingPostInitial, setEditingPostInitial] = useState<any>(null);
  const [isNewPost, setIsNewPost] = useState(false);

  const fetchIPOs = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('ipos').select('*').order('open_date', { ascending: false });
    if (!error && data) setIpos(data as IPORow[]);
    setLoading(false);
  };

  useEffect(() => { fetchIPOs(); fetchBlogPosts(); }, []);

  const fetchBlogPosts = async () => {
    const { data } = await supabase.from('blog_posts').select('*').order('created_at', { ascending: false });
    if (data) setBlogPosts(data);
  };

  const generateSlug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  const handleSaveIPO = async (formData: Partial<IPORow>) => {
    const { id, ...rest } = formData as IPORow;
    // Mark as manual so the auto-sync from Chittorgarh never overwrites admin edits.
    const payload = { ...rest, slug: rest.slug || generateSlug(rest.name || ''), is_manual: true };

    let error;
    if (isNew) {
      const { error: e } = await supabase.from('ipos').insert(payload as any);
      error = e;
    } else {
      const { error: e } = await supabase.from('ipos').update(payload as any).eq('id', id);
      error = e;
    }

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: isNew ? 'IPO Created' : 'IPO Updated' });

      if (isNew) {
        const blogData = generateIPOBlogContent(payload as any);
        const { error: blogError } = await supabase.from('blog_posts').insert({
          title: blogData.title,
          slug: blogData.slug,
          excerpt: blogData.excerpt,
          content: blogData.content,
          category: blogData.category,
          published: true,
          published_at: new Date().toISOString(),
        });
        if (blogError) {
          toast({ title: 'Blog auto-generation failed', description: blogError.message, variant: 'destructive' });
        } else {
          toast({ title: 'Blog article auto-generated', description: `Published at /blog/${blogData.slug}` });
          fetchBlogPosts();
        }
      }

      setEditingInitial(null);
      setEditingId(null);
      setIsNew(false);
      fetchIPOs();
    }
  };

  const handleDeleteIPO = async (id: string) => {
    if (!confirm('Delete this IPO and all related data?')) return;
    const { error } = await supabase.from('ipos').delete().eq('id', id);
    if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
    else { toast({ title: 'IPO Deleted' }); fetchIPOs(); }
  };

  const handleAddGMP = async () => {
    if (!gmpIpoId || !gmpDate || !gmpValue) return;
    const { error } = await supabase.from('gmp_updates').insert({
      ipo_id: gmpIpoId, date: gmpDate, gmp: parseFloat(gmpValue),
    });
    if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); return; }
    // Lock GMP for this IPO so cron auto-sync won't overwrite it
    await supabase.from('ipos').update({ gmp_is_manual: true }).eq('id', gmpIpoId);
    toast({ title: 'GMP Update Added', description: 'Auto-sync is now locked for this IPO.' });
    setGmpDate(''); setGmpValue('');
  };

  const handleSyncGMP = async () => {
    toast({ title: 'Syncing GMP from 3 sources…' });
    const { data, error } = await supabase.functions.invoke('sync-gmp');
    if (error) toast({ title: 'GMP sync failed', description: error.message, variant: 'destructive' });
    else toast({ title: 'GMP sync complete', description: `Updated ${data?.updated ?? 0} • Skipped ${data?.skipped ?? 0}` });
  };

  const handleUnlockGMP = async (ipoId: string) => {
    const { error } = await supabase.from('ipos').update({ gmp_is_manual: false }).eq('id', ipoId);
    if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
    else { toast({ title: 'GMP unlocked', description: 'Auto-sync will update this IPO again.' }); fetchIPOs(); }
  };

  const handleSaveBlog = async (formData: any) => {
    const { id, created_at, updated_at, ...payload } = formData;
    let error;
    if (isNewPost) {
      const { error: e } = await supabase.from('blog_posts').insert(payload);
      error = e;
    } else {
      const { error: e } = await supabase.from('blog_posts').update(payload).eq('id', id);
      error = e;
    }
    if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
    else { toast({ title: isNewPost ? 'Post Created' : 'Post Updated' }); setEditingPostInitial(null); setIsNewPost(false); fetchBlogPosts(); }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <TrendingUp className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-serif text-base font-bold text-foreground">Admin</span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="text-xs text-muted-foreground hidden sm:block truncate max-w-[150px]">{user?.email}</span>
            <button onClick={signOut} className="flex items-center gap-1.5 rounded-md bg-destructive/10 px-2.5 sm:px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/20 transition-colors">
              <LogOut className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-3 sm:px-4 py-4 sm:py-6">
        {/* Tabs */}
        <div className="flex gap-1 mb-4 sm:mb-6 overflow-x-auto">
          {([['ipos', 'IPOs', BarChart3], ['gmp', 'GMP', TrendingUp], ['blog', 'Blog', BookOpen]] as const).map(([key, label, Icon]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex items-center gap-1.5 sm:gap-2 rounded-md px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                tab === key ? 'bg-primary text-primary-foreground' : 'bg-card border border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> {label}
            </button>
          ))}
        </div>

        {/* IPO Tab */}
        {tab === 'ipos' && (
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <h2 className="font-serif text-lg sm:text-xl font-bold text-foreground">IPOs</h2>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={async () => {
                    toast({ title: 'Syncing IPOs from Chittorgarh…' });
                    const { data, error } = await supabase.functions.invoke('sync-ipos');
                    if (error) {
                      toast({ title: 'Sync failed', description: error.message, variant: 'destructive' });
                    } else {
                      toast({
                        title: 'Sync complete',
                        description: `Inserted ${data?.inserted ?? 0} • Updated ${data?.updated ?? 0} • Skipped manual ${data?.skippedManual ?? 0}`,
                      });
                      fetchIPOs();
                    }
                  }}
                  className="flex items-center gap-1.5 rounded-md bg-secondary px-3 py-2 text-xs font-semibold text-secondary-foreground hover:bg-accent transition-colors"
                >
                  Sync now
                </button>
                <button
                  onClick={() => { setEditingInitial({ ...emptyIPO }); setEditingId('new'); setIsNew(true); }}
                  className="flex items-center gap-1.5 rounded-md bg-gain px-3 py-2 text-xs font-semibold text-gain-foreground hover:opacity-90 transition-opacity"
                >
                  <Plus className="h-3.5 w-3.5" /> Add IPO
                </button>
              </div>
            </div>

            {editingInitial && (
              <IPOEditForm
                key={editingId}
                initial={editingInitial}
                isNew={isNew}
                onSave={handleSaveIPO}
                onCancel={() => { setEditingInitial(null); setEditingId(null); setIsNew(false); }}
              />
            )}

            {/* IPO Table */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card shadow-xs -mx-3 sm:mx-0">
              <table className="finance-table w-full min-w-[500px]">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Status</th>
                    <th className="hidden sm:table-cell">Price Band</th>
                    <th className="hidden sm:table-cell">Open</th>
                    <th className="hidden sm:table-cell">Close</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={6} className="text-center py-8 text-muted-foreground">Loading...</td></tr>
                  ) : ipos.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-8 text-muted-foreground">No IPOs found.</td></tr>
                  ) : ipos.map(ipo => (
                    <tr key={ipo.id}>
                      <td className="font-medium text-xs sm:text-sm">
                        {ipo.name}
                        <div className="sm:hidden text-[10px] text-muted-foreground mt-0.5">
                          ₹{ipo.price_band_low}-{ipo.price_band_high} · {new Date(ipo.open_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </div>
                      </td>
                      <td><span className={`status-badge status-${ipo.status} text-[10px] sm:text-xs`}>{ipo.status}</span></td>
                      <td className="hidden sm:table-cell">₹{ipo.price_band_low} - ₹{ipo.price_band_high}</td>
                      <td className="hidden sm:table-cell text-xs">{new Date(ipo.open_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}</td>
                      <td className="hidden sm:table-cell text-xs">{new Date(ipo.close_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}</td>
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-0.5 sm:gap-1">
                          <button onClick={() => { setEditingInitial({ ...ipo }); setEditingId(ipo.id); setIsNew(false); }} className="rounded p-1 sm:p-1.5 text-muted-foreground hover:text-primary hover:bg-accent transition-colors">
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button onClick={() => handleDeleteIPO(ipo.id)} className="rounded p-1 sm:p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* GMP Tab */}
        {tab === 'gmp' && (
          <div>
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <h2 className="font-serif text-lg sm:text-xl font-bold text-foreground">GMP Management</h2>
              <button
                onClick={handleSyncGMP}
                className="flex items-center gap-1.5 rounded-md bg-secondary px-3 py-2 text-xs font-semibold text-secondary-foreground hover:bg-accent transition-colors"
              >
                Sync GMP now
              </button>
            </div>
            <p className="text-xs text-muted-foreground mb-4">
              Auto-sync runs every 15 min from InvestorGain, Chittorgarh & IPOWatch (median).
              Manually adding GMP below locks that IPO from auto-updates.
            </p>

            <div className="bg-card border border-border rounded-lg p-4 sm:p-5 shadow-xs max-w-lg mb-6">
              <h3 className="font-semibold text-sm mb-3">Add Manual GMP Update</h3>
              <div className="space-y-3 sm:space-y-4">
                <Field label="Select IPO">
                  <select className={inputCls} value={gmpIpoId} onChange={e => setGmpIpoId(e.target.value)}>
                    <option value="">Choose an IPO...</option>
                    {ipos.map(ipo => <option key={ipo.id} value={ipo.id}>{ipo.name}{(ipo as any).gmp_is_manual ? ' 🔒' : ''}</option>)}
                  </select>
                </Field>
                <Field label="Date">
                  <input type="date" className={inputCls} value={gmpDate} onChange={e => setGmpDate(e.target.value)} />
                </Field>
                <Field label="GMP (₹)">
                  <input type="number" inputMode="numeric" className={inputCls} value={gmpValue} onChange={e => setGmpValue(e.target.value)} placeholder="e.g. 45 or -12" />
                </Field>
                <button
                  onClick={handleAddGMP}
                  disabled={!gmpIpoId || !gmpDate || !gmpValue}
                  className="flex items-center gap-1.5 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50 w-full sm:w-auto justify-center"
                >
                  <Plus className="h-3.5 w-3.5" /> Add GMP & Lock
                </button>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-sm mb-2">🔒 Manually-locked IPOs (excluded from auto-sync)</h3>
              <div className="space-y-1">
                {ipos.filter(i => (i as any).gmp_is_manual).length === 0 ? (
                  <p className="text-xs text-muted-foreground">None — all IPOs receive auto-sync updates.</p>
                ) : ipos.filter(i => (i as any).gmp_is_manual).map(ipo => (
                  <div key={ipo.id} className="flex items-center justify-between bg-card border border-border rounded px-3 py-2 text-xs">
                    <span className="font-medium">{ipo.name}</span>
                    <button onClick={() => handleUnlockGMP(ipo.id)} className="text-primary hover:underline">Unlock</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Blog Tab */}
        {tab === 'blog' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-serif text-lg sm:text-xl font-bold text-foreground">Blog Posts</h2>
              <button
                onClick={() => { setEditingPostInitial({ title: '', slug: '', content: '', excerpt: '', category: 'ipo-review', published: false, cover_image_url: '', published_at: null }); setIsNewPost(true); }}
                className="flex items-center gap-1.5 rounded-md bg-gain px-3 py-2 text-xs font-semibold text-gain-foreground hover:opacity-90 transition-opacity"
              >
                <Plus className="h-3.5 w-3.5" /> New Post
              </button>
            </div>

            {editingPostInitial && (
              <BlogEditForm
                key={editingPostInitial.id || 'new'}
                initial={editingPostInitial}
                isNew={isNewPost}
                onSave={handleSaveBlog}
                onCancel={() => { setEditingPostInitial(null); setIsNewPost(false); }}
              />
            )}

            <div className="overflow-x-auto rounded-lg border border-border bg-card shadow-xs -mx-3 sm:mx-0">
              <table className="finance-table w-full min-w-[400px]">
                <thead><tr><th>Title</th><th>Status</th><th className="hidden sm:table-cell">Category</th><th className="hidden sm:table-cell">Date</th><th className="text-right">Actions</th></tr></thead>
                <tbody>
                  {blogPosts.length === 0 ? (
                    <tr><td colSpan={5} className="text-center py-8 text-muted-foreground">No blog posts yet.</td></tr>
                  ) : blogPosts.map(post => (
                    <tr key={post.id}>
                      <td className="font-medium text-xs sm:text-sm">
                        {post.title}
                        <div className="sm:hidden text-[10px] text-muted-foreground mt-0.5">{post.category}</div>
                      </td>
                      <td><span className={`status-badge ${post.published ? 'status-open' : 'status-closed'} text-[10px] sm:text-xs`}>{post.published ? 'Published' : 'Draft'}</span></td>
                      <td className="hidden sm:table-cell text-xs">{post.category}</td>
                      <td className="hidden sm:table-cell text-xs">{post.published_at ? new Date(post.published_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—'}</td>
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-0.5 sm:gap-1">
                          <button onClick={() => { setEditingPostInitial({ ...post }); setIsNewPost(false); }} className="rounded p-1 sm:p-1.5 text-muted-foreground hover:text-primary hover:bg-accent transition-colors"><Edit2 className="h-3.5 w-3.5" /></button>
                          <button onClick={async () => { if (!confirm('Delete this post?')) return; await supabase.from('blog_posts').delete().eq('id', post.id); fetchBlogPosts(); }} className="rounded p-1 sm:p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminPanel;
