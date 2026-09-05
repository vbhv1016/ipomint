export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      _sync_config: {
        Row: {
          id: number
          secret: string
        }
        Insert: {
          id?: number
          secret?: string
        }
        Update: {
          id?: number
          secret?: string
        }
        Relationships: []
      }
      alert_events: {
        Row: {
          alert_type: string
          created_at: string
          dedupe_key: string
          detail: Json | null
          id: string
          ipo_id: string | null
          recipient: string
          status: string
          subject: string
        }
        Insert: {
          alert_type: string
          created_at?: string
          dedupe_key: string
          detail?: Json | null
          id?: string
          ipo_id?: string | null
          recipient: string
          status?: string
          subject: string
        }
        Update: {
          alert_type?: string
          created_at?: string
          dedupe_key?: string
          detail?: Json | null
          id?: string
          ipo_id?: string | null
          recipient?: string
          status?: string
          subject?: string
        }
        Relationships: [
          {
            foreignKeyName: "alert_events_ipo_id_fkey"
            columns: ["ipo_id"]
            isOneToOne: false
            referencedRelation: "ipos"
            referencedColumns: ["id"]
          },
        ]
      }
      alert_settings: {
        Row: {
          alert_allotment: boolean
          alert_close: boolean
          alert_gmp_spike: boolean
          alert_open: boolean
          email: string
          enabled: boolean
          gmp_spike_pct: number
          id: boolean
          updated_at: string
        }
        Insert: {
          alert_allotment?: boolean
          alert_close?: boolean
          alert_gmp_spike?: boolean
          alert_open?: boolean
          email: string
          enabled?: boolean
          gmp_spike_pct?: number
          id?: boolean
          updated_at?: string
        }
        Update: {
          alert_allotment?: boolean
          alert_close?: boolean
          alert_gmp_spike?: boolean
          alert_open?: boolean
          email?: string
          enabled?: boolean
          gmp_spike_pct?: number
          id?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          author_id: string | null
          category: string
          content: string
          cover_image_url: string | null
          created_at: string
          excerpt: string | null
          id: string
          published: boolean
          published_at: string | null
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          category?: string
          content: string
          cover_image_url?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          published?: boolean
          published_at?: string | null
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          category?: string
          content?: string
          cover_image_url?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          published?: boolean
          published_at?: string | null
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      email_subscriptions: {
        Row: {
          created_at: string
          email: string
          id: string
          subscribed: boolean
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          subscribed?: boolean
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          subscribed?: boolean
        }
        Relationships: []
      }
      gmp_updates: {
        Row: {
          created_at: string
          date: string
          gmp: number
          id: string
          ipo_id: string
        }
        Insert: {
          created_at?: string
          date: string
          gmp: number
          id?: string
          ipo_id: string
        }
        Update: {
          created_at?: string
          date?: string
          gmp?: number
          id?: string
          ipo_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "gmp_updates_ipo_id_fkey"
            columns: ["ipo_id"]
            isOneToOne: false
            referencedRelation: "ipos"
            referencedColumns: ["id"]
          },
        ]
      }
      ipo_advice: {
        Row: {
          confidence: number
          cons: Json
          generated_at: string
          gmp_at_generation: number | null
          ipo_id: string
          pros: Json
          summary: string
          verdict: string
        }
        Insert: {
          confidence: number
          cons?: Json
          generated_at?: string
          gmp_at_generation?: number | null
          ipo_id: string
          pros?: Json
          summary: string
          verdict: string
        }
        Update: {
          confidence?: number
          cons?: Json
          generated_at?: string
          gmp_at_generation?: number | null
          ipo_id?: string
          pros?: Json
          summary?: string
          verdict?: string
        }
        Relationships: [
          {
            foreignKeyName: "ipo_advice_ipo_id_fkey"
            columns: ["ipo_id"]
            isOneToOne: true
            referencedRelation: "ipos"
            referencedColumns: ["id"]
          },
        ]
      }
      ipo_subscriptions: {
        Row: {
          created_at: string
          day_number: number | null
          employee_times: number | null
          id: string
          ipo_id: string
          nii_times: number | null
          qib_times: number | null
          retail_shares_bid: number | null
          retail_times: number | null
          snapshot_at: string
          total_shares_offered: number | null
          total_times: number | null
        }
        Insert: {
          created_at?: string
          day_number?: number | null
          employee_times?: number | null
          id?: string
          ipo_id: string
          nii_times?: number | null
          qib_times?: number | null
          retail_shares_bid?: number | null
          retail_times?: number | null
          snapshot_at?: string
          total_shares_offered?: number | null
          total_times?: number | null
        }
        Update: {
          created_at?: string
          day_number?: number | null
          employee_times?: number | null
          id?: string
          ipo_id?: string
          nii_times?: number | null
          qib_times?: number | null
          retail_shares_bid?: number | null
          retail_times?: number | null
          snapshot_at?: string
          total_shares_offered?: number | null
          total_times?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ipo_subscriptions_ipo_id_fkey"
            columns: ["ipo_id"]
            isOneToOne: false
            referencedRelation: "ipos"
            referencedColumns: ["id"]
          },
        ]
      }
      ipos: {
        Row: {
          close_date: string
          company_description: string | null
          created_at: string
          current_gains_pct: number | null
          current_price: number | null
          exchange: string
          gmp_is_manual: boolean
          gmp_last_synced_at: string | null
          gmp_sources: Json | null
          id: string
          ipo_objective: string | null
          is_manual: boolean
          last_synced_at: string | null
          listing_date: string | null
          listing_gain: number | null
          listing_gains_pct: number | null
          listing_price: number | null
          lot_size: number
          name: string
          open_date: string
          performance_updated_at: string | null
          price_band_high: number
          price_band_low: number
          profit: number | null
          revenue: number | null
          slug: string
          source_url: string | null
          status: string
          subscription_hni: number | null
          subscription_qib: number | null
          subscription_retail: number | null
          subscription_total: number | null
          updated_at: string
        }
        Insert: {
          close_date: string
          company_description?: string | null
          created_at?: string
          current_gains_pct?: number | null
          current_price?: number | null
          exchange?: string
          gmp_is_manual?: boolean
          gmp_last_synced_at?: string | null
          gmp_sources?: Json | null
          id?: string
          ipo_objective?: string | null
          is_manual?: boolean
          last_synced_at?: string | null
          listing_date?: string | null
          listing_gain?: number | null
          listing_gains_pct?: number | null
          listing_price?: number | null
          lot_size: number
          name: string
          open_date: string
          performance_updated_at?: string | null
          price_band_high: number
          price_band_low: number
          profit?: number | null
          revenue?: number | null
          slug: string
          source_url?: string | null
          status?: string
          subscription_hni?: number | null
          subscription_qib?: number | null
          subscription_retail?: number | null
          subscription_total?: number | null
          updated_at?: string
        }
        Update: {
          close_date?: string
          company_description?: string | null
          created_at?: string
          current_gains_pct?: number | null
          current_price?: number | null
          exchange?: string
          gmp_is_manual?: boolean
          gmp_last_synced_at?: string | null
          gmp_sources?: Json | null
          id?: string
          ipo_objective?: string | null
          is_manual?: boolean
          last_synced_at?: string | null
          listing_date?: string | null
          listing_gain?: number | null
          listing_gains_pct?: number | null
          listing_price?: number | null
          lot_size?: number
          name?: string
          open_date?: string
          performance_updated_at?: string | null
          price_band_high?: number
          price_band_low?: number
          profit?: number | null
          revenue?: number | null
          slug?: string
          source_url?: string | null
          status?: string
          subscription_hni?: number | null
          subscription_qib?: number | null
          subscription_retail?: number | null
          subscription_total?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      job_runs: {
        Row: {
          job_name: string
          last_error: string | null
          last_run_at: string | null
          lease_until: string | null
          paused_reason: string | null
          status: string
          updated_at: string
        }
        Insert: {
          job_name: string
          last_error?: string | null
          last_run_at?: string | null
          lease_until?: string | null
          paused_reason?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          job_name?: string
          last_error?: string | null
          last_run_at?: string | null
          lease_until?: string | null
          paused_reason?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      subscription_history: {
        Row: {
          created_at: string
          day_label: string
          hni: number
          id: string
          ipo_id: string
          qib: number
          retail: number
        }
        Insert: {
          created_at?: string
          day_label: string
          hni?: number
          id?: string
          ipo_id: string
          qib?: number
          retail?: number
        }
        Update: {
          created_at?: string
          day_label?: string
          hni?: number
          id?: string
          ipo_id?: string
          qib?: number
          retail?: number
        }
        Relationships: [
          {
            foreignKeyName: "subscription_history_ipo_id_fkey"
            columns: ["ipo_id"]
            isOneToOne: false
            referencedRelation: "ipos"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      auto_update_ipo_status: { Args: never; Returns: undefined }
    }
    Enums: {
      app_role: "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
