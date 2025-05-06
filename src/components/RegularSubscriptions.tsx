
import React, { useEffect, useState } from "react";
import SubscriptionItem from "./SubscriptionItem";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from '@/integrations/supabase/client';
import { SubscriptionData } from "@/types/subscriptionTypes";

interface RegularSubscriptionsProps {
  searchTerm?: string;
  setHasResults?: React.Dispatch<React.SetStateAction<boolean>>;
}

const RegularSubscriptions: React.FC<RegularSubscriptionsProps> = ({ 
  searchTerm = "", 
  setHasResults 
}) => {
  const [allSubscriptions, setAllSubscriptions] = useState<SubscriptionData[]>([]);
  const [visibleSubscriptions, setVisibleSubscriptions] = useState<SubscriptionData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [featuredIds, setFeaturedIds] = useState<string[]>([]);
  const isMobile = useIsMobile();

  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        setIsLoading(true);
        
        // First get the IDs of featured subscriptions to exclude them
        const { data: featuredData } = await supabase
          .from('subscriptions')
          .select('id')
          .order('added_date', { ascending: false })
          .limit(6);
        
        const featuredIds = featuredData?.map(item => item.id) || [];
        setFeaturedIds(featuredIds);
        
        // Then get all remaining subscriptions
        let query = supabase
          .from('subscriptions')
          .select('*')
          .order('added_date', { ascending: false });
          
        if (featuredIds.length > 0) {
          query = query.not('id', 'in', `(${featuredIds.join(',')})`);
        }
        
        const { data, error } = await query;
        
        if (error) throw error;
        
        if (data) {
          const formattedSubscriptions: SubscriptionData[] = data.map(item => ({
            id: item.id,
            title: item.title,
            price: item.price,
            paymentMethod: item.payment_method,
            status: item.status,
            access: item.access,
            headerColor: item.header_color,
            priceColor: item.price_color,
            whatsappNumber: item.whatsapp_number,
            telegramUsername: item.telegram_username,
            icon: item.icon,
            addedDate: item.added_date
          }));
          
          setAllSubscriptions(formattedSubscriptions);
          setVisibleSubscriptions(formattedSubscriptions);
        }
      } catch (error) {
        console.error('Error fetching regular subscriptions:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSubscriptions();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = allSubscriptions.filter(sub => {
        const content = `${sub.title} ${sub.price} ${sub.paymentMethod} ${sub.status} ${sub.access}`.toLowerCase();
        return content.includes(searchTerm.toLowerCase());
      });
      
      setVisibleSubscriptions(filtered);
      
      // Update hasResults if needed
      if (setHasResults) {
        // Check if there are any results either from this component or from FeaturedSubscriptions
        if (filtered.length > 0) {
          setHasResults(true);
        } else {
          // Check if FeaturedSubscriptions also has no results
          supabase
            .from('subscriptions')
            .select('count')
            .filter('id', 'in', `(${featuredIds.join(',')})`)
            .ilike('title', `%${searchTerm}%`)
            .then(({ count }) => {
              if (count === 0) {
                setHasResults(false);
              }
            });
        }
      }
    } else {
      // When search term is empty, show all regular subscriptions
      setVisibleSubscriptions(allSubscriptions);
      // Reset hasResults if no search term
      if (setHasResults) {
        setHasResults(true);
      }
    }
  }, [searchTerm, allSubscriptions, featuredIds, setHasResults]);

  if (isLoading) {
    return (
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(9)].map((_, index) => (
          <div key={index} className="animate-pulse bg-white rounded-xl shadow-lg h-80">
            <div className="bg-gray-300 h-16 rounded-t-xl"></div>
            <div className="p-4 space-y-4">
              <div className="h-6 bg-gray-200 rounded"></div>
              <div className="h-6 bg-gray-200 rounded"></div>
              <div className="h-6 bg-gray-200 rounded"></div>
              <div className="h-6 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded mt-6"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (visibleSubscriptions.length === 0) {
    return null;
  }

  return (
    <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
      {visibleSubscriptions.map((subscription) => (
        <SubscriptionItem
          key={subscription.id}
          title={subscription.title}
          price={subscription.price}
          paymentMethod={subscription.paymentMethod}
          status={subscription.status}
          access={subscription.access}
          headerColor={subscription.headerColor}
          priceColor={subscription.priceColor}
          whatsappNumber={subscription.whatsappNumber}
          telegramUsername={subscription.telegramUsername}
          icon={subscription.icon}
          addedDate={subscription.addedDate}
        />
      ))}
    </div>
  );
};

export default RegularSubscriptions;
