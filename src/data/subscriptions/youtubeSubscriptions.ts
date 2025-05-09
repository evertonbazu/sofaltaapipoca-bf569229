import { Subscription } from "@/types/subscriptionTypes";
import { addMissingCodes } from "@/utils/codeGenerator";

const rawYoutubeSubscriptions = [
  {
    title: "YOUTUBE PREMIUM",
    price: "120,00 /ano - PIX (Mensal)",
    payment_method: "PIX",
    status: "Assinado (2 vagas)",
    access: "CONVITE POR E-MAIL",
    header_color: "bg-red-600",
    price_color: "text-red-600",
    whatsapp_number: "5527988292875",
    telegram_username: "Rastelinho",
    icon: "youtube",
    added_date: "01/04/2025"
  },
  {
    title: "YOUTUBE PREMIUM",
    price: "R$ 10,00 - PIX (Mensal)",
    payment_method: "PIX",
    status: "Aguardando Membros (5 vagas)",
    access: "CONVITE POR E-MAIL",
    header_color: "bg-red-600",
    price_color: "text-red-600",
    whatsapp_number: "5586998315604",
    telegram_username: "itallo92",
    icon: "youtube",
    added_date: "01/04/2025"
  }
];

// Add codes to all youtube subscriptions with category code 3
export const youtubeSubscriptions: Subscription[] = addMissingCodes(rawYoutubeSubscriptions as Subscription[], 3);
