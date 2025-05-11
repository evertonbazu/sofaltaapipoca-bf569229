
import React, { useEffect, useState } from "react";
import SubscriptionItem from "./SubscriptionItem";
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
      // Filtrar principalmente pelo título (case insensitive)
      return sub.title.toLowerCase().includes(searchTerm.toLowerCase());
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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
