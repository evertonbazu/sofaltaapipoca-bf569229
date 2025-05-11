
import React, { useEffect, useState } from "react";
import SubscriptionItem from "./SubscriptionItem";
import { useIsMobile } from "@/hooks/use-mobile";
import { SubscriptionData } from "@/types/subscriptionTypes";

interface FeaturedSubscriptionsProps {
  subscriptionRefs: React.MutableRefObject<{[key: string]: HTMLDivElement | null}>;
  searchTerm?: string;
  setHasResults?: React.Dispatch<React.SetStateAction<boolean>>;
  subscriptionList: SubscriptionData[];
}

const FeaturedSubscriptions: React.FC<FeaturedSubscriptionsProps> = ({ 
  subscriptionRefs, 
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
      // Incluir todos os campos relevantes na busca
      const content = `${sub.title} ${sub.price} ${sub.paymentMethod} ${sub.status} ${sub.access}`.toLowerCase();
      return content.includes(searchTerm.toLowerCase());
    });
    
    setVisibleSubscriptions(filtered);
    
    // Atualizar hasResults se a prop estiver disponível
    if (setHasResults) {
      if (filtered.length > 0) {
        setHasResults(true);
      } else if (searchTerm !== "") {
        // Só definimos como false se houver um termo de busca e nenhum resultado
        setHasResults(false);
      }
    }
  }, [searchTerm, subscriptionList, setHasResults]);

  if (visibleSubscriptions.length === 0) {
    return null;
  }

  return (
    <div className={`grid gap-6 mb-8 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
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
          subscriptionRefs={subscriptionRefs}
        />
      ))}
    </div>
  );
};

export default FeaturedSubscriptions;
