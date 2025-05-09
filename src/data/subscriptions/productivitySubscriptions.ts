import { Subscription } from "@/types/subscriptionTypes";
import { addMissingCodes } from "@/utils/codeGenerator";

const rawProductivitySubscriptions = [
  {
    title: "GOOGLE ONE IA PREMIUM 2TB COM GEMINI ADVANCED 2.5",
    price: "R$ 20,00 - PIX (Mensal)",
    payment_method: "PIX",
    status: "Assinado (4 vagas)",
    access: "CONVITE POR E-MAIL",
    header_color: "bg-blue-600",
    price_color: "text-blue-600",
    whatsapp_number: "5598984045368",
    telegram_username: "brenokennedyof",
    icon: "monitor",
    added_date: "01/04/2025"
  },
  {
    title: "MCAFEE TOTAL PROTECTION",
    price: "R$ 5,00 - PIX (Mensal)",
    payment_method: "PIX",
    status: "Assinado (2 vagas)",
    access: "ATIVAÇÃO",
    header_color: "bg-red-600",
    price_color: "text-red-600",
    whatsapp_number: "5527997692531",
    telegram_username: "otaviodw",
    icon: "monitor",
    added_date: "01/04/2025"
  },
  {
    title: "APPLE ONE (2TB)",
    price: "R$ 20,00 - PIX (Mensal)",
    payment_method: "PIX",
    status: "Assinado (1 vaga)",
    access: "CONVITE POR E-MAIL",
    header_color: "bg-gray-600",
    price_color: "text-gray-600",
    whatsapp_number: "5598984045368",
    telegram_username: "brenokennedyof",
    icon: "apple",
    added_date: "01/04/2025"
  },
  {
    title: "Microsoft 365 Família 1T",
    price: "R$ 12 - PIX (Mensal)",
    payment_method: "PIX",
    status: "Assinado",
    access: "Convite por E-mail",
    header_color: "bg-blue-600",
    price_color: "text-blue-600",
    whatsapp_number: "5587991988684",
    telegram_username: "alessadinozzo",
    icon: "monitor",
    added_date: "01/04/2025"
  }
];

// Add codes to all productivity subscriptions with category code 4
export const productivitySubscriptions: Subscription[] = addMissingCodes(rawProductivitySubscriptions as Subscription[], 4);
