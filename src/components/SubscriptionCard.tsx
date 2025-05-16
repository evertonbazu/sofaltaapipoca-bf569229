
import React from 'react';
import { Card } from '@/components/ui/card';
import { SubscriptionData } from '@/types/subscriptionTypes';
import { getIconByName } from '@/utils/iconsHelper';
import { Star } from 'lucide-react';

export interface SubscriptionCardProps {
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
  icon?: string;
  addedDate?: string;
  showButtons?: boolean;
  isMemberSubmission?: boolean;
  isSearchResult?: boolean;
  featured?: boolean;
  subscription?: SubscriptionData;
}

const SubscriptionCard = (props: SubscriptionCardProps) => {
  const { 
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
    icon, 
    addedDate,
    featured = false,
    showButtons = true 
  } = props;
  
  const IconComponent = getIconByName(icon);
  
  const formatAddedDate = (dateString?: string) => {
    if (!dateString) return '-';
    
    try {
      // Check if it's already in DD/MM/YYYY format
      if (dateString.includes('/')) return dateString;
      
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR');
    } catch (e) {
      return dateString; // Return the original string if parsing fails
    }
  };

  return (
    <Card className="overflow-hidden border rounded-lg shadow hover:shadow-md transition-shadow">
      <div className={`flex justify-between items-start p-4 text-white ${headerColor}`}>
        <div className="flex items-center">
          <div className="p-2 bg-white bg-opacity-20 rounded-full">
            {IconComponent && <IconComponent className="h-6 w-6" />}
          </div>
          <h3 className="ml-3 font-medium text-lg">{title}</h3>
        </div>
        
        {featured && (
          <Star className="h-5 w-5 text-yellow-300 fill-yellow-300" />
        )}
      </div>
      
      <div className="p-4">
        <div className={`font-bold text-xl ${priceColor}`}>
          {price}
        </div>
        
        <div className="mt-2 text-sm text-gray-600">
          <p><span className="font-medium">Status:</span> {status}</p>
          <p><span className="font-medium">Acesso:</span> {access}</p>
          <p><span className="font-medium">Adicionado em:</span> {formatAddedDate(addedDate)}</p>
        </div>
        
        {showButtons && (
          <div className="mt-4 flex space-x-2">
            {telegramUsername && (
              <a 
                href={`https://t.me/${telegramUsername}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition"
              >
                Telegram
              </a>
            )}
            
            {whatsappNumber && (
              <a 
                href={`https://wa.me/${whatsappNumber}`}
                target="_blank" 
                rel="noopener noreferrer"
                className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600 transition"
              >
                WhatsApp
              </a>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};

export default SubscriptionCard;
