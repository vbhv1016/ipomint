import { describe, it, expect } from "vitest";

/**
 * Verifies per-IPO Open Graph and Twitter Card tags are present in the
 * server-rendered HTML for each listing page. Runs against the dev/preview
 * server at TEST_BASE_URL (default http://localhost:8080).
 *
 * IPO slugs are fetched live from the public Supabase REST endpoint so the
 * suite covers whatever is currently listed. Override with TEST_IPO_SLUGS
 * ("slug-a,slug-b") to pin a set.
 */

const BASE_URL = process.env.TEST_BASE_URL ?? "http://localhost:8080";
const SUPABASE_URL = "https://afooethkayssfpjqzjvv.supabase.co";
const SUPABASE_ANON =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFmb29ldGhrYXlzc2ZwanF6anZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyMDUzNTIsImV4cCI6MjA4Nzc4MTM1Mn0.8Zh0wm7suhp9zaXD_bQWv_8t9R6UvP-5GhuhO63fMXI";

type IPO = { slug: string; name: string };

async function serverReachable(): Promise<boolean> {
  try {
    const res = await fetch(BASE_URL + "/", { method: "HEAD" });
    return res.ok || res.status < 500;
  } catch {
    return false;
  }
}

async function fetchSlugs(): Promise<IPO[]> {
  const override = process.env.TEST_IPO_SLUGS;
  if (override) return override.split(",").map((s) => ({ slug: s.trim(), name: s.trim() }));

  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/ipos?select=slug,name&slug=not.is.null&limit=5&order=updated_at.desc`,
    { headers: { apikey: SUPABASE_ANON, Authorization: `Bearer ${SUPABASE_ANON}` } },
  );
  if (!res.ok) throw new Error(`Failed to fetch IPO slugs: ${res.status}`);
  return (await res.json()) as IPO[];
}

function metaContent(html: string, attr: "property" | "name", key: string): string | null {
  const re = new RegExp(
    `<meta[^>]*${attr}=["']${key}["'][^>]*content=["']([^"']*)["']|<meta[^>]*content=["']([^"']*)["'][^>]*${attr}=["']${key}["']`,
    "i",
  );
  const m = html.match(re);
  return m ? (m[1] ?? m[2] ?? null) : null;
}

function titleTag(html: string): string | null {
  const m = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  return m ? m[1] : null;
}

// Resolve at collection time so it.each can enumerate real slugs.
const reachable = await serverReachable();
const ipos: IPO[] = reachable ? await fetchSlugs() : [];

describe("SSR OG/Twitter meta for IPO detail pages", () => {
  it("dev/preview server is reachable and returned IPOs to test", () => {
    if (!reachable) {
      console.warn(`Skipping SSR meta tests: ${BASE_URL} not reachable`);
      return;
    }
    expect(ipos.length).toBeGreaterThan(0);
  });

  it.each(
    (ipos.length ? ipos : [{ slug: "__placeholder__", name: "placeholder" }]).map((i) => [
      i.slug,
      i.name,
    ]),
  )("renders full OG + Twitter tags for /ipo/%s", async (slug, name) => {
    if (!reachable || slug === "__placeholder__") return;

    const res = await fetch(`${BASE_URL}/ipo/${slug}`);
    expect(res.status, `HTTP ${res.status} for ${slug}`).toBe(200);
    const html = await res.text();

    const title = titleTag(html);
    const description = metaContent(html, "name", "description");
    const ogTitle = metaContent(html, "property", "og:title");
    const ogDescription = metaContent(html, "property", "og:description");
    const ogUrl = metaContent(html, "property", "og:url");
    const ogImage = metaContent(html, "property", "og:image");
    const ogType = metaContent(html, "property", "og:type");
    const twCard = metaContent(html, "name", "twitter:card");
    const twTitle = metaContent(html, "name", "twitter:title");
    const twDescription = metaContent(html, "name", "twitter:description");
    const twImage = metaContent(html, "name", "twitter:image");

    // Presence
    expect(title, "title").toBeTruthy();
    expect(description, "description").toBeTruthy();
    expect(ogTitle, "og:title").toBeTruthy();
    expect(ogDescription, "og:description").toBeTruthy();
    expect(ogUrl, "og:url").toBeTruthy();
    expect(ogImage, "og:image").toBeTruthy();
    expect(ogType, "og:type").toBeTruthy();
    expect(twCard, "twitter:card").toBe("summary_large_image");
    expect(twTitle, "twitter:title").toBeTruthy();
    expect(twDescription, "twitter:description").toBeTruthy();
    expect(twImage, "twitter:image").toBeTruthy();

    // Content-specific: title/description must mention IPO name and stay in SEO limits
    const firstWord = name.split(/\s+/)[0];
    expect(title!.toLowerCase(), "title mentions IPO").toContain(firstWord.toLowerCase());
    expect(title!.length, "title ≤ 65 chars").toBeLessThanOrEqual(65);
    expect(description!.length, "description ≤ 165 chars").toBeLessThanOrEqual(165);

    // OG must self-reference this route (canonical/og:url alignment)
    expect(ogUrl, "og:url points at this route").toContain(`/ipo/${slug}`);

    // Image URLs must be absolute https
    expect(ogImage, "og:image absolute https").toMatch(/^https:\/\//);
    expect(twImage, "twitter:image absolute https").toMatch(/^https:\/\//);

    // Cross-consistency
    expect(ogTitle, "og:title mirrors <title>").toBe(title);
    expect(twTitle, "twitter:title mirrors og:title").toBe(ogTitle);
    expect(twDescription, "twitter:description mirrors og:description").toBe(ogDescription);
    expect(twImage, "twitter:image mirrors og:image").toBe(ogImage);
  }, 20000);
});
