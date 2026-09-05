import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

const BASE_URL = "https://ipomint.in";

interface SitemapEntry {
  path: string;
  lastmod?: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

const STATIC: SitemapEntry[] = [
  { path: "/", changefreq: "daily", priority: "1.0" },
  { path: "/ipo-calendar", changefreq: "daily", priority: "0.9" },
  { path: "/upcoming-ipo", changefreq: "daily", priority: "0.9" },
  { path: "/ipo-gmp-list", changefreq: "daily", priority: "0.9" },
  { path: "/ipo-subscription-status", changefreq: "daily", priority: "0.8" },
  { path: "/ipo-allotment-status", changefreq: "daily", priority: "0.8" },
  { path: "/ipo-performance", changefreq: "daily", priority: "0.9" },
  { path: "/ipo-allotment-calculator", changefreq: "monthly", priority: "0.7" },
  { path: "/ipo-listing-gain-calculator", changefreq: "monthly", priority: "0.7" },
  { path: "/compare", changefreq: "weekly", priority: "0.7" },
  { path: "/blog", changefreq: "daily", priority: "0.8" },
  { path: "/disclaimer", changefreq: "yearly", priority: "0.3" },
  { path: "/privacy", changefreq: "yearly", priority: "0.3" },
  { path: "/terms", changefreq: "yearly", priority: "0.3" },
];

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const url = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
        const key = process.env.SUPABASE_PUBLISHABLE_KEY ?? process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

        const entries: SitemapEntry[] = [...STATIC];

        if (url && key) {
          try {
            const supabase = createClient<Database>(url, key, {
              auth: { persistSession: false, autoRefreshToken: false },
            });
            const [ipoRes, postRes] = await Promise.all([
              supabase.from("ipos").select("slug, updated_at"),
              supabase.from("blog_posts").select("slug, updated_at").eq("published", true),
            ]);
            for (const r of ipoRes.data ?? []) {
              if (!r.slug) continue;
              entries.push({
                path: `/ipo/${r.slug}`,
                lastmod: r.updated_at?.split("T")[0],
                changefreq: "daily",
                priority: "0.9",
              });
            }
            for (const r of postRes.data ?? []) {
              if (!r.slug) continue;
              entries.push({
                path: `/blog/${r.slug}`,
                lastmod: r.updated_at?.split("T")[0],
                changefreq: "weekly",
                priority: "0.7",
              });
            }
          } catch (err) {
            console.error("sitemap: failed to load dynamic routes", err);
          }
        }

        const urls = entries.map((e) =>
          [
            `  <url>`,
            `    <loc>${BASE_URL}${e.path}</loc>`,
            e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
            e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
            e.priority ? `    <priority>${e.priority}</priority>` : null,
            `  </url>`,
          ]
            .filter(Boolean)
            .join("\n"),
        );

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
