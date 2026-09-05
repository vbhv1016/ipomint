ALTER TABLE public.ipos
  ADD COLUMN IF NOT EXISTS is_manual boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS last_synced_at timestamptz,
  ADD COLUMN IF NOT EXISTS source_url text;

CREATE INDEX IF NOT EXISTS idx_ipos_is_manual ON public.ipos(is_manual);
CREATE INDEX IF NOT EXISTS idx_ipos_slug ON public.ipos(slug);