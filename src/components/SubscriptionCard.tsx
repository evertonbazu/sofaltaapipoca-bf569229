
import React from 'react';
import { Tv, Youtube, Apple, Monitor, Banknote, HandHelping, Key, Pin, Edit, Star, Clock, AlertCircle } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

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
  isMemberSubmission?: boolean;
  featured?: boolean;
  isAdminSubmission?: boolean;
  expirationDate?: string | Date;
  daysRemaining?: number;
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
  version = '3.1.5', // Versão atualizada
  isMemberSubmission = false,
  featured = false,
  isAdminSubmission = false,
  expirationDate,
  daysRemaining
}: SubscriptionCardProps) => {
  // State to track if current user is admin
  const [isAdmin, setIsAdmin] = React.useState(false);

  // Check if user is admin
  React.useEffect(() => {
    const checkIfAdmin = async () => {
      try {
        const {
          data,
          error
        } = await supabase.rpc('is_admin');
        if (error) throw error;
        setIsAdmin(data);
      } catch (error) {
        console.error('Erro ao verificar se o usuário é administrador:', error);
        setIsAdmin(false);
      }
    };
    checkIfAdmin();
  }, []);

  // Helper function to create WhatsApp link
  const getWhatsappLink = () => {
    return `https://wa.me/${whatsappNumber}`;
  };

  // Helper function to create Telegram link
  const getTelegramLink = () => {
    // Add a null check for telegramUsername
    if (!telegramUsername) {
      return '#';
    }

    // Remove @ if present at the beginning of the username
    const cleanUsername = telegramUsername.startsWith('@') ? telegramUsername.substring(1) : telegramUsername;
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
  
  // Check if subscription is expiring soon (3 days or less)
  const isExpiringSoon = daysRemaining !== undefined && daysRemaining >= 0 && daysRemaining <= 3;
  
  return (
    <div className={`card h-full bg-white rounded-xl overflow-hidden shadow-lg ${isSearchResult ? 'search-highlight' : ''} ${isExpiringSoon ? 'border-orange-400 border-2' : ''}`}>
      <div className={`${bgColorClass} p-4 flex items-center justify-center h-20 relative`}>
        <h2 className="text-xl font-bold text-white flex items-center text-center uppercase">
          🖥 {title}
        </h2>
        
        {/* Posicionar estrela no canto superior direito quando em destaque */}
        {featured && <div className="absolute top-2 right-2">
            <span className="text-yellow-300 text-xl">⭐</span>
          </div>}
        
        {/* Badge para submissões de membros */}
        {isMemberSubmission && <div className="absolute top-2 right-2">
            
          </div>}
        
        {/* Badge para submissões de administradores */}
        {isAdminSubmission && <div className="absolute top-2 right-2">
            <Badge variant="secondary" className="text-xs bg-purple-600 text-white">Admin</Badge>
          </div>}

        {/* Se for destaque e submissão de membro, ajustar a posição da badge de membro */}
        {featured && isMemberSubmission && <div className="absolute top-8 right-2">
            
          </div>}
        
        {/* Se for destaque e submissão de admin, ajustar a posição da badge de admin */}
        {featured && isAdminSubmission && <div className="absolute top-8 right-2">
            <Badge variant="secondary" className="text-xs bg-purple-600 text-white">Admin</Badge>
          </div>}

        {isAdmin && id && <div className="absolute top-2 left-2">
            <Link to={`/admin/subscriptions/edit/${id}`} className="bg-white text-blue-600 p-1 rounded-full hover:bg-gray-100" title="Editar assinatura">
              <Edit size={16} />
            </Link>
          </div>}
      </div>
      
      <div className="p-5 space-y-3">
        <div className="space-y-2 text-left">
          <p className={`${priceColorClass} font-medium uppercase flex items-center`}>
            <span className="mr-1">🏦</span> Valor: {price}
          </p>
          <p className="text-gray-900 font-medium uppercase flex items-center">
            <span className="mr-1">🫱🏼‍🫲🏼</span> Forma de Pagamento: {paymentMethod}
          </p>
          <p className="text-gray-900 font-medium uppercase flex items-center">
            <span className="mr-1">📌</span> Status: {status}
          </p>
          <p className="text-gray-900 font-medium uppercase flex items-center">
            <span className="mr-1">🔐</span> Envio: {access}
          </p>
        </div>
        
        {addedDate && <div className="py-2 border-t border-gray-200 mt-2 text-left">
            <p className="text-gray-700 text-sm uppercase flex items-center">
              <span className="mr-1">📅</span> Adicionado em: {addedDate}
            </p>
          </div>}
        
        {/* Exibir informações de expiração se disponíveis */}
        {expirationDate && daysRemaining !== undefined && (
          <div className="py-2 border-t border-gray-200 mt-2 text-left">
            <div className={`flex items-center ${daysRemaining <= 3 ? 'text-red-500' : 'text-blue-600'}`}>
              <Clock className="mr-2 h-4 w-4" />
              <span className="font-medium">
                {daysRemaining > 0 
                  ? `Expira em ${daysRemaining} dia${daysRemaining !== 1 ? 's' : ''}` 
                  : 'Expirou hoje!'}
              </span>
            </div>
            
            {isExpiringSoon && (
              <div className="flex items-center mt-1 text-orange-500">
                <AlertCircle className="mr-2 h-4 w-4" />
                <span className="text-sm">Esta assinatura expirará em breve</span>
              </div>
            )}
          </div>
        )}
        
        <div className="pt-3 space-y-2">
          {telegramUsername && <a href={getTelegramLink()} target="_blank" rel="noopener noreferrer" className="contact-btn w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium flex items-center justify-center cursor-pointer uppercase">
              <span className="mr-2">📩</span> Contato por Telegram
            </a>}
          {whatsappNumber && <a href={getWhatsappLink()} target="_blank" rel="noopener noreferrer" className="contact-btn w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-medium flex items-center justify-center cursor-pointer uppercase">
              <span className="mr-2">📱</span> Contato por WhatsApp
            </a>}
        </div>
      </div>
    </div>
  );
};

export default SubscriptionCard;
