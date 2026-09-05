import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type IPORow = {
  id: string;
  name: string;
  slug: string;
  exchange: string;
  price_band_low: number;
  price_band_high: number;
  lot_size: number;
  open_date: string;
  close_date: string;
  listing_date: string | null;
  status: string;
  subscription_retail: number | null;
  subscription_hni: number | null;
  subscription_qib: number | null;
  subscription_total: number | null;
  listing_price: number | null;
  listing_gain: number | null;
  company_description: string | null;
  revenue: number | null;
  profit: number | null;
  ipo_objective: string | null;
};

export type GMPUpdate = {
  id: string;
  ipo_id: string;
  date: string;
  gmp: number;
};

export type SubscriptionHistoryRow = {
  id: string;
  ipo_id: string;
  day_label: string;
  retail: number;
  hni: number;
  qib: number;
};

export function useIPOs() {
  return useQuery({
    queryKey: ['ipos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ipos')
        .select('*')
        .order('open_date', { ascending: false });
      if (error) throw error;
      return (data ?? []) as IPORow[];
    },
    staleTime: 60_000,
  });
}

export function useIPOBySlug(slug: string) {
  return useQuery({
    queryKey: ['ipo', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ipos')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();
      if (error) throw error;
      return data as IPORow | null;
    },
    enabled: !!slug,
  });
}

export function useGMPHistory(ipoId: string | undefined) {
  return useQuery({
    queryKey: ['gmp', ipoId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gmp_updates')
        .select('*')
        .eq('ipo_id', ipoId!)
        .order('date', { ascending: true });
      if (error) throw error;
      return (data ?? []) as GMPUpdate[];
    },
    enabled: !!ipoId,
  });
}

export function useLatestGMP(ipoIds: string[]) {
  return useQuery({
    queryKey: ['gmp-latest', ipoIds],
    queryFn: async () => {
      if (ipoIds.length === 0) return {};
      const { data, error } = await supabase
        .from('gmp_updates')
        .select('*')
        .in('ipo_id', ipoIds)
        .order('date', { ascending: false });
      if (error) throw error;
      // Group by ipo_id, take latest per IPO
      const map: Record<string, number> = {};
      for (const row of data ?? []) {
        if (!map[row.ipo_id]) map[row.ipo_id] = Number(row.gmp);
      }
      return map;
    },
    enabled: ipoIds.length > 0,
    staleTime: 20_000,
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
    refetchIntervalInBackground: false,
  });
}



export function useSubscriptionHistory(ipoId: string | undefined) {
  return useQuery({
    queryKey: ['sub-history', ipoId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subscription_history')
        .select('*')
        .eq('ipo_id', ipoId!)
        .order('day_label', { ascending: true });
      if (error) throw error;
      return (data ?? []) as SubscriptionHistoryRow[];
    },
    enabled: !!ipoId,
  });
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
}

export function formatCrore(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')} Cr`;
}
