
import React, { useEffect, useState } from "react";
import SubscriptionItem from "./SubscriptionItem";
import { useIsMobile } from "@/hooks/use-mobile";
import { SubscriptionData } from "@/types/subscriptionTypes";

interface RegularSubscriptionsProps {
  searchTerm?: string;
  setHasResults?: React.Dispatch<React.SetStateAction<boolean>>;
  subscriptionList: SubscriptionData[];
}

const RegularSubscriptions: React.FC<RegularSubscriptionsProps> = ({ 
  searchTerm = "", 
  setHasResults,
  subscriptionList = []
}) => {
  const [visibleSubscriptions, setVisibleSubscriptions] = useState<SubscriptionData[]>(subscriptionList);
  const isMobile = useIsMobile();

  // Atualizar lista quando subscriptionList mudar
  useEffect(() => {
    setVisibleSubscriptions(subscriptionList);
  }, [subscriptionList]);
  
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setVisibleSubscriptions(subscriptionList);
      return;
    }
    
    const filtered = subscriptionList.filter(sub => {
      // Incluir todos os campos relevantes na busca (case insensitive)
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
  }, [searchTerm, subscriptionList, setHasResults]);

  if (visibleSubscriptions.length === 0) {
    return null;
  }

  return (
    <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
      {visibleSubscriptions.map((subscription) => (
        <SubscriptionItem
          key={`${subscription.id}-${subscription.title}`}
          id={subscription.id}
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
