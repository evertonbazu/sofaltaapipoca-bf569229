
export interface SubscriptionData {
  id?: string;
  title: string;
  price: string;
  paymentMethod: string;
  status: string;
  access: string;
  headerColor: string;
  priceColor: string;
  whatsappNumber: string;
  telegramUsername: string;
  icon?: string;
  addedDate?: string;
  pixQrCode?: string;
  pixKey?: string;
  paymentProofImage?: string;
  featured?: boolean;
}

// Interfaces para os dados das tabelas do Supabase
export interface SubscriptionFromSupabase {
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
  icon?: string;
  added_date?: string;
  pix_qr_code?: string;
  pix_key?: string;
  payment_proof_image?: string;
  featured?: boolean;
}

export interface PendingSubscriptionFromSupabase {
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
  icon?: string;
  added_date?: string;
  pix_qr_code?: string;
  pix_key?: string;
  payment_proof_image?: string;
  user_id: string;
  status_approval: string;
  reviewed_at?: string;
  rejection_reason?: string;
  submitted_at: string;
}

export interface ProfileFromSupabase {
  id: string;
  username?: string;
  role: string;
  created_at: string;
  updated_at: string;
}
