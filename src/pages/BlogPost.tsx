import { siteOrigin } from '@/lib/utils';
import { useParams, Link } from '@/lib/router-compat';
import { ArrowLeft, Calendar, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

/** Very light markdown→HTML for ## headings, **bold**, [links](url), - lists, --- hr, and paragraphs */
function renderMarkdown(content: string) {
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let listBuffer: string[] = [];
  let key = 0;

  const flushList = () => {
    if (listBuffer.length === 0) return;
    elements.push(
      <ul key={key++} className="list-disc list-inside space-y-1 text-sm text-muted-foreground mb-4">
        {listBuffer.map((item, i) => (
          <li key={i} dangerouslySetInnerHTML={{ __html: inlineFormat(item) }} />
        ))}
      </ul>
    );
    listBuffer = [];
  };

  const escapeHtml = (text: string) =>
    text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');

  const inlineFormat = (text: string) =>
    escapeHtml(text)
      .replace(/\*\*(.+?)\*\*/g, '<strong class="text-foreground font-semibold">$1</strong>')
      .replace(/\[([^\]]+?)\]\((https?:\/\/[^\s)]+|\/[^\s)]*)\)/g, '<a href="$2" class="text-primary hover:underline" rel="noopener noreferrer">$1</a>');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith('# ')) {
      flushList();
      elements.push(<h1 key={key++} className="font-serif text-2xl md:text-3xl font-bold text-foreground mb-4 mt-2">{line.slice(2)}</h1>);
    } else if (line.startsWith('## ')) {
      flushList();
      elements.push(<h2 key={key++} className="font-serif text-xl font-bold text-foreground mb-3 mt-8">{line.slice(3)}</h2>);
    } else if (line === '---') {
      flushList();
      elements.push(<hr key={key++} className="border-border my-6" />);
    } else if (line.startsWith('- ')) {
      listBuffer.push(line.slice(2));
    } else if (line.trim() === '') {
      flushList();
    } else {
      flushList();
      elements.push(<p key={key++} className="text-sm text-muted-foreground leading-relaxed mb-3" dangerouslySetInnerHTML={{ __html: inlineFormat(line) }} />);
    }
  }
  flushList();
  return elements;
}

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();

  const { data: post, isLoading } = useQuery({
    queryKey: ['blog-post', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug!)
        .eq('published', true)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });

  // Extract FAQ pairs for schema markup
  const faqPairs: { question: string; answer: string }[] = [];
  if (post?.content) {
    const faqMatch = post.content.match(/\*\*Q: (.+?)\*\*\nA: (.+?)(?=\n\n|\n\*\*Q:|$)/gs);
    if (faqMatch) {
      for (const block of faqMatch) {
        const qm = block.match(/\*\*Q: (.+?)\*\*/);
        const am = block.match(/\nA: (.+)/);
        if (qm && am) faqPairs.push({ question: qm[1], answer: am[1] });
      }
    }
  }

  const jsonLd = post ? {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    datePublished: post.published_at,
    dateModified: post.updated_at,
    description: post.excerpt,
    author: { '@type': 'Organization', name: 'IPOMint' },
    publisher: { '@type': 'Organization', name: 'IPOMint' },
    mainEntityOfPage: { '@type': 'WebPage', '@id': siteOrigin() + '/blog/' + slug },
    ...(faqPairs.length > 0 ? {} : {}),
  } : undefined;

  const faqJsonLd = faqPairs.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqPairs.map(f => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  } : null;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      {/* Inject FAQ schema separately */}
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-3xl">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-6">
          <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
          <span>/</span>
          <Link to="/blog" className="hover:text-foreground transition-colors">Blog</Link>
          <span>/</span>
          <span className="text-foreground truncate max-w-[200px]">{post?.title || 'Article'}</span>
        </nav>

        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {!isLoading && !post && (
          <div className="text-center py-16">
            <h1 className="font-serif text-2xl font-bold text-foreground mb-2">Post Not Found</h1>
            <p className="text-muted-foreground">This article doesn't exist or hasn't been published yet.</p>
          </div>
        )}

        {post && (
          <article>
            {post.cover_image_url && (
              <img src={post.cover_image_url} alt={post.title} className="w-full rounded-lg mb-6 max-h-96 object-cover" loading="lazy" />
            )}
            <span className="inline-block text-xs font-medium text-primary bg-primary/10 rounded-full px-2.5 py-0.5 mb-3">
              {post.category.replace('-', ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())}
            </span>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-8">
              <Calendar className="h-4 w-4" />
              {post.published_at
                ? new Date(post.published_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
                : ''}
            </div>
            <div className="prose-custom">
              {renderMarkdown(post.content)}
            </div>
          </article>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default BlogPost;
