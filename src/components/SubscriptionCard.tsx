
import React from 'react';
import { Button } from "@/components/ui/button";

interface SubscriptionCardProps {
  title: string;
  price: string;
  paymentMethod: string;
  status: string;
  access: string;
  headerColor: string;
  priceColor: string;
  whatsappNumber: string;
  telegramUsername: string;
  centerTitle?: boolean;
}

const SubscriptionCard = ({
  title,
  price,
  paymentMethod,
  status,
  access,
  headerColor,
  priceColor,
  whatsappNumber,
  telegramUsername,
  centerTitle = true
}: SubscriptionCardProps) => {
  const handleWhatsappClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${whatsappNumber}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleTelegramClick = () => {
    const telegramUrl = `https://t.me/${telegramUsername}`;
    window.open(telegramUrl, '_blank');
  };

  return (
    <div className="card bg-white rounded-xl overflow-hidden shadow-lg">
      <div className={`${headerColor} p-4`}>
        <h2 className={`text-xl font-bold text-white flex items-center ${centerTitle ? 'justify-center' : ''}`}>
          <span className="mr-2">🖥</span> {title}
        </h2>
      </div>
      <div className="p-5 space-y-4">
        <div className="flex justify-between items-center">
          <span className="font-semibold text-gray-700">🏦 Valor:</span>
          <span className={`text-xl font-bold ${priceColor}`}>{price}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="font-semibold text-gray-700">💰 Forma de pagamento:</span>
          <span className="font-medium text-gray-900">{paymentMethod}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="font-semibold text-gray-700">📌 Status:</span>
          <span className="font-medium text-gray-900">{status}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="font-semibold text-gray-700">🔐 Acesso:</span>
          <span className="font-medium text-gray-900">{access}</span>
        </div>
        <div className="pt-4 space-y-3">
          <a 
            onClick={handleTelegramClick}
            className="contact-btn w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center cursor-pointer"
          >
            <span className="mr-2">📩</span> Contato por Telegram
          </a>
          <a 
            onClick={handleWhatsappClick}
            className="contact-btn w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center cursor-pointer"
          >
            <span className="mr-2">📱</span> Contato por WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionCard;
