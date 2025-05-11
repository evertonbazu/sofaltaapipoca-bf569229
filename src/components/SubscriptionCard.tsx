
import React from 'react';
import { Tv, Youtube, Apple, Monitor, Banknote, HandHelping, Key, Pin } from 'lucide-react';

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
  // Helper function to create WhatsApp link
  const getWhatsappLink = () => {
    return `https://wa.me/${whatsappNumber}`;
  };
  
  // Helper function to create Telegram link
  const getTelegramLink = () => {
    // Remove @ if present at the beginning of the username
    const cleanUsername = telegramUsername.startsWith('@') 
      ? telegramUsername.substring(1) 
      : telegramUsername;
    
    return `https://telegram.me/${cleanUsername}`;
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
  
  // Determine the background color class based on the headerColor prop
  const bgColorClass = headerColor || 'bg-blue-600';
  
  // Determine the price color class based on the priceColor prop
  const priceColorClass = priceColor || 'text-blue-600';
  
  return (
    <div className={`card h-full bg-white rounded-xl overflow-hidden shadow-lg ${isSearchResult ? 'search-highlight' : ''}`}>
      <div className={`${bgColorClass} p-4 flex items-center justify-center h-20`}>
        <h2 className="text-xl font-bold text-white flex items-center text-center uppercase">
          🖥 {title}
        </h2>
      </div>
      <div className="p-5 space-y-3">
        <div className="space-y-2 text-center">
          <p className={`${priceColorClass} font-medium uppercase flex items-center justify-center`}>
            <span className="mr-1">🏦</span> Valor: {price}
          </p>
          <p className="text-gray-900 font-medium uppercase flex items-center justify-center">
            <span className="mr-1">🫱🏼‍🫲🏼</span> Forma de Pagamento: {paymentMethod}
          </p>
          <p className="text-gray-900 font-medium uppercase flex items-center justify-center">
            <span className="mr-1">📌</span> Status: {status}
          </p>
          <p className="text-gray-900 font-medium uppercase flex items-center justify-center">
            <span className="mr-1">🔐</span> Envio: {access}
          </p>
        </div>
        
        {addedDate && (
          <div className="py-2 border-t border-gray-200 mt-2 text-center">
            <p className="text-gray-700 text-sm uppercase">📅 Adicionado em: {addedDate}</p>
          </div>
        )}
        
        <div className="pt-3 space-y-2">
          <a 
            href={getTelegramLink()}
            target="_blank"
            rel="noopener noreferrer" 
            className="contact-btn w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium flex items-center justify-center cursor-pointer uppercase"
          >
            <span className="mr-2">📩</span> Contato por Telegram
          </a>
          <a 
            href={getWhatsappLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="contact-btn w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-medium flex items-center justify-center cursor-pointer uppercase"
          >
            <span className="mr-2">📱</span> Contato por WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionCard;
