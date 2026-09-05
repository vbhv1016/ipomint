// Scrapes Indian IPO data from Chittorgarh in two steps:
// 1) Pull the IPO list from /ipo/ipo_dashboard.asp (and ?a=sme for SME).
// 2) For each new/updated IPO, fetch its detail page and parse the key/value table.
// Rows where is_manual=true are NEVER overwritten — admin edits win.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.98.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';
const BASE = 'https://www.chittorgarh.com';

function slugify(name: string): string {
  return name.toLowerCase().replace(/&[a-z]+;/g, ' ').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 80);
}

function decodeEntities(s: string): string {
  return s.replace(/&amp;/g, '&').replace(/&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&nbsp;/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
}

function stripTags(html: string): string {
  // IMPORTANT: strip currency entities BEFORE decoding so "&#8377;" (₹) doesn't become digits "8377".
  const noCurrency = html
    .replace(/&#8377;/g, ' ')   // ₹
    .replace(/&#x20B9;/gi, ' ')
    .replace(/&rupee;/gi, ' ');
  const decoded = decodeEntities(noCurrency.replace(/<!--[\s\S]*?-->/g, '').replace(/<[^>]+>/g, ' '));
  // Also remove literal ₹ glyph and stray currency words.
  return decoded.replace(/[₹$]/g, ' ').replace(/\s+/g, ' ').trim();
}

function parseDate(s: string | null | undefined): string | null {
  if (!s) return null;
  const cleaned = s.trim().replace(/^[A-Za-z]{3},\s*/, '').replace(/\s+T$/, '').trim();
  if (!cleaned || /^[-–—\.]+$/.test(cleaned)) return null;
  const t = Date.parse(cleaned);
  if (!isNaN(t)) return new Date(t).toISOString().slice(0, 10);
  return null;
}

// "30 Apr to 5 May, 2026" → [open, close]
function parseDateRange(s: string): [string | null, string | null] {
  if (!s) return [null, null];
  const yearMatch = s.match(/\b(20\d{2})\b/);
  const year = yearMatch ? yearMatch[1] : String(new Date().getFullYear());
  const m = s.match(/(\d{1,2})\s*([A-Za-z]{3,})?\s*(?:to|-|–)\s*(\d{1,2})\s*([A-Za-z]{3,})/);
  if (!m) return [null, null];
  const [, d1, mo1raw, d2, mo2] = m;
  const mo1 = mo1raw || mo2;
  const open = parseDate(`${d1} ${mo1} ${year}`);
  const close = parseDate(`${d2} ${mo2} ${year}`);
  return [open, close];
}

function parseNumber(s: string | null | undefined): number | null {
  if (!s) return null;
  const n = parseFloat(s.replace(/[^\d.\-]/g, ''));
  return isNaN(n) ? null : n;
}

async function fetchPage(url: string): Promise<string> {
  const res = await fetch(url, { headers: { 'User-Agent': UA, 'Accept': 'text/html' } });
  if (!res.ok) throw new Error(`Fetch ${url} failed: ${res.status}`);
  return res.text();
}

type Listing = { name: string; detailUrl: string; exchange: string; dateText: string };

// Parse the dashboard list table. We grab anchors with href matching /ipo/...-ipo/<id>/.
function parseListing(html: string, exchange: string): Listing[] {
  const out: Listing[] = [];
  const seen = new Set<string>();
  // Each row has: <a ... title="Name" href="/ipo/slug/id/">Name</a> ... <span class="float-end ms-2">date</span>
  const rowRe = /<a[^>]*title="([^"]+)"[^>]*href="(\/ipo\/[^"]+?\/\d+\/)"[\s\S]*?<span class="float-end[^"]*"[^>]*>([^<]+)<\/span>/g;
  let m: RegExpExecArray | null;
  while ((m = rowRe.exec(html)) !== null) {
    const name = decodeEntities(m[1]).trim();
    const detailUrl = BASE + m[2];
    if (seen.has(detailUrl)) continue;
    seen.add(detailUrl);
    out.push({ name, detailUrl, exchange, dateText: m[3].trim() });
  }
  return out;
}

type Details = {
  open_date: string | null;
  close_date: string | null;
  listing_date: string | null;
  price_band_low: number | null;
  price_band_high: number | null;
  lot_size: number | null;
  exchange: string | null;
};

function parseDetailPage(html: string): Details {
  const result: Details = {
    open_date: null, close_date: null, listing_date: null,
    price_band_low: null, price_band_high: null, lot_size: null, exchange: null,
  };
  // First table holds the key/value pairs.
  const tbls = html.match(/<table[\s\S]*?<\/table>/g) ?? [];
  if (tbls.length === 0) return result;
  const rows = tbls[0]!.match(/<tr[\s\S]*?<\/tr>/g) ?? [];
  const kv: Record<string, string> = {};
  for (const r of rows) {
    const cells = [...r.matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/g)].map(x => stripTags(x[1]));
    if (cells.length >= 2) kv[cells[0].toLowerCase()] = cells[1];
  }

  if (kv['ipo date']) {
    const [o, c] = parseDateRange(kv['ipo date']);
    result.open_date = o; result.close_date = c;
  }
  // "Listing Date" or "Listed on" both mean the listing date.
  if (kv['listing date']) result.listing_date = parseDate(kv['listing date']);
  else if (kv['listed on']) result.listing_date = parseDate(kv['listed on']);

  // Price band — strip commas, take first two numbers (low, high). Currency symbols already removed by stripTags.
  const priceTxt = (kv['price band'] || '').replace(/,/g, '');
  const priceNums = priceTxt.match(/\d+(?:\.\d+)?/g);
  if (priceNums && priceNums.length >= 2) {
    result.price_band_low = +priceNums[0];
    result.price_band_high = +priceNums[1];
  } else if (priceNums && priceNums.length === 1) {
    result.price_band_low = result.price_band_high = +priceNums[0];
  }
  // Fallback: "Issue Price" if price band missing (fixed-price issues).
  if (result.price_band_low === null && kv['issue price']) {
    const m = kv['issue price'].replace(/,/g, '').match(/\d+(?:\.\d+)?/);
    if (m) result.price_band_low = result.price_band_high = +m[0];
  }

  // Lot size — strip commas first so "1,600" parses as 1600.
  const lotTxt = (kv['lot size'] || '').replace(/,/g, '');
  const lotNums = lotTxt.match(/\d+/g);
  if (lotNums && lotNums.length > 0) result.lot_size = +lotNums[0];


  const listingAt = (kv['listing at'] || '').toUpperCase();
  if (listingAt.includes('NSE') && listingAt.includes('BSE')) result.exchange = 'NSE & BSE';
  else if (listingAt.includes('SME')) result.exchange = listingAt.includes('NSE') ? 'NSE SME' : 'BSE SME';
  else if (listingAt.includes('NSE')) result.exchange = 'NSE';
  else if (listingAt.includes('BSE')) result.exchange = 'BSE';

  return result;
}

type ListingPerf = { issue_price: number | null; listing_price: number | null; last_trade: number | null };

// Parses the "Price Details" table on a listed IPO's detail page:
// rows are: label | BSE | NSE  →  Final Issue Price / Open / Low / High / Last Trade
function parseListingPerformance(html: string): ListingPerf {
  const out: ListingPerf = { issue_price: null, listing_price: null, last_trade: null };
  const tbls = html.match(/<table[\s\S]*?<\/table>/g) ?? [];
  const perfTbl = tbls.find(t => /final issue price/i.test(stripTags(t)));
  if (!perfTbl) return out;
  const rows = perfTbl.match(/<tr[\s\S]*?<\/tr>/g) ?? [];
  const pick = (cells: string[]): number | null => {
    for (let i = 1; i < cells.length; i++) {
      const n = parseNumber(cells[i].replace(/,/g, ''));
      if (n !== null && n > 0) return n;
    }
    return null;
  };
  for (const r of rows) {
    const cells = [...r.matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/g)].map(x => stripTags(x[1]));
    if (cells.length < 2) continue;
    const label = cells[0].toLowerCase();
    if (label.includes('final issue price')) out.issue_price = pick(cells);
    else if (label === 'open' || label.startsWith('open')) out.listing_price = pick(cells);
    else if (label.includes('last trade')) out.last_trade = pick(cells);
  }
  return out;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const startedAt = Date.now();
  try {
    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

    // Require shared secret (set by scheduled cron / trusted admin caller).
    const provided = req.headers.get('x-sync-secret') ?? '';
    const { data: cfg } = await supabase.from('_sync_config').select('secret').eq('id', 1).maybeSingle();
    const expected = cfg?.secret ?? '';
    if (!expected || provided !== expected) {
      return new Response(JSON.stringify({ success: false, error: 'unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const sources = [
      { url: `${BASE}/ipo/ipo_dashboard.asp`, exchange: 'NSE & BSE' },
      { url: `${BASE}/ipo/ipo_dashboard.asp?a=sme`, exchange: 'NSE SME' },
    ];

    const listings: Listing[] = [];
    for (const src of sources) {
      try {
        const html = await fetchPage(src.url);
        const items = parseListing(html, src.exchange);
        listings.push(...items);
      } catch (e) {
        console.error('List fetch failed', src.url, e);
      }
    }

    // Existing rows by slug — include price/lot so we can prioritize rows missing details.
    const { data: existing } = await supabase.from('ipos').select('id, slug, is_manual, last_synced_at, price_band_high, price_band_low, lot_size');
    const exMap = new Map((existing ?? []).map((r: any) => [r.slug, r]));

    // Cap detail fetches per run to keep within edge-function timeout (~60s).
    const MAX_DETAILS = 40;
    let inserted = 0, updated = 0, skippedManual = 0, detailFetched = 0, skippedNoData = 0;
    const errors: string[] = [];
    const today = new Date().toISOString().slice(0, 10);

    // Prioritize: (1) new listings, (2) existing rows missing price/lot data.
    // Rows that already have good price data go last so incomplete rows get filled first.
    const prioritized = [...listings].sort((a, b) => {
      const ea = exMap.get(slugify(a.name));
      const eb = exMap.get(slugify(b.name));
      const needA = !ea || !ea.price_band_high || Number(ea.price_band_high) === 0 ? 0 : 1;
      const needB = !eb || !eb.price_band_high || Number(eb.price_band_high) === 0 ? 0 : 1;
      return needA - needB;
    });

    for (const item of prioritized) {
      const slug = slugify(item.name);
      const ex = exMap.get(slug);
      if (ex && ex.is_manual) { skippedManual++; continue; }

      let details: Details = {
        open_date: null, close_date: null, listing_date: null,
        price_band_low: null, price_band_high: null, lot_size: null, exchange: null,
      };

      // Fallback dates from listing text "30 Apr - 05 May"
      const [lo, lc] = parseDateRange(item.dateText + ', ' + new Date().getFullYear());
      details.open_date = lo;
      details.close_date = lc;

      let gotDetails = false;
      if (detailFetched < MAX_DETAILS) {
        try {
          const dHtml = await fetchPage(item.detailUrl);
          const parsed = parseDetailPage(dHtml);
          details = {
            open_date: parsed.open_date ?? details.open_date,
            close_date: parsed.close_date ?? details.close_date,
            listing_date: parsed.listing_date,
            price_band_low: parsed.price_band_low,
            price_band_high: parsed.price_band_high,
            lot_size: parsed.lot_size,
            exchange: parsed.exchange,
          };
          detailFetched++;
          gotDetails = parsed.price_band_high !== null && parsed.price_band_high > 0;
        } catch (e: any) {
          errors.push(`detail ${slug}: ${e.message ?? e}`);
        }
      }

      // Skip rows we can't populate with real data — never insert a 0/0 placeholder,
      // and never overwrite a good existing row with zeros when detail fetch was skipped/failed.
      if (!gotDetails) {
        if (!ex) { skippedNoData++; continue; }
        // Existing row: only refresh dates/status if we parsed them from the listing.
        const softPayload: any = { last_synced_at: new Date().toISOString(), is_manual: false };
        if (details.open_date) softPayload.open_date = details.open_date;
        if (details.close_date) softPayload.close_date = details.close_date;
        try {
          const { error } = await supabase.from('ipos').update(softPayload).eq('id', ex.id);
          if (error) throw error;
          updated++;
        } catch (e: any) {
          errors.push(`soft-update ${slug}: ${e.message ?? e}`);
        }
        continue;
      }

      let status = 'upcoming';
      if (details.listing_date && details.listing_date <= today) status = 'listed';
      else if (details.close_date && details.close_date < today) status = 'closed';
      else if (details.open_date && details.open_date <= today && details.close_date && details.close_date >= today) status = 'open';

      const payload: any = {
        name: item.name,
        slug,
        exchange: details.exchange ?? item.exchange,
        lot_size: details.lot_size ?? 1,
        price_band_low: details.price_band_low ?? 0,
        price_band_high: details.price_band_high ?? 0,
        open_date: details.open_date ?? today,
        close_date: details.close_date ?? today,
        listing_date: details.listing_date,
        status,
        source_url: item.detailUrl,
        last_synced_at: new Date().toISOString(),
        is_manual: false,
      };

      try {
        if (ex) {
          const { error } = await supabase.from('ipos').update(payload).eq('id', ex.id);
          if (error) throw error;
          updated++;
        } else {
          const { error } = await supabase.from('ipos').insert(payload);
          if (error) throw error;
          inserted++;
        }
      } catch (e: any) {
        errors.push(`save ${slug}: ${e.message ?? e}`);
      }
    }


    return new Response(JSON.stringify({
      success: true,
      listings: listings.length,
      detailFetched,
      inserted,
      updated,
      skippedManual,
      skippedNoData,
      tookMs: Date.now() - startedAt,
      errors: errors.slice(0, 10),
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e: any) {
    console.error(e);
    return new Response(JSON.stringify({ success: false, error: e.message ?? String(e) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
