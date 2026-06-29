/* eslint-disable @typescript-eslint/no-empty-object-type */
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
      activity_log: {
        Row: {
          created_at: string | null
          id: string
          level: string
          message: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          level?: string
          message: string
        }
        Update: {
          created_at?: string | null
          id?: string
          level?: string
          message?: string
        }
        Relationships: []
      }
      cj_credentials: {
        Row: {
          access_token: string | null
          api_key: string
          expires_at: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          access_token?: string | null
          api_key: string
          expires_at?: string | null
          id?: string
          updated_at?: string | null
        }
        Update: {
          access_token?: string | null
          api_key?: string
          expires_at?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      ebay_tokens: {
        Row: {
          access_token: string
          expires_at: string
          id: string
          refresh_token: string
          updated_at: string | null
        }
        Insert: {
          access_token: string
          expires_at: string
          id?: string
          refresh_token: string
          updated_at?: string | null
        }
        Update: {
          access_token?: string
          expires_at?: string
          id?: string
          refresh_token?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      listings: {
        Row: {
          cj_product_id: string
          created_at: string | null
          current_price: number
          current_quantity: number
          ebay_offer_id: string
          ebay_sku: string
          id: string
          last_synced_at: string | null
          title: string
        }
        Insert: {
          cj_product_id: string
          created_at?: string | null
          current_price: number
          current_quantity?: number
          ebay_offer_id: string
          ebay_sku: string
          id?: string
          last_synced_at?: string | null
          title: string
        }
        Update: {
          cj_product_id?: string
          created_at?: string | null
          current_price?: number
          current_quantity?: number
          ebay_offer_id?: string
          ebay_sku?: string
          id?: string
          last_synced_at?: string | null
          title?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          carrier_code: string | null
          cj_order_id: string | null
          created_at: string | null
          ebay_order_id: string
          id: string
          status: string
          tracking_number: string | null
        }
        Insert: {
          carrier_code?: string | null
          cj_order_id?: string | null
          created_at?: string | null
          ebay_order_id: string
          id?: string
          status?: string
          tracking_number?: string | null
        }
        Update: {
          carrier_code?: string | null
          cj_order_id?: string | null
          created_at?: string | null
          ebay_order_id?: string
          id?: string
          status?: string
          tracking_number?: string | null
        }
        Relationships: []
      }
      product_queue: {
        Row: {
          category: string | null
          cj_product_id: string
          created_at: string | null
          id: string
          image_url: string | null
          status: string
          suggested_ebay_price: number
          supplier_price: number
          title: string
        }
        Insert: {
          category?: string | null
          cj_product_id: string
          created_at?: string | null
          id?: string
          image_url?: string | null
          status?: string
          suggested_ebay_price: number
          supplier_price: number
          title: string
        }
        Update: {
          category?: string | null
          cj_product_id?: string
          created_at?: string | null
          id?: string
          image_url?: string | null
          status?: string
          suggested_ebay_price?: number
          supplier_price?: number
          title?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      settings: {
        Row: {
          brand_keyword_blacklist: string[] | null
          category_blacklist: string[] | null
          default_margin_percent: number | null
          id: string
          sync_interval_minutes: number | null
          updated_at: string | null
        }
        Insert: {
          brand_keyword_blacklist?: string[] | null
          category_blacklist?: string[] | null
          default_margin_percent?: number | null
          id?: string
          sync_interval_minutes?: number | null
          updated_at?: string | null
        }
        Update: {
          brand_keyword_blacklist?: string[] | null
          category_blacklist?: string[] | null
          default_margin_percent?: number | null
          id?: string
          sync_interval_minutes?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
