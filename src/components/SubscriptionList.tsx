
import React, { useEffect, useState } from "react";
import FeaturedSubscriptions from "./FeaturedSubscriptions";
import RegularSubscriptions from "./RegularSubscriptions";
import { supabase } from "@/integrations/supabase/client";
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

  // Function to fetch all subscriptions and organize them
  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        // Fetch subscriptions from Supabase
        const { data: allSubscriptions, error } = await supabase
          .from('subscriptions')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (error) throw error;

        // Map database fields to our SubscriptionData interface
        const mappedSubscriptions = allSubscriptions.map((sub): SubscriptionData => ({
          id: sub.id,
          title: sub.title,
          price: sub.price,
          paymentMethod: sub.payment_method,
          status: sub.status,
          access: sub.access,
          headerColor: sub.header_color,
          priceColor: sub.price_color,
          whatsappNumber: sub.whatsapp_number,
          telegramUsername: sub.telegram_username,
          icon: sub.icon,
          addedDate: sub.added_date,
          featured: sub.featured,
          code: sub.code,
          userId: sub.user_id,
          pixKey: sub.pix_key,
          category: sub.category || "Outras", // Default category
          description: sub.description
        }));
        
        // Organize subscriptions by category and type (featured or regular)
        const featured: SubscriptionData[] = [];
        const regular: { [category: string]: SubscriptionData[] } = {};
        
        mappedSubscriptions.forEach((sub: SubscriptionData) => {
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
        const hasResults = featured.length > 0 || Object.values(regular).flat().length > 0;
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
          subscriptionRefs={subscriptionRefs}
          searchTerm={searchTerm}
        />
      )}
      
      {/* Regular Subscriptions */}
      {Object.keys(subscriptions.regular).length > 0 && (
        <RegularSubscriptions 
          groupedSubscriptions={subscriptions.regular}
          subscriptionRefs={subscriptionRefs}
          searchTerm={searchTerm}
        />
      )}
    </div>
  );
};

export default SubscriptionList;
