
import React from "react";
import { featuredSubscriptions } from "@/data/subscriptionData";
import SubscriptionItem from "./SubscriptionItem";

interface FeaturedSubscriptionsProps {
  subscriptionRefs: React.MutableRefObject<{[key: string]: HTMLDivElement | null}>;
}

const FeaturedSubscriptions: React.FC<FeaturedSubscriptionsProps> = ({ subscriptionRefs }) => {
  return (
    <div className="space-y-6 mb-8">
      {featuredSubscriptions.map((subscription) => (
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
          subscriptionRefs={subscriptionRefs}
        />
      ))}
    </div>
  );
};

export default FeaturedSubscriptions;
