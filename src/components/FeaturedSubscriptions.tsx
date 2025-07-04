
import React, { useEffect, useState } from "react";
import SubscriptionItem from "./SubscriptionItem";
import { SubscriptionData } from "@/types/subscriptionTypes";
import { sortByDateDesc } from "@/utils/dateUtils";

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
  const [visibleSubscriptions, setVisibleSubscriptions] = useState<SubscriptionData[]>([]);

  // Atualizar e ordenar lista quando subscriptionList mudar
  useEffect(() => {
    const sortedList = sortByDateDesc(subscriptionList);
    setVisibleSubscriptions(sortedList);
  }, [subscriptionList]);

  useEffect(() => {
    const sortedList = sortByDateDesc(subscriptionList);
    
    if (searchTerm.trim() === "") {
      setVisibleSubscriptions(sortedList);
      return;
    }
    
    const filtered = sortedList.filter(sub => {
      // Filtrar principalmente pelo título (case insensitive)
      const content = `${sub.title} ${sub.price} ${sub.paymentMethod}`.toLowerCase();
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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
          isMemberSubmission={subscription.isMemberSubmission}
          featured={true} // Explicitamente definir como true para todas as assinaturas neste componente
        />
      ))}
    </div>
  );
};

export default FeaturedSubscriptions;
