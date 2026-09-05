
-- Create app_role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- User roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'user',
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS for user_roles
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles viewable by owner" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, display_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)));
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- IPOs table
CREATE TABLE public.ipos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  exchange TEXT NOT NULL DEFAULT 'NSE & BSE',
  price_band_low NUMERIC NOT NULL,
  price_band_high NUMERIC NOT NULL,
  lot_size INTEGER NOT NULL,
  open_date DATE NOT NULL,
  close_date DATE NOT NULL,
  listing_date DATE,
  status TEXT NOT NULL DEFAULT 'upcoming',
  subscription_retail NUMERIC,
  subscription_hni NUMERIC,
  subscription_qib NUMERIC,
  subscription_total NUMERIC,
  listing_price NUMERIC,
  listing_gain NUMERIC,
  company_description TEXT,
  revenue NUMERIC,
  profit NUMERIC,
  ipo_objective TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.ipos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "IPOs are publicly readable" ON public.ipos FOR SELECT USING (true);
CREATE POLICY "Admins can manage IPOs" ON public.ipos FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER update_ipos_updated_at BEFORE UPDATE ON public.ipos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- GMP updates table
CREATE TABLE public.gmp_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ipo_id UUID NOT NULL REFERENCES public.ipos(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  gmp NUMERIC NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.gmp_updates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "GMP updates are publicly readable" ON public.gmp_updates FOR SELECT USING (true);
CREATE POLICY "Admins can manage GMP updates" ON public.gmp_updates FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE INDEX idx_gmp_updates_ipo_date ON public.gmp_updates(ipo_id, date);

-- Subscription history table
CREATE TABLE public.subscription_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ipo_id UUID NOT NULL REFERENCES public.ipos(id) ON DELETE CASCADE,
  day_label TEXT NOT NULL,
  retail NUMERIC NOT NULL DEFAULT 0,
  hni NUMERIC NOT NULL DEFAULT 0,
  qib NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.subscription_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Subscription history is publicly readable" ON public.subscription_history FOR SELECT USING (true);
CREATE POLICY "Admins can manage subscription history" ON public.subscription_history FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Blog posts table
CREATE TABLE public.blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  cover_image_url TEXT,
  author_id UUID REFERENCES auth.users(id),
  category TEXT NOT NULL DEFAULT 'ipo-review',
  published BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published posts are publicly readable" ON public.blog_posts FOR SELECT USING (published = true);
CREATE POLICY "Admins can manage all posts" ON public.blog_posts FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON public.blog_posts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Email subscriptions table
CREATE TABLE public.email_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  subscribed BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.email_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can subscribe" ON public.email_subscriptions FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view subscriptions" ON public.email_subscriptions FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
