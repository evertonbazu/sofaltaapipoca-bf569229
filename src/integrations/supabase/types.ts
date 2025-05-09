export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      contact_messages: {
        Row: {
          created_at: string | null
          email: string
          id: string
          message: string
          name: string
          subject: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          message: string
          name: string
          subject: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          message?: string
          name?: string
          subject?: string
          user_id?: string | null
        }
        Relationships: []
      }
      pending_subscriptions: {
        Row: {
          access: string
          added_date: string | null
          code: string | null
          header_color: string
          icon: string | null
          id: string
          payment_method: string
          payment_proof_image: string | null
          pix_key: string | null
          pix_qr_code: string | null
          price: string
          price_color: string
          rejection_reason: string | null
          reviewed_at: string | null
          status: string
          status_approval: string | null
          submitted_at: string | null
          telegram_username: string
          title: string
          user_id: string
          whatsapp_number: string
        }
        Insert: {
          access: string
          added_date?: string | null
          code?: string | null
          header_color: string
          icon?: string | null
          id?: string
          payment_method: string
          payment_proof_image?: string | null
          pix_key?: string | null
          pix_qr_code?: string | null
          price: string
          price_color: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          status: string
          status_approval?: string | null
          submitted_at?: string | null
          telegram_username: string
          title: string
          user_id: string
          whatsapp_number: string
        }
        Update: {
          access?: string
          added_date?: string | null
          code?: string | null
          header_color?: string
          icon?: string | null
          id?: string
          payment_method?: string
          payment_proof_image?: string | null
          pix_key?: string | null
          pix_qr_code?: string | null
          price?: string
          price_color?: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          status?: string
          status_approval?: string | null
          submitted_at?: string | null
          telegram_username?: string
          title?: string
          user_id?: string
          whatsapp_number?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          role: string | null
          senha: string | null
          updated_at: string | null
          username: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id: string
          role?: string | null
          senha?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          role?: string | null
          senha?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          access: string
          added_date: string | null
          code: string
          created_at: string | null
          featured: boolean | null
          header_color: string
          icon: string | null
          id: string
          payment_method: string
          payment_proof_image: string | null
          pix_key: string | null
          pix_qr_code: string | null
          price: string
          price_color: string
          status: string
          telegram_username: string
          title: string
          updated_at: string | null
          user_id: string | null
          whatsapp_number: string
        }
        Insert: {
          access: string
          added_date?: string | null
          code: string
          created_at?: string | null
          featured?: boolean | null
          header_color: string
          icon?: string | null
          id?: string
          payment_method: string
          payment_proof_image?: string | null
          pix_key?: string | null
          pix_qr_code?: string | null
          price: string
          price_color: string
          status: string
          telegram_username: string
          title: string
          updated_at?: string | null
          user_id?: string | null
          whatsapp_number: string
        }
        Update: {
          access?: string
          added_date?: string | null
          code?: string
          created_at?: string | null
          featured?: boolean | null
          header_color?: string
          icon?: string | null
          id?: string
          payment_method?: string
          payment_proof_image?: string | null
          pix_key?: string | null
          pix_qr_code?: string | null
          price?: string
          price_color?: string
          status?: string
          telegram_username?: string
          title?: string
          updated_at?: string | null
          user_id?: string | null
          whatsapp_number?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_subscription_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
