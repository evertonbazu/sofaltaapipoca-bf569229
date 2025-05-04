
import React, { useEffect } from "react";
import FeaturedSubscriptions from "./FeaturedSubscriptions";
import RegularSubscriptions from "./RegularSubscriptions";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const isMobile = useIsMobile();
  
  // Reset hasResults to true when searchTerm is empty
  useEffect(() => {
    if (searchTerm === "") {
      setHasResults(true);
    }
  }, [searchTerm, setHasResults]);
  
  return (
    <div className={`space-y-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
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
