
import React, { useEffect, useState } from "react";
import SubscriptionItem from "./SubscriptionItem";
import { SubscriptionData } from "@/types/subscriptionTypes";
import { compareDates } from "@/utils/dateUtils";

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

  // Atualizar lista quando subscriptionList mudar, ordenando por data
  useEffect(() => {
    const sortedList = [...subscriptionList].sort((a, b) => 
      compareDates(a.addedDate, b.addedDate)
    );
    setVisibleSubscriptions(sortedList);
  }, [subscriptionList]);
  
  useEffect(() => {
    if (searchTerm.trim() === "") {
      const sortedList = [...subscriptionList].sort((a, b) => 
        compareDates(a.addedDate, b.addedDate)
      );
      setVisibleSubscriptions(sortedList);
      if (setHasResults) {
        setHasResults(sortedList.length > 0);
      }
      return;
    }
    
    const filtered = subscriptionList.filter(sub => {
      // Filtrar pelo título, preço ou método de pagamento (case insensitive)
      const content = `${sub.title} ${sub.price} ${sub.paymentMethod}`.toLowerCase();
      return content.includes(searchTerm.toLowerCase());
    });
    
    // Ordenar os resultados filtrados por data
    const sortedFiltered = filtered.sort((a, b) => 
      compareDates(a.addedDate, b.addedDate)
    );
    
    setVisibleSubscriptions(sortedFiltered);
    
    // Atualizar hasResults se a prop estiver disponível
    if (setHasResults) {
      setHasResults(sortedFiltered.length > 0);
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
