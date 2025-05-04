
import React, { useEffect } from "react";
import FeaturedSubscriptions from "./FeaturedSubscriptions";
import RegularSubscriptions from "./RegularSubscriptions";

interface SubscriptionListProps {
  subscriptionRefs: React.MutableRefObject<{[key: string]: HTMLDivElement | null}>;
  searchTerm: string;
  setHasResults: React.Dispatch<React.SetStateAction<boolean>>;
}

const SubscriptionList: React.FC<SubscriptionListProps> = ({ 
  subscriptionRefs, 
  searchTerm, 
  setHasResults 
}) => {
  // Reset hasResults to true when searchTerm is empty
  useEffect(() => {
    if (searchTerm === "") {
      setHasResults(true);
    }
  }, [searchTerm, setHasResults]);
  
  return (
    <div className="space-y-6">
      <FeaturedSubscriptions 
        subscriptionRefs={subscriptionRefs} 
        searchTerm={searchTerm}
        setHasResults={setHasResults}
      />
      <RegularSubscriptions 
        searchTerm={searchTerm}
        setHasResults={setHasResults}
      />
    </div>
  );
};

export default SubscriptionList;
