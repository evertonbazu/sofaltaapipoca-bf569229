
import React from "react";
import { regularSubscriptions } from "@/data/subscriptionData";
import SubscriptionItem from "./SubscriptionItem";

const RegularSubscriptions: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold text-white mb-1">📺 Todas as Assinaturas</h2>
        <p className="text-indigo-100 text-sm">Aproveite nossas ofertas exclusivas</p>
      </div>
      
      {regularSubscriptions.map((subscription) => (
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
        />
      ))}
    </div>
  );
};

export default RegularSubscriptions;
