
import React, { useEffect, useState } from "react";
import SubscriptionItem from "./SubscriptionItem";
import { SubscriptionData } from "@/types/subscriptionTypes";

interface RegularSubscriptionsProps {
  searchTerm?: string;
  setHasResults?: React.Dispatch<React.SetStateAction<boolean>>;
  subscriptionList?: SubscriptionData[];
  groupedSubscriptions?: { [category: string]: SubscriptionData[] }; // Adding this for backward compatibility
  subscriptionRefs?: React.MutableRefObject<{[key: string]: HTMLDivElement | null}>;
  isAdmin?: boolean;
}

const RegularSubscriptions: React.FC<RegularSubscriptionsProps> = ({ 
  searchTerm = "", 
  setHasResults,
  subscriptionList = [],
  groupedSubscriptions = {},
  subscriptionRefs,
  isAdmin = false
}) => {
  // If we have groupedSubscriptions, flatten them into a single array
  const items = subscriptionList.length > 0 ? subscriptionList : 
    Object.values(groupedSubscriptions).flat();
  
  const [visibleSubscriptions, setVisibleSubscriptions] = useState<SubscriptionData[]>(items);

  // Update list when source items change
  useEffect(() => {
    setVisibleSubscriptions(items);
  }, [items]);
  
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setVisibleSubscriptions(items);
      if (setHasResults) {
        setHasResults(items.length > 0);
      }
      return;
    }
    
    const filtered = items.filter(sub => {
      // Filter by title, price, paymentMethod, category, or description
      const content = `${sub.title} ${sub.price} ${sub.paymentMethod} ${sub.category || ''} ${sub.description || ''}`.toLowerCase();
      return content.includes(searchTerm.toLowerCase());
    });
    
    setVisibleSubscriptions(filtered);
    
    // Update hasResults if the prop is available
    if (setHasResults) {
      setHasResults(filtered.length > 0);
    }
  }, [searchTerm, items, setHasResults]);

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
          status={subscription.status || "Assinado"} // Default status if not provided
          access={subscription.access}
          headerColor={subscription.headerColor}
          priceColor={subscription.priceColor}
          whatsappNumber={subscription.whatsappNumber}
          telegramUsername={subscription.telegramUsername}
          icon={subscription.icon}
          addedDate={subscription.addedDate}
          isSearchResult={false}
          isAdmin={isAdmin}
          isUserSubmission={subscription.isUserSubmission}
          subscriptionRefs={subscriptionRefs}
        />
      ))}
    </div>
  );
};

export default RegularSubscriptions;
