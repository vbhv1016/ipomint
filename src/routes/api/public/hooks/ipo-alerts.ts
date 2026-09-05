import { createFileRoute } from "@tanstack/react-router";
import { serviceClient, acquireJobLease, releaseJob, verifyJobSecret } from "@/lib/alerts.server";
import { sendTemplateEmail } from "@/lib/email-templates/send-email";

const JOB = "ipo-alerts";
const MAX_ALERTS_PER_RUN = 25;

const dayIso = (d: Date) => d.toISOString().slice(0, 10);
const addDays = (day: string, n: number) => {
  const x = new Date(day + "T00:00:00Z");
  x.setUTCDate(x.getUTCDate() + n);
  return dayIso(x);
};
const inr = (n: number) => `₹${new Intl.NumberFormat("en-IN").format(n)}`;

type Pending = {
  ipo: any;
  type: string;
  dedupe: string;
  subject: string;
  message: string;
  details: string;
  link: string;
};

export const Route = createFileRoute("/api/public/hooks/ipo-alerts")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const sb = serviceClient();
        if (!(await verifyJobSecret(sb, request))) {
          return new Response("Unauthorized", { status: 401 });
        }
        const lease = await acquireJobLease(sb, JOB, 5);
        if (!lease.ok) return Response.json({ skipped: lease.reason }, { status: 200 });

        try {
          const { data: settings } = await sb.from("alert_settings").select("*").eq("id", true).maybeSingle();
          if (!settings || !settings.enabled) {
            await releaseJob(sb, JOB);
            return Response.json({ skipped: "alerts_disabled" });
          }

          const today = dayIso(new Date());
          const { data: ipos = [] } = await sb
            .from("ipos")
            .select("id,name,slug,exchange,open_date,close_date,listing_date,price_band_low,price_band_high,lot_size,status")
            .gte("close_date", addDays(today, -10));

          const pending: Pending[] = [];

          for (const ipo of ipos ?? []) {
            const open = ipo.open_date?.slice(0, 10);
            const close = ipo.close_date?.slice(0, 10);
            const listing = ipo.listing_date?.slice(0, 10);
            const allotment = close ? addDays(close, 2) : null;
            const band = `${inr(ipo.price_band_low)}–${inr(ipo.price_band_high)}`;
            const link = `https://ipomint.in/ipo/${ipo.slug}`;
            const details = `Price band ${band} · Lot ${ipo.lot_size} · ${ipo.exchange}`;
            const base = { ipo, details, link };

            if (settings.alert_open && open === today)
              pending.push({ ...base, type: "open", dedupe: `open:${ipo.id}:${today}`, subject: `${ipo.name} IPO opens today`, message: "The subscription window is open today. Check the live grey market premium before you apply." });
            if (settings.alert_close && close === today)
              pending.push({ ...base, type: "close", dedupe: `close:${ipo.id}:${today}`, subject: `Last day to apply: ${ipo.name} IPO closes today`, message: "This is the final day to place your bid before the issue closes." });
            if (settings.alert_allotment && allotment === today)
              pending.push({ ...base, type: "allotment", dedupe: `allotment:${ipo.id}:${today}`, subject: `${ipo.name} IPO allotment expected today`, message: "Allotment is expected today. Check your application status with the registrar." });
            if (settings.alert_allotment && listing === today)
              pending.push({ ...base, type: "listing", dedupe: `listing:${ipo.id}:${today}`, subject: `${ipo.name} lists today`, message: "The shares list today. Track the listing price against the grey market premium." });

            // GMP spike: compare the two most recent GMP readings.
            if (settings.alert_gmp_spike && close && close >= today) {
              const { data: gmps } = await sb
                .from("gmp_updates")
                .select("gmp,date")
                .eq("ipo_id", ipo.id)
                .order("date", { ascending: false })
                .limit(2);
              if (gmps && gmps.length === 2) {
                const [now, prev] = gmps.map((g: any) => Number(g.gmp));
                const denom = Math.max(Math.abs(prev), 1);
                const changePct = ((now - prev) / denom) * 100;
                if (Math.abs(changePct) >= settings.gmp_spike_pct) {
                  pending.push({
                    ...base,
                    type: "gmp_spike",
                    dedupe: `gmp:${ipo.id}:${today}:${Math.round(changePct)}`,
                    subject: `GMP ${changePct > 0 ? "spike" : "drop"} on ${ipo.name}: ${inr(prev)} → ${inr(now)}`,
                    message: `Grey market premium moved ${changePct.toFixed(1)}% (${inr(prev)} → ${inr(now)}).`,
                  });
                }
              }
            }
          }

          let queued = 0;
          for (const p of pending.slice(0, MAX_ALERTS_PER_RUN)) {
            // Idempotent claim — a duplicate dedupe_key means this alert already went out.
            const { data: claimed, error: claimErr } = await sb
              .from("alert_events")
              .insert({
                ipo_id: p.ipo.id,
                alert_type: p.type,
                dedupe_key: p.dedupe,
                recipient: settings.email,
                subject: p.subject,
                status: "pending",
                detail: { slug: p.ipo.slug },
              })
              .select("id")
              .maybeSingle();
            if (claimErr || !claimed) continue;

            try {
              const res = await sendTemplateEmail("ipo-alert", settings.email, {
                idempotencyKey: `ipo-alert-${p.dedupe}`,
                templateData: {
                  headline: p.subject,
                  message: p.message,
                  ipoName: p.ipo.name,
                  details: p.details,
                  ctaUrl: p.link,
                  ctaLabel: "View live GMP and details",
                },
              });
              await sb
                .from("alert_events")
                .update({
                  status: res.sent ? "sent" : "suppressed",
                  detail: { slug: p.ipo.slug, ...(res.sent ? {} : { reason: res.reason }) },
                })
                .eq("id", claimed.id);
              if (res.sent) queued++;
            } catch (err) {
              // Release the claim so the alert retries on a later run.
              await sb.from("alert_events").delete().eq("id", claimed.id);
              console.error("ipo-alert send failed", err instanceof Error ? err.message : String(err));
            }
          }

          await releaseJob(sb, JOB, { last_error: null });
          return Response.json({ ok: true, candidates: pending.length, sent: queued });
        } catch (e) {
          await releaseJob(sb, JOB, { last_error: e instanceof Error ? e.message : String(e) });
          return Response.json({ error: "alert_run_failed" }, { status: 500 });
        }
      },
    },
  },
});
