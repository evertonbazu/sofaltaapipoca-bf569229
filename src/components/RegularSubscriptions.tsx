
import React, { useEffect, useState } from "react";
import { regularSubscriptions } from "@/data/subscriptions";
import SubscriptionItem from "./SubscriptionItem";

interface RegularSubscriptionsProps {
  searchTerm?: string;
  setHasResults?: React.Dispatch<React.SetStateAction<boolean>>;
}

const RegularSubscriptions: React.FC<RegularSubscriptionsProps> = ({ 
  searchTerm = "", 
  setHasResults 
}) => {
  const [visibleSubscriptions, setVisibleSubscriptions] = useState(regularSubscriptions);

  useEffect(() => {
    if (searchTerm) {
      const filtered = regularSubscriptions.filter(sub => {
        const content = `${sub.title} ${sub.price} ${sub.paymentMethod} ${sub.status} ${sub.access}`.toLowerCase();
        return content.includes(searchTerm);
      });
      setVisibleSubscriptions(filtered);
      
      // Update hasResults if needed
      if (setHasResults) {
        const hasAnyResults = filtered.length > 0;
        setHasResults(prevState => hasAnyResults);
      }
    } else {
      // When search term is empty, show all regular subscriptions
      setVisibleSubscriptions(regularSubscriptions);
      // Reset hasResults if no search term
      if (setHasResults) {
        setHasResults(true);
      }
    }
  }, [searchTerm, setHasResults]);

  if (visibleSubscriptions.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      {visibleSubscriptions.map((subscription) => (
        <SubscriptionItem
          key={subscription.title}
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
