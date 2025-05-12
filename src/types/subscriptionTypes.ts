
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
  featured?: boolean;
  code?: string;
  userId?: string;
  pixKey?: string;
  category?: string;
  isMemberSubmission?: boolean;
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
