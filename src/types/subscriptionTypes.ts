
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
}

export interface PendingSubscriptionData extends SubscriptionData {
  paymentProofImage?: string;
  pixQrCode?: string;
  statusApproval?: string;
  rejectionReason?: string;
  submitted_at?: string;
  reviewed_at?: string;
}
