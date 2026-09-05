ALTER TABLE public.ipos
  ADD COLUMN IF NOT EXISTS gmp_is_manual boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS gmp_last_synced_at timestamptz,
  ADD COLUMN IF NOT EXISTS gmp_sources jsonb;