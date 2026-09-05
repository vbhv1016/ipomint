import { createServerFn } from "@tanstack/react-start";

export type NewsItem = {
  title: string;
  link: string;
  source: string;
  pubDate: string;
  description: string;
};

const FEEDS: { name: string; url: string }[] = [
  { name: "IPO News", url: "https://economictimes.indiatimes.com/markets/ipos/fpos/rssfeeds/14655708.cms" },
  { name: "Markets", url: "https://www.business-standard.com/rss/markets-106.rss" },
  { name: "Markets", url: "https://www.livemint.com/rss/markets" },
  { name: "IPO News", url: "https://news.google.com/rss/search?q=IPO+India+when:7d&hl=en-IN&gl=IN&ceid=IN:en" },
  { name: "Stock Market", url: "https://news.google.com/rss/search?q=stock+market+India+Nifty+Sensex+when:2d&hl=en-IN&gl=IN&ceid=IN:en" },
];

function decode(str: string): string {
  return str
    .replace(/<!\[CDATA\[(.*?)\]\]>/gs, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, n) => String.fromCharCode(parseInt(n, 16)))
    .replace(/&nbsp;/g, " ")
    .replace(/&rsquo;/g, "\u2019")
    .replace(/&lsquo;/g, "\u2018")
    .replace(/&ldquo;/g, "\u201c")
    .replace(/&rdquo;/g, "\u201d")
    .replace(/&apos;/g, "'")
    .replace(/\s{2,}/g, " ");
}

function stripTags(str: string): string {
  return str.replace(/<[^>]*>/g, "").trim();
}

function parseRss(xml: string, feedName: string): NewsItem[] {
  const items: NewsItem[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let m: RegExpExecArray | null;
  while ((m = itemRegex.exec(xml))) {
    const block = m[1];
    const pick = (tag: string) => {
      const r = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`).exec(block);
      return r ? decode(r[1]).trim() : "";
    };
    const title = stripTags(pick("title"));
    const link = pick("link");
    const pubDate = pick("pubDate");
    const description = stripTags(pick("description")).slice(0, 220);
    const sourceMatch = /<source[^>]*>([\s\S]*?)<\/source>/.exec(block);
    const source = sourceMatch ? decode(sourceMatch[1]).trim() : feedName;
    if (title && link) items.push({ title, link, source, pubDate, description });
  }
  return items;
}

export const getMarketNews = createServerFn({ method: "GET" }).handler(async () => {
  const results = await Promise.allSettled(
    FEEDS.map(async (f) => {
      const res = await fetch(f.url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
          Accept: "application/rss+xml, application/xml, text/xml, */*",
        },
      });
      if (!res.ok) throw new Error(`Feed ${f.name} ${res.status}`);
      const xml = await res.text();
      return parseRss(xml, f.name);
    })
  );

  const all: NewsItem[] = [];
  results.forEach((r) => {
    if (r.status === "fulfilled") all.push(...r.value);
  });

  // Dedupe by title, sort newest first
  const seen = new Set<string>();
  const deduped = all.filter((n) => {
    const k = n.title.toLowerCase();
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
  deduped.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());

  return { items: deduped.slice(0, 60), updatedAt: new Date().toISOString() };
});
