
import React from 'react';
import { Tv, Youtube, Apple, Monitor } from 'lucide-react';

interface SubscriptionCardProps {
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
  centerTitle?: boolean;
  icon?: string;
  isSearchResult?: boolean;
  addedDate?: string;
  version?: string;
}

const SubscriptionCard = ({
  id,
  title,
  price,
  paymentMethod,
  status,
  access,
  headerColor,
  priceColor,
  whatsappNumber,
  telegramUsername,
  centerTitle = true,
  icon = 'monitor',
  isSearchResult = false,
  addedDate,
  version = '2.0.0'
}: SubscriptionCardProps) => {
  const handleWhatsappClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${whatsappNumber}`;
    window.open(whatsappUrl, '_blank');
  };
  
  const handleTelegramClick = () => {
    const telegramUrl = `https://t.me/${telegramUsername}`;
    window.open(telegramUrl, '_blank');
  };

  // Função para renderizar o ícone apropriado com base no tipo de assinatura
  const renderIcon = () => {
    switch (icon) {
      case 'tv':
        return <Tv size={20} className="mr-2" />;
      case 'youtube':
        return <Youtube size={20} className="mr-2" />;
      case 'apple':
        return <Apple size={20} className="mr-2" />;
      case 'monitor':
      default:
        return <Monitor size={20} className="mr-2" />;
    }
  };
  
  // Sempre usar fundo azul para o título, ignorando headerColor
  const titleBackgroundColor = "bg-blue-600";
  
  return (
    <div className={`card bg-white rounded-xl overflow-hidden shadow-lg ${isSearchResult ? 'search-highlight' : ''}`}>
      <div className={`${titleBackgroundColor} p-4`}>
        <h2 className={`text-xl font-bold text-white flex items-center ${centerTitle ? 'justify-center' : ''}`}>
          {renderIcon()} {title}
        </h2>
      </div>
      <div className="p-3 sm:p-5 space-y-3 sm:space-y-4">
        <div className="flex flex-wrap justify-between items-center">
          <span className="font-semibold text-gray-700 text-sm sm:text-base">🏦 Valor:</span>
          <span className={`text-lg sm:text-xl font-bold ${priceColor}`}>{price}</span>
        </div>
        <div className="flex flex-wrap justify-between items-center">
          <span className="font-semibold text-gray-700 text-sm sm:text-base">💰 Forma de pagamento:</span>
          <span className="font-medium text-gray-900 text-sm sm:text-base">{paymentMethod}</span>
        </div>
        <div className="flex flex-wrap justify-between items-center">
          <span className="font-semibold text-gray-700 text-sm sm:text-base">📌 Status:</span>
          <span className="font-medium text-gray-900 text-sm sm:text-base">{status}</span>
        </div>
        <div className="flex flex-wrap justify-between items-center">
          <span className="font-semibold text-gray-700 text-sm sm:text-base">🔐 Acesso:</span>
          <span className="font-medium text-gray-900 text-sm sm:text-base">{access}</span>
        </div>
        {addedDate && (
          <div className="flex flex-wrap justify-between items-center">
            <span className="font-semibold text-gray-700 text-sm sm:text-base">📅 Adicionado em:</span>
            <span className="font-medium text-gray-900 text-sm sm:text-base">{addedDate}</span>
          </div>
        )}
        <div className="pt-4 space-y-2 sm:space-y-3">
          <a 
            onClick={handleTelegramClick} 
            className="contact-btn w-full bg-blue-600 hover:bg-blue-700 text-white py-2 sm:py-3 px-4 rounded-lg font-medium flex items-center justify-center cursor-pointer text-sm sm:text-base"
          >
            <span className="mr-2">📩</span> Contato por Telegram
          </a>
          <a 
            onClick={handleWhatsappClick} 
            className="contact-btn w-full bg-green-600 hover:bg-green-700 text-white py-2 sm:py-3 px-4 rounded-lg font-medium flex items-center justify-center cursor-pointer text-sm sm:text-base"
          >
            <span className="mr-2">📱</span> Contato por WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionCard;
