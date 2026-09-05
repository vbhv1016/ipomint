
CREATE OR REPLACE FUNCTION public.auto_update_ipo_status()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  today date := (now() AT TIME ZONE 'Asia/Kolkata')::date;
BEGIN
  -- IPOs whose open_date is in the future → 'upcoming'
  UPDATE public.ipos
  SET status = 'upcoming', updated_at = now()
  WHERE open_date > today AND status != 'upcoming';

  -- IPOs whose open_date <= today AND close_date >= today → 'open'
  UPDATE public.ipos
  SET status = 'open', updated_at = now()
  WHERE open_date <= today AND close_date >= today AND status != 'open';

  -- IPOs whose close_date < today AND (no listing_date OR listing_date > today) → 'closed'
  UPDATE public.ipos
  SET status = 'closed', updated_at = now()
  WHERE close_date < today
    AND (listing_date IS NULL OR listing_date > today)
    AND status NOT IN ('closed', 'listed');

  -- IPOs with listing_date <= today → 'listed'
  UPDATE public.ipos
  SET status = 'listed', updated_at = now()
  WHERE listing_date IS NOT NULL
    AND listing_date <= today
    AND status != 'listed';
END;
$$;
