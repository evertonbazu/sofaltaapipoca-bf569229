
import { Subscription } from "@/types/subscriptionTypes";
import { addMissingCodes } from "@/utils/codeGenerator";

const rawMusicSubscriptions = [
  {
    title: "SPOTIFY",
    price: "R$ 7,00 - PIX (Mensal)",
    payment_method: "PIX",
    status: "Assinado (2 vagas)",
    access: "CONVITE POR E-MAIL",
    header_color: "bg-green-600",
    price_color: "text-green-600",
    whatsapp_number: "5588992259940",
    telegram_username: "pedro127",
    icon: "monitor",
    added_date: "01/04/2025"
  },
  {
    title: "SPOTIFY",
    price: "R$ 7,50 - PIX (Mensal)",
    payment_method: "PIX",
    status: "Assinado (2 vagas)",
    access: "CONVITE POR E-MAIL",
    header_color: "bg-green-600",
    price_color: "text-green-600",
    whatsapp_number: "5511912659702",
    telegram_username: "BrunnoSSantos",
    icon: "monitor",
    added_date: "01/04/2025"
  }
];

// Add codes to all music subscriptions with category code 2
export const musicSubscriptions: Subscription[] = addMissingCodes(rawMusicSubscriptions as Subscription[], 2);
