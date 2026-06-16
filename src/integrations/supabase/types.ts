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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      listing_ratings: {
        Row: {
          comment: string
          created_at: string
          id: string
          listing_id: string
          rating: number
          rating_location: number | null
          rating_professionalism: number | null
          rating_punctuality: number | null
          seller_response: string | null
          seller_response_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          comment: string
          created_at?: string
          id?: string
          listing_id: string
          rating: number
          rating_location?: number | null
          rating_professionalism?: number | null
          rating_punctuality?: number | null
          seller_response?: string | null
          seller_response_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          comment?: string
          created_at?: string
          id?: string
          listing_id?: string
          rating?: number
          rating_location?: number | null
          rating_professionalism?: number | null
          rating_punctuality?: number | null
          seller_response?: string | null
          seller_response_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "listing_ratings_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "listing_ratings_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings_public"
            referencedColumns: ["id"]
          },
        ]
      }
      listings: {
        Row: {
          area: number | null
          attributes: Json
          brand: string | null
          category: string | null
          condition: string | null
          created_at: string
          currency: string
          description: string | null
          fuel_type: string | null
          id: string
          images: string[] | null
          is_published: boolean
          latitude: number | null
          location: string | null
          longitude: number | null
          model: string | null
          phone: string | null
          photos_unlocked: boolean
          price: number | null
          rating: number | null
          subcategory: string | null
          title: string
          type: string | null
          user_id: string
          year: number | null
        }
        Insert: {
          area?: number | null
          attributes?: Json
          brand?: string | null
          category?: string | null
          condition?: string | null
          created_at?: string
          currency?: string
          description?: string | null
          fuel_type?: string | null
          id?: string
          images?: string[] | null
          is_published?: boolean
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          model?: string | null
          phone?: string | null
          photos_unlocked?: boolean
          price?: number | null
          rating?: number | null
          subcategory?: string | null
          title: string
          type?: string | null
          user_id: string
          year?: number | null
        }
        Update: {
          area?: number | null
          attributes?: Json
          brand?: string | null
          category?: string | null
          condition?: string | null
          created_at?: string
          currency?: string
          description?: string | null
          fuel_type?: string | null
          id?: string
          images?: string[] | null
          is_published?: boolean
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          model?: string | null
          phone?: string | null
          photos_unlocked?: boolean
          price?: number | null
          rating?: number | null
          subcategory?: string | null
          title?: string
          type?: string | null
          user_id?: string
          year?: number | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          ad_id: string
          content: string
          created_at: string
          guest_contact: string | null
          guest_name: string | null
          id: string
          read_at: string | null
          receiver_id: string
          sender_id: string | null
        }
        Insert: {
          ad_id: string
          content: string
          created_at?: string
          guest_contact?: string | null
          guest_name?: string | null
          id?: string
          read_at?: string | null
          receiver_id: string
          sender_id?: string | null
        }
        Update: {
          ad_id?: string
          content?: string
          created_at?: string
          guest_contact?: string | null
          guest_name?: string | null
          id?: string
          read_at?: string | null
          receiver_id?: string
          sender_id?: string | null
        }
        Relationships: []
      }
      payment_orders: {
        Row: {
          amount_pyg: number
          created_at: string
          external_order_number: string
          id: string
          listing_id: string | null
          pagopar_hash: string | null
          pagopar_token: string | null
          paid_at: string | null
          payment_method: string | null
          photo_count: number
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount_pyg: number
          created_at?: string
          external_order_number: string
          id?: string
          listing_id?: string | null
          pagopar_hash?: string | null
          pagopar_token?: string | null
          paid_at?: string | null
          payment_method?: string | null
          photo_count: number
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount_pyg?: number
          created_at?: string
          external_order_number?: string
          id?: string
          listing_id?: string | null
          pagopar_hash?: string | null
          pagopar_token?: string | null
          paid_at?: string | null
          payment_method?: string | null
          photo_count?: number
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_orders_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_orders_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings_public"
            referencedColumns: ["id"]
          },
        ]
      }
      promo_code_redemptions: {
        Row: {
          code_hash: string
          id: string
          listing_id: string | null
          redeemed_at: string
          user_id: string
        }
        Insert: {
          code_hash: string
          id?: string
          listing_id?: string | null
          redeemed_at?: string
          user_id: string
        }
        Update: {
          code_hash?: string
          id?: string
          listing_id?: string | null
          redeemed_at?: string
          user_id?: string
        }
        Relationships: []
      }
      service_contacts: {
        Row: {
          buyer_id: string
          channel: string
          confirmed_at: string | null
          contacted_at: string
          created_at: string
          declined_at: string | null
          id: string
          invite_sent_at: string | null
          listing_id: string
          seller_id: string
          updated_at: string
        }
        Insert: {
          buyer_id: string
          channel: string
          confirmed_at?: string | null
          contacted_at?: string
          created_at?: string
          declined_at?: string | null
          id?: string
          invite_sent_at?: string | null
          listing_id: string
          seller_id: string
          updated_at?: string
        }
        Update: {
          buyer_id?: string
          channel?: string
          confirmed_at?: string | null
          contacted_at?: string
          created_at?: string
          declined_at?: string | null
          id?: string
          invite_sent_at?: string | null
          listing_id?: string
          seller_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_favorites: {
        Row: {
          created_at: string
          id: string
          listing_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          listing_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          listing_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_favorites_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_favorites_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings_public"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      listings_public: {
        Row: {
          area: number | null
          attributes: Json | null
          brand: string | null
          category: string | null
          condition: string | null
          created_at: string | null
          currency: string | null
          description: string | null
          fuel_type: string | null
          id: string | null
          images: string[] | null
          is_published: boolean | null
          latitude: number | null
          location: string | null
          longitude: number | null
          model: string | null
          phone: string | null
          price: number | null
          rating: number | null
          subcategory: string | null
          title: string | null
          type: string | null
          user_id: string | null
          year: number | null
        }
        Insert: {
          area?: number | null
          attributes?: Json | null
          brand?: string | null
          category?: string | null
          condition?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          fuel_type?: string | null
          id?: string | null
          images?: string[] | null
          is_published?: boolean | null
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          model?: string | null
          phone?: never
          price?: number | null
          rating?: number | null
          subcategory?: string | null
          title?: string | null
          type?: string | null
          user_id?: string | null
          year?: number | null
        }
        Update: {
          area?: number | null
          attributes?: Json | null
          brand?: string | null
          category?: string | null
          condition?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          fuel_type?: string | null
          id?: string | null
          images?: string[] | null
          is_published?: boolean | null
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          model?: string | null
          phone?: never
          price?: number | null
          rating?: number | null
          subcategory?: string | null
          title?: string | null
          type?: string | null
          user_id?: string | null
          year?: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      can_rate_service: { Args: { listing_uuid: string }; Returns: boolean }
      get_listing_average_rating: {
        Args: { listing_uuid: string }
        Returns: number
      }
      get_listing_contact_phone: {
        Args: { listing_uuid: string }
        Returns: string
      }
      get_listing_owner: { Args: { listing_uuid: string }; Returns: string }
      get_listing_ratings_with_profiles: {
        Args: { listing_uuid: string }
        Returns: {
          comment: string
          created_at: string
          id: string
          rating: number
          rating_location: number
          rating_professionalism: number
          rating_punctuality: number
          reviewer_avatar: string
          reviewer_name: string
          seller_response: string
          seller_response_at: string
          updated_at: string
          user_id: string
        }[]
      }
      get_my_listing_phone: { Args: { listing_uuid: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
