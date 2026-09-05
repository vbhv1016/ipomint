import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SITE = "https://gmp-tracker-pro.lovable.app";

Deno.serve(async () => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!
  );

  const staticPages = [
    { loc: "/", priority: "1.0", changefreq: "daily" },
    { loc: "/upcoming-ipo", priority: "0.9", changefreq: "daily" },
    { loc: "/ipo-gmp-list", priority: "0.9", changefreq: "daily" },
    { loc: "/ipo-subscription-status", priority: "0.8", changefreq: "daily" },
    { loc: "/ipo-allotment-status", priority: "0.8", changefreq: "daily" },
    { loc: "/ipo-allotment-calculator", priority: "0.7", changefreq: "monthly" },
    { loc: "/ipo-listing-gain-calculator", priority: "0.7", changefreq: "monthly" },
    { loc: "/compare", priority: "0.7", changefreq: "weekly" },
    { loc: "/blog", priority: "0.8", changefreq: "daily" },
  ];

  const { data: ipos } = await supabase
    .from("ipos")
    .select("slug, updated_at");

  const { data: posts } = await supabase
    .from("blog_posts")
    .select("slug, updated_at")
    .eq("published", true);

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

  for (const p of staticPages) {
    xml += `
  <url>
    <loc>${SITE}${p.loc}</loc>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`;
  }

  for (const ipo of ipos || []) {
    xml += `
  <url>
    <loc>${SITE}/ipo/${ipo.slug}</loc>
    <lastmod>${ipo.updated_at?.split("T")[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>`;
  }

  for (const post of posts || []) {
    xml += `
  <url>
    <loc>${SITE}/blog/${post.slug}</loc>
    <lastmod>${post.updated_at?.split("T")[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
  }

  xml += "\n</urlset>";

  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
});
