
export interface SubscriptionData {
  id?: string;
  title: string;
  customTitle?: string; // Novo campo para título personalizado
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
  featured?: boolean;
  code?: string;
  userId?: string;
  pixKey?: string;
  category?: string;
  isMemberSubmission?: boolean;
  visible?: boolean;
  fullName?: string; // Novo campo para nome completo
  // Fields needed for handling previous pending subscriptions
  statusApproval?: string;
  rejectionReason?: string;
  submitted_at?: string;
  reviewed_at?: string;
  paymentProofImage?: string;
  pixQrCode?: string;
}

// Alias for backward compatibility
export type PendingSubscriptionData = SubscriptionData;
