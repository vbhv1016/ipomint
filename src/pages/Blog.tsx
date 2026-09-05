import { Link } from '@/lib/router-compat';
import { Calendar, ArrowRight, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const Blog = () => {
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['blog-posts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('published', true)
        .order('published_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    staleTime: 60_000,
  });

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      <main className="flex-1">
        <section className="bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 py-10">
            <h1 className="font-serif text-3xl md:text-4xl font-bold mb-2">IPO Blog</h1>
            <p className="text-primary-foreground/70 text-sm md:text-base">
              Expert reviews, GMP analysis, and IPO market insights.
            </p>
          </div>
        </section>

        <div className="container mx-auto px-4 py-8">
          {isLoading && (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          )}

          {!isLoading && posts.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">
              <p className="text-lg">No blog posts yet. Check back soon!</p>
            </div>
          )}

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map(post => (
              <Link
                key={post.id}
                to={`/blog/${post.slug}`}
                className="group bg-card border border-border rounded-lg overflow-hidden shadow-xs hover:shadow-md transition-shadow"
              >
                {post.cover_image_url && (
                  <img
                    src={post.cover_image_url}
                    alt={post.title}
                    className="w-full h-48 object-cover"
                    loading="lazy"
                  />
                )}
                <div className="p-5">
                  <span className="inline-block text-xs font-medium text-primary bg-primary/10 rounded-full px-2.5 py-0.5 mb-3">
                    {post.category.replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                  </span>
                  <h2 className="font-serif text-lg font-bold text-foreground group-hover:text-primary transition-colors mb-2">
                    {post.title}
                  </h2>
                  {post.excerpt && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{post.excerpt}</p>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" />
                      {post.published_at
                        ? new Date(post.published_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                        : 'Draft'}
                    </div>
                    <span className="flex items-center gap-1 text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                      Read <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Blog;
