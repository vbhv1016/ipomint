CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM anon, authenticated;

CREATE OR REPLACE FUNCTION private.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;
REVOKE ALL ON FUNCTION private.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;

DROP POLICY IF EXISTS "Admins can manage subscriptions" ON public.ipo_subscriptions;
CREATE POLICY "Admins can manage subscriptions" ON public.ipo_subscriptions FOR ALL TO authenticated USING (private.has_role(auth.uid(),'admin')) WITH CHECK (private.has_role(auth.uid(),'admin'));

DROP POLICY IF EXISTS "Admins can manage advice" ON public.ipo_advice;
CREATE POLICY "Admins can manage advice" ON public.ipo_advice FOR ALL TO authenticated USING (private.has_role(auth.uid(),'admin')) WITH CHECK (private.has_role(auth.uid(),'admin'));

DROP POLICY IF EXISTS "Admins can delete subscription history" ON public.subscription_history;
CREATE POLICY "Admins can delete subscription history" ON public.subscription_history FOR DELETE TO authenticated USING (private.has_role(auth.uid(),'admin'));
DROP POLICY IF EXISTS "Admins can insert subscription history" ON public.subscription_history;
CREATE POLICY "Admins can insert subscription history" ON public.subscription_history FOR INSERT TO authenticated WITH CHECK (private.has_role(auth.uid(),'admin'));
DROP POLICY IF EXISTS "Admins can update subscription history" ON public.subscription_history;
CREATE POLICY "Admins can update subscription history" ON public.subscription_history FOR UPDATE TO authenticated USING (private.has_role(auth.uid(),'admin'));

DROP POLICY IF EXISTS "Admins can read all posts" ON public.blog_posts;
CREATE POLICY "Admins can read all posts" ON public.blog_posts FOR SELECT TO authenticated USING (private.has_role(auth.uid(),'admin'));
DROP POLICY IF EXISTS "Admins can insert posts" ON public.blog_posts;
CREATE POLICY "Admins can insert posts" ON public.blog_posts FOR INSERT TO authenticated WITH CHECK (private.has_role(auth.uid(),'admin'));
DROP POLICY IF EXISTS "Admins can update posts" ON public.blog_posts;
CREATE POLICY "Admins can update posts" ON public.blog_posts FOR UPDATE TO authenticated USING (private.has_role(auth.uid(),'admin'));
DROP POLICY IF EXISTS "Admins can delete posts" ON public.blog_posts;
CREATE POLICY "Admins can delete posts" ON public.blog_posts FOR DELETE TO authenticated USING (private.has_role(auth.uid(),'admin'));

DROP POLICY IF EXISTS "Admins can view subscriptions" ON public.email_subscriptions;
CREATE POLICY "Admins can view subscriptions" ON public.email_subscriptions FOR SELECT TO authenticated USING (private.has_role(auth.uid(),'admin'));

DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;
CREATE POLICY "Admins can manage all roles" ON public.user_roles FOR ALL TO authenticated USING (private.has_role(auth.uid(),'admin')) WITH CHECK (private.has_role(auth.uid(),'admin'));

DROP POLICY IF EXISTS "Admins manage alert settings" ON public.alert_settings;
CREATE POLICY "Admins manage alert settings" ON public.alert_settings FOR ALL TO authenticated USING (private.has_role(auth.uid(),'admin')) WITH CHECK (private.has_role(auth.uid(),'admin'));

DROP POLICY IF EXISTS "Admins read alert events" ON public.alert_events;
CREATE POLICY "Admins read alert events" ON public.alert_events FOR SELECT TO authenticated USING (private.has_role(auth.uid(),'admin'));

DROP POLICY IF EXISTS "Admins read job runs" ON public.job_runs;
CREATE POLICY "Admins read job runs" ON public.job_runs FOR SELECT TO authenticated USING (private.has_role(auth.uid(),'admin'));

DROP POLICY IF EXISTS "Admins can insert IPOs" ON public.ipos;
CREATE POLICY "Admins can insert IPOs" ON public.ipos FOR INSERT TO authenticated WITH CHECK (private.has_role(auth.uid(),'admin'));
DROP POLICY IF EXISTS "Admins can update IPOs" ON public.ipos;
CREATE POLICY "Admins can update IPOs" ON public.ipos FOR UPDATE TO authenticated USING (private.has_role(auth.uid(),'admin'));
DROP POLICY IF EXISTS "Admins can delete IPOs" ON public.ipos;
CREATE POLICY "Admins can delete IPOs" ON public.ipos FOR DELETE TO authenticated USING (private.has_role(auth.uid(),'admin'));

DROP POLICY IF EXISTS "Admins can insert GMP updates" ON public.gmp_updates;
CREATE POLICY "Admins can insert GMP updates" ON public.gmp_updates FOR INSERT TO authenticated WITH CHECK (private.has_role(auth.uid(),'admin'));
DROP POLICY IF EXISTS "Admins can update GMP updates" ON public.gmp_updates;
CREATE POLICY "Admins can update GMP updates" ON public.gmp_updates FOR UPDATE TO authenticated USING (private.has_role(auth.uid(),'admin'));
DROP POLICY IF EXISTS "Admins can delete GMP updates" ON public.gmp_updates;
CREATE POLICY "Admins can delete GMP updates" ON public.gmp_updates FOR DELETE TO authenticated USING (private.has_role(auth.uid(),'admin'));

DROP FUNCTION IF EXISTS public.has_role(uuid, public.app_role);