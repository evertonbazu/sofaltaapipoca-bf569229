
import React from 'react';
import { SubscriptionData } from '@/types/subscriptionTypes';
import { Button } from '@/components/ui/button';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { 
  Monitor,
  Youtube,
  Apple,
  Tv,
  AlertCircle
} from 'lucide-react';

interface SubscriptionCardProps {
  subscription: SubscriptionData;
}

const SubscriptionCard: React.FC<SubscriptionCardProps> = ({ subscription }) => {
  const {
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
    addedDate
  } = subscription;
  
  // Classe de cores do cabeçalho
  const headerColorClass = headerColor || 'bg-blue-600';
  
  // Classe de cores do preço
  const priceColorClass = priceColor || 'text-blue-600';
  
  // Formatar link do WhatsApp
  const whatsappLink = `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}`;
  
  // Formatar link do Telegram
  const telegramLink = `https://t.me/${telegramUsername.replace(/[@]/g, '')}`;
  
  // Selecionar ícone com base na propriedade icon
  const renderIcon = () => {
    switch(icon) {
      case 'tv':
        return <Tv className="w-6 h-6 text-white" />;
      case 'youtube':
        return <Youtube className="w-6 h-6 text-white" />;
      case 'apple':
        return <Apple className="w-6 h-6 text-white" />;
      case 'monitor':
        return <Monitor className="w-6 h-6 text-white" />;
      default:
        return null;
    }
  };

  return (
    <div className="border rounded-lg overflow-hidden shadow-sm transition-shadow hover:shadow-md bg-white">
      {/* Cabeçalho */}
      <div className={`${headerColorClass} p-4 flex items-center justify-between`}>
        <div className="flex items-center justify-center w-full">
          {renderIcon()}
          <h3 className="text-white font-bold text-lg ml-2 text-center">{title}</h3>
        </div>
      </div>
      
      {/* Corpo do cartão */}
      <div className="p-4">
        {/* Preço */}
        <div className="text-center mb-4">
          <span className={`text-2xl font-bold ${priceColorClass}`}>{price}</span>
          <span className="block text-gray-500 text-sm">{paymentMethod}</span>
        </div>
        
        {/* Detalhes */}
        <div className="space-y-2 mb-6">
          <div className="flex items-center justify-between">
            <span className="text-gray-500">Status:</span>
            <span className="font-medium">{status}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-500">Acesso:</span>
            <span className="font-medium">{access}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-500">Adicionado em:</span>
            <span className="text-sm">{addedDate}</span>
          </div>
        </div>
        
        {/* Botões */}
        <div className="grid grid-cols-2 gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => window.open(whatsappLink, '_blank')}
                >
                  WhatsApp
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Entre em contato via WhatsApp</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => window.open(telegramLink, '_blank')}
                >
                  Telegram
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Entre em contato via Telegram</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionCard;
