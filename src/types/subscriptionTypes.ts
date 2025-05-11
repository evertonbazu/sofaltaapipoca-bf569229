
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
  isUserSubmission?: boolean;
}

export interface PendingSubscriptionData extends SubscriptionData {
  paymentProofImage?: string;
  pixQrCode?: string;
  statusApproval?: string;
  rejectionReason?: string;
  submitted_at?: string;
  reviewed_at?: string;
}

export interface HeaderButton {
  id: string;
  title: string;
  icon: string;
  url: string;
  visible: boolean;
  position: number;
  created_at?: string;
  updated_at?: string;
}
