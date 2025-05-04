
import React from "react";
import { featuredSubscriptions } from "@/data/subscriptionData";
import SubscriptionItem from "./SubscriptionItem";

interface FeaturedSubscriptionsProps {
  subscriptionRefs: React.MutableRefObject<{[key: string]: HTMLDivElement | null}>;
}

const FeaturedSubscriptions: React.FC<FeaturedSubscriptionsProps> = ({ subscriptionRefs }) => {
  return (
    <div className="space-y-6 mb-8">
      <div className="text-center">
        <h2 className="text-xl font-bold text-white mb-1">⭐ Ofertas em Destaque ⭐</h2>
        <p className="text-indigo-100 text-sm">Últimas vagas disponíveis</p>
      </div>
      
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
