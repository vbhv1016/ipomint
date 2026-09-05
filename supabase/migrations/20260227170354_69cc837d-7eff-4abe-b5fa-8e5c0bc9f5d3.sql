
-- Tighten the email subscriptions INSERT policy to require non-empty email
DROP POLICY "Anyone can subscribe" ON public.email_subscriptions;
CREATE POLICY "Anyone can subscribe with valid email" ON public.email_subscriptions FOR INSERT WITH CHECK (email IS NOT NULL AND length(trim(email)) > 5);
