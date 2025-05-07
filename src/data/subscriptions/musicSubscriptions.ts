
import { SubscriptionData } from "@/types/subscriptionTypes";
import { addMissingCodes } from "@/utils/codeGenerator";

const rawMusicSubscriptions = [
  {
    title: "SPOTIFY",
    price: "R$ 7,00 - PIX (Mensal)",
    paymentMethod: "PIX",
    status: "Assinado (2 vagas)",
    access: "CONVITE POR E-MAIL",
    headerColor: "bg-green-600",
    priceColor: "text-green-600",
    whatsappNumber: "5588992259940",
    telegramUsername: "pedro127",
    icon: "monitor",
    addedDate: "01/04/2025"
  },
  {
    title: "SPOTIFY",
    price: "R$ 7,50 - PIX (Mensal)",
    paymentMethod: "PIX",
    status: "Assinado (2 vagas)",
    access: "CONVITE POR E-MAIL",
    headerColor: "bg-green-600",
    priceColor: "text-green-600",
    whatsappNumber: "5511912659702",
    telegramUsername: "BrunnoSSantos",
    icon: "monitor",
    addedDate: "01/04/2025"
  }
];

// Add codes to all music subscriptions with category code 2
export const musicSubscriptions: SubscriptionData[] = addMissingCodes(rawMusicSubscriptions as SubscriptionData[], 2);
