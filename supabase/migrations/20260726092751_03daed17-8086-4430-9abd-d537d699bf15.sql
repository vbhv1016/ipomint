
-- Shared secret for authenticating scheduled sync jobs to edge functions
CREATE TABLE IF NOT EXISTS public._sync_config (
  id int PRIMARY KEY DEFAULT 1,
  secret text NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  CHECK (id = 1)
);
INSERT INTO public._sync_config (id) VALUES (1) ON CONFLICT DO NOTHING;
ALTER TABLE public._sync_config ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public._sync_config FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public._sync_config TO service_role;

-- Lock down SECURITY DEFINER functions: revoke from PUBLIC/anon/authenticated,
-- re-grant only where required (has_role is called by RLS policies as the
-- caller role, so authenticated must retain EXECUTE).
REVOKE ALL ON FUNCTION public.auto_update_ipo_status() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;

-- Reschedule cron jobs to send the shared secret in the Authorization header
-- so the edge functions can reject unauthenticated internet callers.
SELECT cron.unschedule('sync-ipos-every-15-min');
SELECT cron.unschedule('sync-gmp-every-15-min');

SELECT cron.schedule(
  'sync-ipos-every-15-min',
  '*/15 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://afooethkayssfpjqzjvv.supabase.co/functions/v1/sync-ipos',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'X-Sync-Secret', (SELECT secret FROM public._sync_config WHERE id = 1)
    ),
    body := '{"trigger":"cron"}'::jsonb
  );
  $$
);

SELECT cron.schedule(
  'sync-gmp-every-15-min',
  '*/15 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://afooethkayssfpjqzjvv.supabase.co/functions/v1/sync-gmp',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'X-Sync-Secret', (SELECT secret FROM public._sync_config WHERE id = 1)
    ),
    body := '{"trigger":"cron"}'::jsonb
  );
  $$
);
