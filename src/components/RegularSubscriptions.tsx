
import React, { useEffect, useState } from "react";
import SubscriptionItem from "./SubscriptionItem";
import { SubscriptionData } from "@/types/subscriptionTypes";

interface RegularSubscriptionsProps {
  searchTerm?: string;
  setHasResults?: React.Dispatch<React.SetStateAction<boolean>>;
  subscriptionList: SubscriptionData[];
  title?: string;
}

const RegularSubscriptions: React.FC<RegularSubscriptionsProps> = ({ 
  searchTerm = "", 
  setHasResults,
  subscriptionList = [],
  title
}) => {
  const [visibleSubscriptions, setVisibleSubscriptions] = useState<SubscriptionData[]>(subscriptionList);

  // Atualizar lista quando subscriptionList mudar
  useEffect(() => {
    console.log("RegularSubscriptions - received subscription list:", subscriptionList);
    setVisibleSubscriptions(subscriptionList);
  }, [subscriptionList]);
  
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setVisibleSubscriptions(subscriptionList);
      if (setHasResults) {
        setHasResults(subscriptionList.length > 0);
      }
      return;
    }
    
    const filtered = subscriptionList.filter(sub => {
      // Filtrar pelo título, preço ou método de pagamento (case insensitive)
      const content = `${sub.title} ${sub.price} ${sub.paymentMethod} ${sub.status} ${sub.access}`.toLowerCase();
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
    <div>
      {title && (
        <h2 className="text-xl font-medium mb-4">{title}</h2>
      )}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {visibleSubscriptions.map((subscription) => {
          console.log("Rendering subscription:", subscription.title, "isMemberSubmission:", subscription.isMemberSubmission);
          return (
            <SubscriptionItem
              key={`${subscription.id}-${subscription.title}`}
              id={subscription.id}
              title={subscription.title}
              price={subscription.price}
              paymentMethod={subscription.paymentMethod}
              status={subscription.status || "Assinado"} 
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
          );
        })}
      </div>
    </div>
  );
};

export default RegularSubscriptions;
