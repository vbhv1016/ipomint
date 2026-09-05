
-- Drop all restrictive policies and recreate as permissive

-- ipos
DROP POLICY IF EXISTS "Admins can manage IPOs" ON public.ipos;
DROP POLICY IF EXISTS "IPOs are publicly readable" ON public.ipos;
CREATE POLICY "IPOs are publicly readable" ON public.ipos FOR SELECT USING (true);
CREATE POLICY "Admins can manage IPOs" ON public.ipos FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- gmp_updates
DROP POLICY IF EXISTS "Admins can manage GMP updates" ON public.gmp_updates;
DROP POLICY IF EXISTS "GMP updates are publicly readable" ON public.gmp_updates;
CREATE POLICY "GMP updates are publicly readable" ON public.gmp_updates FOR SELECT USING (true);
CREATE POLICY "Admins can manage GMP updates" ON public.gmp_updates FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- subscription_history
DROP POLICY IF EXISTS "Admins can manage subscription history" ON public.subscription_history;
DROP POLICY IF EXISTS "Subscription history is publicly readable" ON public.subscription_history;
CREATE POLICY "Subscription history is publicly readable" ON public.subscription_history FOR SELECT USING (true);
CREATE POLICY "Admins can manage subscription history" ON public.subscription_history FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- blog_posts
DROP POLICY IF EXISTS "Admins can manage all posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Published posts are publicly readable" ON public.blog_posts;
CREATE POLICY "Published posts are publicly readable" ON public.blog_posts FOR SELECT USING (published = true);
CREATE POLICY "Admins can manage all posts" ON public.blog_posts FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- email_subscriptions
DROP POLICY IF EXISTS "Admins can view subscriptions" ON public.email_subscriptions;
DROP POLICY IF EXISTS "Anyone can subscribe with valid email" ON public.email_subscriptions;
CREATE POLICY "Admins can view subscriptions" ON public.email_subscriptions FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Anyone can subscribe with valid email" ON public.email_subscriptions FOR INSERT WITH CHECK (email IS NOT NULL AND length(TRIM(BOTH FROM email)) > 5);

-- user_roles
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- profiles
DROP POLICY IF EXISTS "Profiles viewable by owner" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Profiles viewable by owner" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
