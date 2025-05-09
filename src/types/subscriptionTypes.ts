
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
  
  // Client-side property aliases (camelCase versions)
  paymentMethod?: string;
  headerColor?: string;
  priceColor?: string;
  whatsappNumber?: string;
  telegramUsername?: string;
  addedDate?: string | null;
  pixKey?: string | null;
  pixQrCode?: string | null;
  paymentProofImage?: string | null;
}

// Helper function to convert from snake_case (DB) to camelCase (UI)
export function adaptSubscription(sub: Subscription): Subscription {
  if (!sub) return sub;
  
  // Add camelCase aliases while preserving the original snake_case properties
  return {
    ...sub,
    paymentMethod: sub.payment_method,
    headerColor: sub.header_color,
    priceColor: sub.price_color,
    whatsappNumber: sub.whatsapp_number,
    telegramUsername: sub.telegram_username,
    addedDate: sub.added_date,
    pixKey: sub.pix_key,
    pixQrCode: sub.pix_qr_code,
    paymentProofImage: sub.payment_proof_image
  };
}

// Helper function to convert a list of subscriptions
export function adaptSubscriptions(subs: Subscription[]): Subscription[] {
  return subs.map(adaptSubscription);
}

// Helper function to convert from camelCase (UI) to snake_case (DB)
export function prepareSubscriptionForDB(sub: any): Partial<Subscription> {
  const result: Partial<Subscription> = { ...sub };
  
  // Map camelCase properties to snake_case if they exist
  if (sub.paymentMethod !== undefined) result.payment_method = sub.paymentMethod;
  if (sub.headerColor !== undefined) result.header_color = sub.headerColor;
  if (sub.priceColor !== undefined) result.price_color = sub.priceColor;
  if (sub.whatsappNumber !== undefined) result.whatsapp_number = sub.whatsappNumber;
  if (sub.telegramUsername !== undefined) result.telegram_username = sub.telegramUsername;
  if (sub.addedDate !== undefined) result.added_date = sub.addedDate;
  if (sub.pixKey !== undefined) result.pix_key = sub.pixKey;
  if (sub.pixQrCode !== undefined) result.pix_qr_code = sub.pixQrCode;
  if (sub.paymentProofImage !== undefined) result.payment_proof_image = sub.paymentProofImage;
  
  // Remove camelCase properties to avoid duplication
  delete result.paymentMethod;
  delete result.headerColor;
  delete result.priceColor;
  delete result.whatsappNumber;
  delete result.telegramUsername;
  delete result.addedDate;
  delete result.pixKey;
  delete result.pixQrCode;
  delete result.paymentProofImage;
  
  return result;
}

// Add SubscriptionData type alias for compatibility with existing code
export type SubscriptionData = Subscription;

// Add SubscriptionFromSupabase for compatibility with Supabase responses
export type SubscriptionFromSupabase = Subscription;

// Add PendingSubscriptionFromSupabase for compatibility with Supabase responses
export type PendingSubscriptionFromSupabase = PendingSubscription;
