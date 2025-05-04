
import React, { useEffect, useState } from "react";
import { featuredSubscriptions } from "@/data/subscriptions";
import SubscriptionItem from "./SubscriptionItem";
import { useIsMobile } from "@/hooks/use-mobile";

interface FeaturedSubscriptionsProps {
  subscriptionRefs: React.MutableRefObject<{[key: string]: HTMLDivElement | null}>;
  searchTerm?: string;
  setHasResults?: React.Dispatch<React.SetStateAction<boolean>>;
}

const FeaturedSubscriptions: React.FC<FeaturedSubscriptionsProps> = ({ 
  subscriptionRefs, 
  searchTerm = "", 
  setHasResults
}) => {
  const [visibleSubscriptions, setVisibleSubscriptions] = useState(featuredSubscriptions);
  const isMobile = useIsMobile();

  useEffect(() => {
    const filtered = featuredSubscriptions.filter(sub => {
      // Incluindo todos os campos em que queremos buscar
      const content = `${sub.title} ${sub.price} ${sub.paymentMethod} ${sub.status} ${sub.access}`.toLowerCase();
      return content.includes(searchTerm.toLowerCase());
    });
    
    setVisibleSubscriptions(filtered);
    
    // Update hasResults if needed and this component has the setHasResults prop
    if (setHasResults) {
      // Se há algum resultado em visibleSubscriptions, atualize o estado
      if (filtered.length > 0) {
        setHasResults(true);
      } else if (searchTerm !== "") {
        // Só define como false se houver um termo de busca e nenhum resultado
        setHasResults(false);
      } else {
        // Se o termo de busca estiver vazio, sempre mostramos todos os resultados
        setHasResults(true);
      }
    }
  }, [searchTerm, setHasResults]);

  if (visibleSubscriptions.length === 0) {
    return null;
  }

  return (
    <div className={`grid gap-6 mb-8 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
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
          subscriptionRefs={subscriptionRefs}
        />
      ))}
    </div>
  );
};

export default FeaturedSubscriptions;
