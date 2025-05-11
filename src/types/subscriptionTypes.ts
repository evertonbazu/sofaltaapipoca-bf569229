
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
}

export interface PendingSubscriptionData extends SubscriptionData {
  paymentProofImage?: string;
  pixQrCode?: string;
  pixKey?: string;
  statusApproval?: string;
  rejectionReason?: string;
  userId?: string;
}
