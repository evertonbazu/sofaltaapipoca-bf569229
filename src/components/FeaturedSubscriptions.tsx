
import React from "react";

interface FeaturedSubscriptionsProps {
  subscriptionRefs: React.MutableRefObject<{[key: string]: HTMLDivElement | null}>;
}

const FeaturedSubscriptions: React.FC<FeaturedSubscriptionsProps> = ({ subscriptionRefs }) => {
  return (
    <div className="space-y-6 mb-8">
      {/* Featured subscriptions have been removed */}
    </div>
  );
};

export default FeaturedSubscriptions;
