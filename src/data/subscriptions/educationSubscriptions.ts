import { Subscription } from "@/types/subscriptionTypes";
import { addMissingCodes } from "@/utils/codeGenerator";

const rawEducationSubscriptions = [
  {
    title: "BABBEL (Cursos de Idiomas)",
    price: "R$ 10,00 - PIX (Mensal)",
    payment_method: "PIX",
    status: "Assinado (1 Vaga)",
    access: "LOGIN E SENHA",
    header_color: "bg-purple-600",
    price_color: "text-purple-600",
    whatsapp_number: "5513992077804",
    telegram_username: "evertonbazu",
    icon: "monitor",
    added_date: "01/04/2025"
  },
  {
    title: "ALURA PLUS",
    price: "R$ 20,00 - PIX (Mensal)",
    payment_method: "PIX",
    status: "Assinado",
    access: "LOGIN E SENHA",
    header_color: "bg-blue-600",
    price_color: "text-blue-600",
    whatsapp_number: "5513992077804",
    telegram_username: "evertonbazu",
    icon: "monitor",
    added_date: "01/04/2025"
  },
  {
    title: "GRAN CURSOS ILIMITADO AMIGOS",
    price: "R$ 34,00 - PIX (Mensal)",
    payment_method: "PIX",
    status: "Assinado (1 vaga)",
    access: "CONVITE POR E-MAIL",
    header_color: "bg-yellow-600",
    price_color: "text-yellow-600",
    whatsapp_number: "5562982292725",
    telegram_username: "DonaMariaRosa",
    icon: "monitor",
    added_date: "01/04/2025"
  },
  {
    title: "SUPER DUOLINGO PLUS - ANUAL",
    price: "R$ 58,24 - PIX (ANUAL)",
    payment_method: "PIX",
    status: "Assinado (1 vaga)",
    access: "CONVITE POR E-MAIL",
    header_color: "bg-green-600",
    price_color: "text-green-600",
    whatsapp_number: "5565984450752",
    telegram_username: "euothiagoandrade",
    icon: "monitor",
    added_date: "01/04/2025"
  },
  {
    title: "CANVA",
    price: "R$ 10,00 - PIX (Mensal)",
    payment_method: "PIX",
    status: "Assinado",
    access: "CONVITE",
    header_color: "bg-blue-600",
    price_color: "text-blue-600",
    whatsapp_number: "5513992077804",
    telegram_username: "evertonbazu",
    icon: "monitor",
    added_date: "01/04/2025"
  }
];

// Add codes to all education subscriptions with category code 1
export const educationSubscriptions: Subscription[] = addMissingCodes(rawEducationSubscriptions as Subscription[], 1);
