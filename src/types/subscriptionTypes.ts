
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
  visible?: boolean;
  // Campos para expiração de assinaturas
  expirationDate?: string | Date;
  daysRemaining?: number;
  // Fields needed for handling previous pending subscriptions
  statusApproval?: string;
  rejectionReason?: string;
  submitted_at?: string;
  reviewed_at?: string;
  paymentProofImage?: string;
  pixQrCode?: string;
}

// Tipo para assinaturas expiradas
export interface ExpiredSubscriptionData {
  id?: string;
  userId: string;
  originalSubscriptionId?: string;
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
  code: string;
  pixKey?: string;
  pixQrCode?: string;
  paymentProofImage?: string;
  expiredAt: string | Date;
  expiryReason: string;
  createdAt?: string | Date;
}

// Alias for backward compatibility
export type PendingSubscriptionData = SubscriptionData;
