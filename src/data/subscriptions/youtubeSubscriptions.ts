
import { SubscriptionData } from "@/types/subscriptionTypes";
import { addMissingCodes } from "@/utils/codeGenerator";

const rawYoutubeSubscriptions = [
  {
    title: "YOUTUBE PREMIUM",
    price: "120,00 /ano - PIX (Mensal)",
    paymentMethod: "PIX",
    status: "Assinado (2 vagas)",
    access: "CONVITE POR E-MAIL",
    headerColor: "bg-red-600",
    priceColor: "text-red-600",
    whatsappNumber: "5527988292875",
    telegramUsername: "Rastelinho",
    icon: "youtube",
    addedDate: "01/04/2025"
  },
  {
    title: "YOUTUBE PREMIUM",
    price: "R$ 10,00 - PIX (Mensal)",
    paymentMethod: "PIX",
    status: "Aguardando Membros (5 vagas)",
    access: "CONVITE POR E-MAIL",
    headerColor: "bg-red-600",
    priceColor: "text-red-600",
    whatsappNumber: "5586998315604",
    telegramUsername: "itallo92",
    icon: "youtube",
    addedDate: "01/04/2025"
  }
];

// Add codes to all youtube subscriptions with category code 3
export const youtubeSubscriptions: SubscriptionData[] = addMissingCodes(rawYoutubeSubscriptions as SubscriptionData[], 3);
