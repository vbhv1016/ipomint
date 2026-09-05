
-- 1. IPO subscriptions table
CREATE TABLE public.ipo_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ipo_id UUID NOT NULL REFERENCES public.ipos(id) ON DELETE CASCADE,
  day_number INTEGER,
  snapshot_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  retail_times NUMERIC,
  nii_times NUMERIC,
  qib_times NUMERIC,
  employee_times NUMERIC,
  total_times NUMERIC,
  retail_shares_bid BIGINT,
  total_shares_offered BIGINT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_ipo_subs_ipo_snapshot ON public.ipo_subscriptions(ipo_id, snapshot_at DESC);

GRANT SELECT ON public.ipo_subscriptions TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ipo_subscriptions TO authenticated;
GRANT ALL ON public.ipo_subscriptions TO service_role;

ALTER TABLE public.ipo_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read subscriptions"
  ON public.ipo_subscriptions FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage subscriptions"
  ON public.ipo_subscriptions FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 2. AI advice cache
CREATE TABLE public.ipo_advice (
  ipo_id UUID NOT NULL PRIMARY KEY REFERENCES public.ipos(id) ON DELETE CASCADE,
  verdict TEXT NOT NULL,
  confidence INTEGER NOT NULL,
  pros JSONB NOT NULL DEFAULT '[]'::jsonb,
  cons JSONB NOT NULL DEFAULT '[]'::jsonb,
  summary TEXT NOT NULL,
  gmp_at_generation NUMERIC,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.ipo_advice TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ipo_advice TO authenticated;
GRANT ALL ON public.ipo_advice TO service_role;

ALTER TABLE public.ipo_advice ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read advice"
  ON public.ipo_advice FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage advice"
  ON public.ipo_advice FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 3. Performance tracker columns on ipos
ALTER TABLE public.ipos
  ADD COLUMN IF NOT EXISTS listing_price NUMERIC,
  ADD COLUMN IF NOT EXISTS listing_gains_pct NUMERIC,
  ADD COLUMN IF NOT EXISTS current_price NUMERIC,
  ADD COLUMN IF NOT EXISTS current_gains_pct NUMERIC,
  ADD COLUMN IF NOT EXISTS performance_updated_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_ipos_listing_gains ON public.ipos(listing_gains_pct DESC) WHERE status = 'listed';
CREATE INDEX IF NOT EXISTS idx_ipos_listing_date ON public.ipos(listing_date DESC) WHERE status = 'listed';
