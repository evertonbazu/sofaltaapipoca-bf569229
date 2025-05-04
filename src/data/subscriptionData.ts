
interface SubscriptionData {
  title: string;
  price: string;
  paymentMethod: string;
  status: string;
  access: string;
  headerColor: string;
  priceColor: string;
  whatsappNumber: string;
  telegramUsername: string;
}

export const subscriptions: SubscriptionData[] = [];

// Export empty arrays for featured and regular subscriptions
export const featuredSubscriptions: SubscriptionData[] = [];
export const regularSubscriptions: SubscriptionData[] = [];
