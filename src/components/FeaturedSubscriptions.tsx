
import React, { useEffect, useState } from "react";
import { featuredSubscriptions } from "@/data/subscriptions";
import SubscriptionItem from "./SubscriptionItem";

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

  useEffect(() => {
    if (searchTerm) {
      const filtered = featuredSubscriptions.filter(sub => {
        const content = `${sub.title} ${sub.price} ${sub.paymentMethod} ${sub.status} ${sub.access}`.toLowerCase();
        return content.includes(searchTerm);
      });
      setVisibleSubscriptions(filtered);
      
      // Update hasResults if needed
      if (setHasResults) {
        const hasAnyResults = filtered.length > 0;
        setHasResults(prevState => hasAnyResults || prevState);
      }
    } else {
      setVisibleSubscriptions(featuredSubscriptions);
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
    <div className="space-y-6 mb-8">
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
          subscriptionRefs={subscriptionRefs}
        />
      ))}
    </div>
  );
};

export default FeaturedSubscriptions;
