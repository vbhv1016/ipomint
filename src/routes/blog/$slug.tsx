import { createFileRoute } from "@tanstack/react-router";
import BlogPost from "@/pages/BlogPost";
import { supabase } from "@/integrations/supabase/client";

const SITE = "https://ipomint.in";

export const Route = createFileRoute("/blog/$slug")({
  component: BlogPost,
  loader: async ({ params }) => {
    const { data } = await supabase
      .from("blog_posts")
      .select("title,excerpt,published_at,updated_at,slug")
      .eq("slug", params.slug)
      .eq("published", true)
      .maybeSingle();
    return { post: data };
  },
  head: ({ params, loaderData }) => {
    const url = `${SITE}/blog/${params.slug}`;
    const post = loaderData?.post;

    if (!post) {
      return {
        meta: [
          { title: `Article not found: ${params.slug} | IPOMint Blog` },
          {
            name: "description",
            content: `The blog article "${params.slug}" is not available. Browse the latest IPO reviews and GMP analysis on IPOMint.`,
          },
          { name: "robots", content: "noindex, follow" },
          { property: "og:url", content: url },
        ],
        links: [{ rel: "canonical", href: url }],
      };
    }

    const title = `${post.title} | IPOMint Blog`.slice(0, 70);
    const description = (
      post.excerpt ?? `${post.title} — IPO analysis, grey market premium and key dates on IPOMint.`
    ).slice(0, 158);

    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:type", content: "article" },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:url", content: url },
        { property: "article:published_time", content: post.published_at ?? "" },
        { property: "article:modified_time", content: post.updated_at ?? "" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },
});
