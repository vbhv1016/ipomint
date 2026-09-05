// Scrapes GMP from 3 sources (InvestorGain, Chittorgarh, IPOWatch),
// averages (median) the values and updates ipos.gmp where gmp_is_manual = false.
// Also writes a row in gmp_updates for history.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

type GmpRow = { name: string; gmp: number };

// ---------- helpers ----------
function normName(s: string): string {
  return s
    .toLowerCase()
    .replace(/\b(ipo|limited|ltd|pvt|private|the)\b/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function median(nums: number[]): number {
  if (!nums.length) return 0;
  const s = [...nums].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

function parseNum(s: string): number | null {
  const m = s.replace(/,/g, "").match(/-?\d+(\.\d+)?/);
  return m ? Number(m[0]) : null;
}

async function fetchHtml(url: string): Promise<string> {
  const r = await fetch(url, {
    headers: {
      "User-Agent": UA,
      Accept: "text/html,application/xhtml+xml",
    },
  });
  if (!r.ok) throw new Error(`${url} -> ${r.status}`);
  return await r.text();
}

// strip tags, decode a few entities
function stripTags(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#?\w+;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// extract <table>...</table> blocks
function extractTables(html: string): string[] {
  const out: string[] = [];
  const re = /<table[\s\S]*?<\/table>/gi;
  let m;
  while ((m = re.exec(html)) !== null) out.push(m[0]);
  return out;
}

function extractRows(table: string): string[][] {
  const rows: string[][] = [];
  const trRe = /<tr[\s\S]*?<\/tr>/gi;
  let tr;
  while ((tr = trRe.exec(table)) !== null) {
    const cells: string[] = [];
    const cellRe = /<t[hd][^>]*>([\s\S]*?)<\/t[hd]>/gi;
    let c;
    while ((c = cellRe.exec(tr[0])) !== null) {
      cells.push(stripTags(c[1]));
    }
    if (cells.length) rows.push(cells);
  }
  return rows;
}

// ---------- sources ----------
async function fromInvestorGain(): Promise<GmpRow[]> {
  const html = await fetchHtml("https://www.investorgain.com/report/live-ipo-gmp/331/");
  const out: GmpRow[] = [];
  for (const table of extractTables(html)) {
    const rows = extractRows(table);
    if (rows.length < 2) continue;
    const header = rows[0].map((h) => h.toLowerCase());
    const nameIdx = header.findIndex((h) => h.includes("ipo"));
    const gmpIdx = header.findIndex((h) => h.includes("gmp"));
    if (nameIdx < 0 || gmpIdx < 0) continue;
    for (const r of rows.slice(1)) {
      const name = r[nameIdx]?.replace(/BSE SME|NSE SME|Mainboard/gi, "").trim();
      const gmp = parseNum(r[gmpIdx] ?? "");
      if (name && gmp !== null) out.push({ name, gmp });
    }
  }
  return out;
}

async function fromIpoWatch(): Promise<GmpRow[]> {
  const html = await fetchHtml("https://ipowatch.in/ipo-grey-market-premium-latest-ipo-gmp/");
  const out: GmpRow[] = [];
  for (const table of extractTables(html)) {
    const rows = extractRows(table);
    if (rows.length < 2) continue;
    const header = rows[0].map((h) => h.toLowerCase());
    const nameIdx = header.findIndex((h) => h.includes("ipo") || h.includes("name"));
    const gmpIdx = header.findIndex((h) => h.includes("gmp") || h.includes("premium"));
    if (nameIdx < 0 || gmpIdx < 0) continue;
    for (const r of rows.slice(1)) {
      const name = r[nameIdx]?.trim();
      const gmp = parseNum(r[gmpIdx] ?? "");
      if (name && gmp !== null) out.push({ name, gmp });
    }
  }
  return out;
}

async function fromChittorgarh(): Promise<GmpRow[]> {
  const html = await fetchHtml("https://www.chittorgarh.com/report/ipo-grey-market-premium-kostak-rates/4/");
  const out: GmpRow[] = [];
  for (const table of extractTables(html)) {
    const rows = extractRows(table);
    if (rows.length < 2) continue;
    const header = rows[0].map((h) => h.toLowerCase());
    const nameIdx = header.findIndex((h) => h.includes("ipo") || h.includes("name"));
    const gmpIdx = header.findIndex((h) => h.includes("gmp") || h.includes("premium"));
    if (nameIdx < 0 || gmpIdx < 0) continue;
    for (const r of rows.slice(1)) {
      const name = r[nameIdx]?.trim();
      const gmp = parseNum(r[gmpIdx] ?? "");
      if (name && gmp !== null) out.push({ name, gmp });
    }
  }
  return out;
}

// ---------- handler ----------
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  // Require shared secret so unauthenticated internet callers can't trigger this.
  const provided = req.headers.get("x-sync-secret") ?? "";
  const { data: cfg } = await supabase.from("_sync_config").select("secret").eq("id", 1).maybeSingle();
  const expected = cfg?.secret ?? "";
  if (!expected || provided !== expected) {
    return new Response(JSON.stringify({ success: false, error: "unauthorized" }), {
      status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const sources = await Promise.allSettled([
      fromInvestorGain(),
      fromChittorgarh(),
      fromIpoWatch(),
    ]);

    const labels = ["investorgain", "chittorgarh", "ipowatch"];
    const collected: Record<string, { source: string; gmp: number }[]> = {};

    sources.forEach((res, i) => {
      if (res.status !== "fulfilled") {
        console.error(`source ${labels[i]} failed`, res.reason);
        return;
      }
      for (const row of res.value) {
        const key = normName(row.name);
        if (!key) continue;
        (collected[key] ||= []).push({ source: labels[i], gmp: row.gmp });
      }
    });

    // pull IPOs that are not manually locked and currently active-ish
    const { data: ipos, error } = await supabase
      .from("ipos")
      .select("id, name, gmp_is_manual, status")
      .eq("gmp_is_manual", false)
      .in("status", ["upcoming", "open", "closed"]);

    if (error) throw error;

    let updated = 0;
    let skipped = 0;
    const today = new Date().toISOString().slice(0, 10);

    for (const ipo of ipos ?? []) {
      const key = normName(ipo.name);
      // try exact then prefix match
      let hits = collected[key];
      if (!hits) {
        const altKey = Object.keys(collected).find(
          (k) => k.startsWith(key) || key.startsWith(k),
        );
        if (altKey) hits = collected[altKey];
      }
      if (!hits || hits.length === 0) {
        skipped++;
        continue;
      }
      const med = median(hits.map((h) => h.gmp));

      const { error: upErr } = await supabase
        .from("ipos")
        .update({
          gmp_last_synced_at: new Date().toISOString(),
          gmp_sources: hits,
        })
        .eq("id", ipo.id);

      if (upErr) console.error("ipo metadata update failed", ipo.id, upErr);

      // upsert today's GMP into history (delete existing for today first to avoid dupes from cron)
      await supabase
        .from("gmp_updates")
        .delete()
        .eq("ipo_id", ipo.id)
        .eq("date", today);

      const { error: insErr } = await supabase.from("gmp_updates").insert({
        ipo_id: ipo.id,
        gmp: med,
        date: today,
      });
      if (insErr) {
        console.error("gmp insert failed", ipo.id, insErr);
        continue;
      }

      updated++;
    }

    return new Response(
      JSON.stringify({
        success: true,
        updated,
        skipped,
        sources_ok: sources.map((s, i) => ({ source: labels[i], ok: s.status === "fulfilled" })),
        total_ipos_considered: ipos?.length ?? 0,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error(e);
    return new Response(
      JSON.stringify({ success: false, error: String(e) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
