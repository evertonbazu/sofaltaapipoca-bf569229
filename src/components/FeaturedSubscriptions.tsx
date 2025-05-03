
import React from "react";
import SubscriptionItem from "./SubscriptionItem";
import { featuredSubscriptions } from "@/data/subscriptionData";

interface FeaturedSubscriptionsProps {
  subscriptionRefs: React.MutableRefObject<{[key: string]: HTMLDivElement | null}>;
}

const FeaturedSubscriptions: React.FC<FeaturedSubscriptionsProps> = ({ subscriptionRefs }) => {
  return (
    <div className="space-y-6 mb-8">
      {featuredSubscriptions.map((subscription) => (
        <SubscriptionItem
          key={subscription.title}
          {...subscription}
          subscriptionRefs={subscriptionRefs}
        />
      ))}
    </div>
  );
};

export default FeaturedSubscriptions;
