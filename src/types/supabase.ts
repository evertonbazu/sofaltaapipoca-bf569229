
// Custom Supabase types to use until types.ts auto-updates
export type Tables = {
  subscriptions: {
    Row: {
      id: string;
      title: string;
      price: string;
      payment_method: string;
      status: string;
      access: string;
      header_color: string;
      price_color: string;
      whatsapp_number: string;
      telegram_username: string;
      featured: boolean | null;
      icon: string | null;
      pix_qr_code: string | null;
      pix_key: string | null;
      payment_proof_image: string | null;
      user_id: string | null;
      added_date: string | null;
      updated_at: string | null;
      created_at: string | null;
      code: string;
    };
    Insert: {
      id?: string;
      title: string;
      price: string;
      payment_method: string;
      status: string;
      access: string;
      header_color: string;
      price_color: string;
      whatsapp_number: string;
      telegram_username: string;
      featured?: boolean | null;
      icon?: string | null;
      pix_qr_code?: string | null;
      pix_key?: string | null;
      payment_proof_image?: string | null;
      user_id?: string | null;
      added_date?: string | null;
      updated_at?: string | null;
      created_at?: string | null;
      code: string;
    };
    Update: {
      id?: string;
      title?: string;
      price?: string;
      payment_method?: string;
      status?: string;
      access?: string;
      header_color?: string;
      price_color?: string;
      whatsapp_number?: string;
      telegram_username?: string;
      featured?: boolean | null;
      icon?: string | null;
      pix_qr_code?: string | null;
      pix_key?: string | null;
      payment_proof_image?: string | null;
      user_id?: string | null;
      added_date?: string | null;
      updated_at?: string | null;
      created_at?: string | null;
      code?: string;
    };
  };
  pending_subscriptions: {
    Row: {
      id: string;
      title: string;
      price: string;
      payment_method: string;
      status: string;
      access: string;
      header_color: string;
      price_color: string;
      whatsapp_number: string;
      telegram_username: string;
      icon: string | null;
      pix_qr_code: string | null;
      pix_key: string | null;
      payment_proof_image: string | null;
      user_id: string | null;
      submitted_at: string | null;
      status_approval: string | null;
      reviewed_at: string | null;
      rejection_reason: string | null;
      added_date: string | null;
      code: string;
    };
    Insert: {
      id?: string;
      title: string;
      price: string;
      payment_method: string;
      status: string;
      access: string;
      header_color: string;
      price_color: string;
      whatsapp_number: string;
      telegram_username: string;
      icon?: string | null;
      pix_qr_code?: string | null;
      pix_key?: string | null;
      payment_proof_image?: string | null;
      user_id?: string | null;
      submitted_at?: string | null;
      status_approval?: string | null;
      reviewed_at?: string | null;
      rejection_reason?: string | null;
      added_date?: string | null;
      code: string;
    };
    Update: {
      id?: string;
      title?: string;
      price?: string;
      payment_method?: string;
      status?: string;
      access?: string;
      header_color?: string;
      price_color?: string;
      whatsapp_number?: string;
      telegram_username?: string;
      icon?: string | null;
      pix_qr_code?: string | null;
      pix_key?: string | null;
      payment_proof_image?: string | null;
      user_id?: string | null;
      submitted_at?: string | null;
      status_approval?: string | null;
      reviewed_at?: string | null;
      rejection_reason?: string | null;
      added_date?: string | null;
      code?: string;
    };
  };
};

// Helper type for strongly typed Supabase queries
export type TableName = keyof Tables;

// Typed database helper function
export function getTypedSupabaseQuery<T extends TableName>(table: T) {
  return {
    table: table
  };
}

// This allows us to get the type of a table's row
export type TableRow<T extends TableName> = Tables[T]['Row'];
export type TableInsert<T extends TableName> = Tables[T]['Insert'];
export type TableUpdate<T extends TableName> = Tables[T]['Update'];
