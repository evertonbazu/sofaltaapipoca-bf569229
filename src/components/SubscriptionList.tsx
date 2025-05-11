
import React, { useEffect, useState } from "react";
import FeaturedSubscriptions from "./FeaturedSubscriptions";
import RegularSubscriptions from "./RegularSubscriptions";
import { getAllSubscriptions } from "@/services/subscription-service";
import { SubscriptionData } from "@/types/subscriptionTypes";

interface SubscriptionListProps {
  subscriptionRefs: React.MutableRefObject<{[key: string]: HTMLDivElement | null}>;
  searchTerm: string;
  setHasResults: (hasResults: boolean) => void;
}

const SubscriptionList: React.FC<SubscriptionListProps> = ({ 
  subscriptionRefs, 
  searchTerm,
  setHasResults
}) => {
  const [subscriptions, setSubscriptions] = useState<{
    featured: SubscriptionData[];
    regular: { [category: string]: SubscriptionData[] };
  }>({
    featured: [],
    regular: {}
  });

  // Função para buscar todas as assinaturas e organizá-las
  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        const allSubscriptions = await getAllSubscriptions();
        
        // Organize subscriptions by category and type (featured or regular)
        const featured: SubscriptionData[] = [];
        const regular: { [category: string]: SubscriptionData[] } = {};
        
        allSubscriptions.forEach((sub: SubscriptionData) => {
          // Filter by search term if there is one
          const matchesSearch = searchTerm === '' || 
            sub.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (sub.description?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
            (sub.category?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
          
          if (matchesSearch) {
            if (sub.featured) {
              featured.push(sub);
            } else {
              // Group by category
              const category = sub.category || "Outras";
              if (!regular[category]) {
                regular[category] = [];
              }
              regular[category].push(sub);
            }
          }
        });
        
        // Update state with organized subscriptions
        setSubscriptions({ featured, regular });
        
        // Check if there are results
        const hasResults = featured.length > 0 || Object.keys(regular).length > 0;
        setHasResults(hasResults);
        
      } catch (error) {
        console.error("Erro ao buscar assinaturas:", error);
        setHasResults(false);
      }
    };
    
    fetchSubscriptions();
  }, [searchTerm, setHasResults]);
  
  return (
    <div className="space-y-10">
      {/* Featured Subscriptions */}
      {subscriptions.featured.length > 0 && (
        <FeaturedSubscriptions 
          subscriptionItems={subscriptions.featured} 
        />
      )}
      
      {/* Regular Subscriptions */}
      {Object.keys(subscriptions.regular).length > 0 && (
        <RegularSubscriptions 
          groupedSubscriptions={subscriptions.regular}
          subscriptionRefs={subscriptionRefs}
        />
      )}
    </div>
  );
};

export default SubscriptionList;
