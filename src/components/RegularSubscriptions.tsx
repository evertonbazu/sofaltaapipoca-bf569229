
import React from "react";
import SubscriptionItem from "./SubscriptionItem";
import { regularSubscriptions } from "@/data/subscriptionData";

const RegularSubscriptions: React.FC = () => {
  return (
    <div className="space-y-6">
      {regularSubscriptions.map((subscription) => (
        <SubscriptionItem
          key={subscription.title}
          {...subscription}
        />
      ))}
    </div>
  );
};

export default RegularSubscriptions;
