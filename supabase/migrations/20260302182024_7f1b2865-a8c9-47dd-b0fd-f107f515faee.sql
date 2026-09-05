-- Fix blog_posts policies to be PERMISSIVE
DROP POLICY IF EXISTS "Published posts are publicly readable" ON public.blog_posts;
DROP POLICY IF EXISTS "Admins can manage all posts" ON public.blog_posts;
CREATE POLICY "Published posts are publicly readable" ON public.blog_posts AS PERMISSIVE FOR SELECT USING (published = true);
CREATE POLICY "Admins can read all posts" ON public.blog_posts AS PERMISSIVE FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can insert posts" ON public.blog_posts AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update posts" ON public.blog_posts AS PERMISSIVE FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete posts" ON public.blog_posts AS PERMISSIVE FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- Fix email_subscriptions policies
DROP POLICY IF EXISTS "Admins can view subscriptions" ON public.email_subscriptions;
DROP POLICY IF EXISTS "Anyone can subscribe with valid email" ON public.email_subscriptions;
CREATE POLICY "Admins can view subscriptions" ON public.email_subscriptions AS PERMISSIVE FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Anyone can subscribe" ON public.email_subscriptions AS PERMISSIVE FOR INSERT WITH CHECK (email IS NOT NULL AND length(TRIM(BOTH FROM email)) > 5);