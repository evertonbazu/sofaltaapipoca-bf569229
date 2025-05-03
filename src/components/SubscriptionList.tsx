
import React from "react";
import FeaturedSubscriptions from "./FeaturedSubscriptions";
import RegularSubscriptions from "./RegularSubscriptions";

interface SubscriptionListProps {
  subscriptionRefs: React.MutableRefObject<{[key: string]: HTMLDivElement | null}>;
}

const SubscriptionList: React.FC<SubscriptionListProps> = ({ subscriptionRefs }) => {
  return (
    <div className="space-y-6">
      <FeaturedSubscriptions subscriptionRefs={subscriptionRefs} />
      <RegularSubscriptions />
    </div>
  );
};

export default SubscriptionList;
