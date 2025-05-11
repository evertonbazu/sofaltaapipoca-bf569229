
import React, { useEffect, useState } from "react";
import SubscriptionItem from "./SubscriptionItem";
import { SubscriptionData } from "@/types/subscriptionTypes";

interface FeaturedSubscriptionsProps {
  subscriptionRefs?: React.MutableRefObject<{[key: string]: HTMLDivElement | null}>;
  searchTerm?: string;
  setHasResults?: React.Dispatch<React.SetStateAction<boolean>>;
  subscriptionList?: SubscriptionData[];
  subscriptionItems?: SubscriptionData[];  // Adding this for backward compatibility
  isAdmin?: boolean;
}

const FeaturedSubscriptions: React.FC<FeaturedSubscriptionsProps> = ({ 
  subscriptionRefs = {current: {}}, 
  searchTerm = "", 
  setHasResults,
  subscriptionList = [],
  subscriptionItems = [], // For backward compatibility
  isAdmin = false
}) => {
  // Use either subscriptionItems or subscriptionList, prioritizing subscriptionItems for backward compatibility
  const items = subscriptionItems.length > 0 ? subscriptionItems : subscriptionList;
  const [visibleSubscriptions, setVisibleSubscriptions] = useState<SubscriptionData[]>(items);

  // Update list when source items change
  useEffect(() => {
    setVisibleSubscriptions(items);
  }, [items]);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setVisibleSubscriptions(items);
      return;
    }
    
    const filtered = items.filter(sub => {
      // Filter by title, category, or description (case insensitive)
      const titleMatch = sub.title.toLowerCase().includes(searchTerm.toLowerCase());
      const categoryMatch = sub.category?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
      const descriptionMatch = sub.description?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
      
      return titleMatch || categoryMatch || descriptionMatch;
    });
    
    setVisibleSubscriptions(filtered);
    
    // Update hasResults if the prop is available
    if (setHasResults) {
      if (filtered.length > 0) {
        setHasResults(true);
      } else if (searchTerm !== "") {
        // Only set to false if there's a search term and no results
        setHasResults(false);
      }
    }
  }, [searchTerm, items, setHasResults]);

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
          isAdmin={isAdmin}
          isUserSubmission={subscription.isUserSubmission}
        />
      ))}
    </div>
  );
};

export default FeaturedSubscriptions;
