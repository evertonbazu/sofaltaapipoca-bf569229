
import React, { useEffect, useState } from "react";
import { regularSubscriptions } from "@/data/subscriptions";
import SubscriptionItem from "./SubscriptionItem";
import { useIsMobile } from "@/hooks/use-mobile";

interface RegularSubscriptionsProps {
  searchTerm?: string;
  setHasResults?: React.Dispatch<React.SetStateAction<boolean>>;
}

const RegularSubscriptions: React.FC<RegularSubscriptionsProps> = ({ 
  searchTerm = "", 
  setHasResults 
}) => {
  const [visibleSubscriptions, setVisibleSubscriptions] = useState(regularSubscriptions);
  const isMobile = useIsMobile();

  useEffect(() => {
    const filtered = regularSubscriptions.filter(sub => {
      // Incluir todos os campos relevantes na busca
      const content = `${sub.title} ${sub.price} ${sub.paymentMethod} ${sub.status} ${sub.access}`.toLowerCase();
      return content.includes(searchTerm.toLowerCase());
    });
    
    setVisibleSubscriptions(filtered);
    
    // Atualizar hasResults se a prop estiver disponível e não tiver sido definida por FeaturedSubscriptions
    if (setHasResults) {
      if (filtered.length > 0) {
        setHasResults(true);
      } 
      // Não definimos hasResults como false aqui, pois isso é feito no SubscriptionList
      // baseado na combinação de resultados de ambos os componentes
    }
  }, [searchTerm, setHasResults]);

  if (visibleSubscriptions.length === 0) {
    return null;
  }

  return (
    <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
      {visibleSubscriptions.map((subscription, index) => (
        <SubscriptionItem
          key={`${subscription.title}-${index}`}
          title={subscription.title}
          price={subscription.price}
          paymentMethod={subscription.paymentMethod}
          status={subscription.status}
          access={subscription.access}
          headerColor={subscription.headerColor}
          priceColor={subscription.priceColor}
          whatsappNumber={subscription.whatsappNumber}
          telegramUsername={subscription.telegramUsername}
          icon={subscription.icon}
          addedDate={subscription.addedDate}
        />
      ))}
    </div>
  );
};

export default RegularSubscriptions;
