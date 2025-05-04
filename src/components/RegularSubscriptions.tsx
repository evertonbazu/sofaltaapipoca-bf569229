
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
      // Incluindo todos os campos em que queremos buscar
      const content = `${sub.title} ${sub.price} ${sub.paymentMethod} ${sub.status} ${sub.access}`.toLowerCase();
      return content.includes(searchTerm.toLowerCase());
    });
    
    setVisibleSubscriptions(filtered);
    
    // Update hasResults if needed
    if (setHasResults) {
      // Só atualizamos hasResults para true se houver resultados
      if (filtered.length > 0) {
        setHasResults(true);
      } else if (searchTerm !== "" && visibleSubscriptions.length === 0) {
        // Só definimos como false se não houver resultados e o termo não for vazio
        setHasResults(false);
      }
    }
  }, [searchTerm, setHasResults, visibleSubscriptions.length]);

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
