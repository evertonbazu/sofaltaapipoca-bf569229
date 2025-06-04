
import React, { useEffect, useState } from "react";
import SubscriptionItem from "./SubscriptionItem";
import { SubscriptionData } from "@/types/subscriptionTypes";
import { sortByDateDesc } from "@/utils/dateUtils";

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
      if (setHasResults) {
        setHasResults(sortedList.length > 0);
      }
      return;
    }
    
    const filtered = sortedList.filter(sub => {
      // Filtrar pelo título, preço ou método de pagamento (case insensitive)
      const content = `${sub.title} ${sub.price} ${sub.paymentMethod}`.toLowerCase();
      return content.includes(searchTerm.toLowerCase());
    });
    
    setVisibleSubscriptions(filtered);
    
    // Atualizar hasResults se a prop estiver disponível
    if (setHasResults) {
      setHasResults(filtered.length > 0);
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
          status={subscription.status || "Assinado"} // Status padrão como "Assinado" se não for fornecido
          access={subscription.access}
          headerColor={subscription.headerColor}
          priceColor={subscription.priceColor}
          whatsappNumber={subscription.whatsappNumber}
          telegramUsername={subscription.telegramUsername}
          icon={subscription.icon}
          addedDate={subscription.addedDate}
          isSearchResult={false}
          isMemberSubmission={subscription.isMemberSubmission}
        />
      ))}
    </div>
  );
};

export default RegularSubscriptions;
