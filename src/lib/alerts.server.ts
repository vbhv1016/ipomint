import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export function serviceClient(): SupabaseClient {
  const url = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

/** Acquire a single-flight lease for a background job. Returns false if another run holds it or the job is paused. */
export async function acquireJobLease(sb: SupabaseClient, jobName: string, leaseMinutes = 10) {
  const { data: existing } = await sb.from("job_runs").select("*").eq("job_name", jobName).maybeSingle();
  const now = new Date();
  if (existing?.status === "paused") return { ok: false as const, reason: existing.paused_reason ?? "paused" };
  if (existing?.lease_until && new Date(existing.lease_until) > now) return { ok: false as const, reason: "locked" };
  const leaseUntil = new Date(now.getTime() + leaseMinutes * 60_000).toISOString();
  const { error } = await sb.from("job_runs").upsert(
    { job_name: jobName, status: "running", lease_until: leaseUntil, last_run_at: now.toISOString(), updated_at: now.toISOString() },
    { onConflict: "job_name" },
  );
  if (error) return { ok: false as const, reason: error.message };
  return { ok: true as const };
}

export async function releaseJob(sb: SupabaseClient, jobName: string, patch: Record<string, unknown> = {}) {
  await sb.from("job_runs").update({ status: "idle", lease_until: null, updated_at: new Date().toISOString(), ...patch }).eq("job_name", jobName);
}

export async function pauseJob(sb: SupabaseClient, jobName: string, reason: string) {
  await sb.from("job_runs").update({ status: "paused", paused_reason: reason, lease_until: null, updated_at: new Date().toISOString() }).eq("job_name", jobName);
}

/**
 * Verify that a background-job request carries the shared scheduler secret.
 * Accepts `x-sync-secret: <secret>` or `authorization: Bearer <secret>`.
 * The secret is stored server-side in public._sync_config (same one the sync jobs use).
 */
export async function verifyJobSecret(sb: SupabaseClient, request: Request) {
  const header =
    request.headers.get("x-sync-secret") ??
    (request.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  const envSecret = process.env['SYNC_SHARED_SECRET'] ?? "";
  const { data: cfg } = await sb.from("_sync_config").select("secret").eq("id", 1).maybeSingle();
  const expected = [cfg?.secret ?? "", envSecret].filter(Boolean);
  if (!expected.length) return false;
  const provided = header.trim();
  if (!provided) return false;
  return expected.some((s) => s.length === provided.length && timingSafeEqualStr(s, provided));
}

function timingSafeEqualStr(a: string, b: string) {
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
