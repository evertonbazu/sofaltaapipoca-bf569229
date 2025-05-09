
export interface ProfileFromSupabase {
  [key: string]: any;
  id: string;
  username?: string;
  email?: string;
  role: 'admin' | 'member' | 'user' | string; // Added string to allow any role value
  created_at?: string;
  updated_at?: string;
  senha?: string;
}

export interface PendingSubscription {
  id: string;
  user_id: string | null; // User ID from auth.users
  title: string;
  price: string;
  submitted_at: string;
  payment_method: string;
  access: string;
  status: string;
  header_color: string;
  price_color: string;
  whatsapp_number: string;
  telegram_username: string;
  icon: string | null;
  pix_qr_code: string | null;
  pix_key: string | null;
  payment_proof_image: string | null;
  status_approval: string | null;
  reviewed_at: string | null;
  rejection_reason: string | null;
  added_date: string | null;
  code: string | null;
}

export interface Subscription {
  id: string;
  title: string;
  price: string;
  payment_method: string;
  status: string;
  access: string;
  header_color: string;
  price_color: string;
  user_id?: string | null;
  whatsapp_number: string;
  telegram_username: string;
  icon: string | null;
  pix_qr_code: string | null;
  pix_key: string | null;
  payment_proof_image: string | null;
  created_at?: string;
  updated_at?: string;
  code: string;
  featured?: boolean;
  added_date?: string | null;
}

// Add SubscriptionData alias for compatibility with existing code
export type SubscriptionData = Subscription;

// Add SubscriptionFromSupabase for compatibility with Supabase responses
export type SubscriptionFromSupabase = Subscription;

// Add PendingSubscriptionFromSupabase for compatibility with Supabase responses
export type PendingSubscriptionFromSupabase = PendingSubscription;
