
import { SubscriptionData } from "@/types/subscriptionTypes";
import { addMissingCodes } from "@/utils/codeGenerator";

const rawEducationSubscriptions = [
  {
    title: "BABBEL (Cursos de Idiomas)",
    price: "R$ 10,00 - PIX (Mensal)",
    paymentMethod: "PIX",
    status: "Assinado (1 Vaga)",
    access: "LOGIN E SENHA",
    headerColor: "bg-purple-600",
    priceColor: "text-purple-600",
    whatsappNumber: "5513992077804",
    telegramUsername: "evertonbazu",
    icon: "monitor",
    addedDate: "01/04/2025"
  },
  {
    title: "ALURA PLUS",
    price: "R$ 20,00 - PIX (Mensal)",
    paymentMethod: "PIX",
    status: "Assinado",
    access: "LOGIN E SENHA",
    headerColor: "bg-blue-600",
    priceColor: "text-blue-600",
    whatsappNumber: "5513992077804",
    telegramUsername: "evertonbazu",
    icon: "monitor",
    addedDate: "01/04/2025"
  },
  {
    title: "GRAN CURSOS ILIMITADO AMIGOS",
    price: "R$ 34,00 - PIX (Mensal)",
    paymentMethod: "PIX",
    status: "Assinado (1 vaga)",
    access: "CONVITE POR E-MAIL",
    headerColor: "bg-yellow-600",
    priceColor: "text-yellow-600",
    whatsappNumber: "5562982292725",
    telegramUsername: "DonaMariaRosa",
    icon: "monitor",
    addedDate: "01/04/2025"
  },
  {
    title: "SUPER DUOLINGO PLUS - ANUAL",
    price: "R$ 58,24 - PIX (ANUAL)",
    paymentMethod: "PIX",
    status: "Assinado (1 vaga)",
    access: "CONVITE POR E-MAIL",
    headerColor: "bg-green-600",
    priceColor: "text-green-600",
    whatsappNumber: "5565984450752",
    telegramUsername: "euothiagoandrade",
    icon: "monitor",
    addedDate: "01/04/2025"
  },
  {
    title: "CANVA",
    price: "R$ 10,00 - PIX (Mensal)",
    paymentMethod: "PIX",
    status: "Assinado",
    access: "CONVITE",
    headerColor: "bg-blue-600",
    priceColor: "text-blue-600",
    whatsappNumber: "5513992077804",
    telegramUsername: "evertonbazu",
    icon: "monitor",
    addedDate: "01/04/2025"
  }
];

// Add codes to all education subscriptions with category code 1
export const educationSubscriptions: SubscriptionData[] = addMissingCodes(rawEducationSubscriptions as SubscriptionData[], 1);
