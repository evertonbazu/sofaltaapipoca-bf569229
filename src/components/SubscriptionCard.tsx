
import React from 'react';
import { Card } from '@/components/ui/card';
import { SubscriptionData } from '@/types/subscriptionTypes';
import { getIconByName } from '@/utils/iconsHelper';
import { Star } from 'lucide-react';

interface SubscriptionCardProps {
  subscription: SubscriptionData;
  showButtons?: boolean;
}

const SubscriptionCard = ({ subscription, showButtons = true }: SubscriptionCardProps) => {
  const IconComponent = getIconByName(subscription.icon);
  
  const formatAddedDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR');
    } catch (e) {
      return dateString; // Return the original string if parsing fails
    }
  };

  return (
    <Card className="overflow-hidden border rounded-lg shadow hover:shadow-md transition-shadow">
      <div className={`flex justify-between items-start p-4 text-white ${subscription.headerColor}`}>
        <div className="flex items-center">
          <div className="p-2 bg-white bg-opacity-20 rounded-full">
            {IconComponent && <IconComponent className="h-6 w-6" />}
          </div>
          <h3 className="ml-3 font-medium text-lg">{subscription.title}</h3>
        </div>
        
        {subscription.featured && (
          <Star className="h-5 w-5 text-yellow-300 fill-yellow-300" />
        )}
      </div>
      
      <div className="p-4">
        <div className={`font-bold text-xl ${subscription.priceColor}`}>
          {subscription.price}
        </div>
        
        <div className="mt-2 text-sm text-gray-600">
          <p><span className="font-medium">Status:</span> {subscription.status}</p>
          <p><span className="font-medium">Acesso:</span> {subscription.access}</p>
          <p><span className="font-medium">Adicionado em:</span> {formatAddedDate(subscription.addedDate)}</p>
        </div>
        
        {showButtons && (
          <div className="mt-4 flex space-x-2">
            {subscription.telegramUsername && (
              <a 
                href={`https://t.me/${subscription.telegramUsername}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition"
              >
                Telegram
              </a>
            )}
            
            {subscription.whatsappNumber && (
              <a 
                href={`https://wa.me/${subscription.whatsappNumber}`}
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
