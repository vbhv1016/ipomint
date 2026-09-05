CREATE TABLE public.alert_settings (
  id boolean PRIMARY KEY DEFAULT true CHECK (id),
  email text NOT NULL,
  enabled boolean NOT NULL DEFAULT true,
  gmp_spike_pct integer NOT NULL DEFAULT 15,
  alert_open boolean NOT NULL DEFAULT true,
  alert_close boolean NOT NULL DEFAULT true,
  alert_gmp_spike boolean NOT NULL DEFAULT true,
  alert_allotment boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.alert_settings TO authenticated;
GRANT ALL ON public.alert_settings TO service_role;
ALTER TABLE public.alert_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage alert settings" ON public.alert_settings FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.alert_settings (id, email) VALUES (true, 'vaibhavtomar.tomar1@gmail.com');

CREATE TABLE public.alert_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ipo_id uuid REFERENCES public.ipos(id) ON DELETE CASCADE,
  alert_type text NOT NULL,
  dedupe_key text NOT NULL UNIQUE,
  recipient text NOT NULL,
  subject text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  detail jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.alert_events TO authenticated;
GRANT ALL ON public.alert_events TO service_role;
ALTER TABLE public.alert_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read alert events" ON public.alert_events FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.job_runs (
  job_name text PRIMARY KEY,
  status text NOT NULL DEFAULT 'idle',
  paused_reason text,
  lease_until timestamptz,
  last_run_at timestamptz,
  last_error text,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.job_runs TO authenticated;
GRANT ALL ON public.job_runs TO service_role;
ALTER TABLE public.job_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read job runs" ON public.job_runs FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));