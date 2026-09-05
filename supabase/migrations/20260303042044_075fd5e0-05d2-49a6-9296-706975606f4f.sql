
-- Fix blog_posts: make SELECT policies PERMISSIVE so either public OR admin can read
DROP POLICY IF EXISTS "Published posts are publicly readable" ON public.blog_posts;
DROP POLICY IF EXISTS "Admins can read all posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Admins can insert posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Admins can update posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Admins can delete posts" ON public.blog_posts;

CREATE POLICY "Published posts are publicly readable" ON public.blog_posts FOR SELECT USING (published = true);
CREATE POLICY "Admins can read all posts" ON public.blog_posts FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert posts" ON public.blog_posts FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update posts" ON public.blog_posts FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete posts" ON public.blog_posts FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Fix ipos: make policies PERMISSIVE
DROP POLICY IF EXISTS "IPOs are publicly readable" ON public.ipos;
DROP POLICY IF EXISTS "Admins can manage IPOs" ON public.ipos;

CREATE POLICY "IPOs are publicly readable" ON public.ipos FOR SELECT USING (true);
CREATE POLICY "Admins can insert IPOs" ON public.ipos FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update IPOs" ON public.ipos FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete IPOs" ON public.ipos FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Fix gmp_updates: make policies PERMISSIVE
DROP POLICY IF EXISTS "GMP updates are publicly readable" ON public.gmp_updates;
DROP POLICY IF EXISTS "Admins can manage GMP updates" ON public.gmp_updates;

CREATE POLICY "GMP updates are publicly readable" ON public.gmp_updates FOR SELECT USING (true);
CREATE POLICY "Admins can insert GMP updates" ON public.gmp_updates FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update GMP updates" ON public.gmp_updates FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete GMP updates" ON public.gmp_updates FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Fix subscription_history
DROP POLICY IF EXISTS "Subscription history is publicly readable" ON public.subscription_history;
DROP POLICY IF EXISTS "Admins can manage subscription history" ON public.subscription_history;

CREATE POLICY "Subscription history is publicly readable" ON public.subscription_history FOR SELECT USING (true);
CREATE POLICY "Admins can insert subscription history" ON public.subscription_history FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update subscription history" ON public.subscription_history FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete subscription history" ON public.subscription_history FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Fix email_subscriptions
DROP POLICY IF EXISTS "Admins can view subscriptions" ON public.email_subscriptions;
DROP POLICY IF EXISTS "Anyone can subscribe" ON public.email_subscriptions;

CREATE POLICY "Admins can view subscriptions" ON public.email_subscriptions FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Anyone can subscribe" ON public.email_subscriptions FOR INSERT WITH CHECK (email IS NOT NULL AND length(TRIM(BOTH FROM email)) > 5);

-- Fix user_roles
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;

CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Fix profiles
DROP POLICY IF EXISTS "Profiles viewable by owner" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Profiles viewable by owner" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);
