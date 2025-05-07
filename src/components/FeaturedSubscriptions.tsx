
import React, { useEffect, useState } from "react";
import SubscriptionItem from "./SubscriptionItem";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from '@/integrations/supabase/client';
import { SubscriptionData, SubscriptionFromSupabase } from "@/types/subscriptionTypes";

interface FeaturedSubscriptionsProps {
  subscriptionRefs: React.MutableRefObject<{[key: string]: HTMLDivElement | null}>;
  searchTerm?: string;
  setHasResults?: React.Dispatch<React.SetStateAction<boolean>>;
}

const FeaturedSubscriptions: React.FC<FeaturedSubscriptionsProps> = ({ 
  subscriptionRefs, 
  searchTerm = "", 
  setHasResults
}) => {
  const [allSubscriptions, setAllSubscriptions] = useState<SubscriptionData[]>([]);
  const [visibleSubscriptions, setVisibleSubscriptions] = useState<SubscriptionData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const isMobile = useIsMobile();

  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        setIsLoading(true);
        
        // Primeiro buscar anúncios fixados
        const { data: featuredData, error: featuredError } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('featured', true)
          .order('added_date', { ascending: false });
          
        if (featuredError) throw featuredError;
        
        // Se não houver anúncios fixados ou houver menos de 6, busque os mais recentes
        let regularData = [];
        
        if (!featuredData || featuredData.length < 6) {
          // Determinar quantos anúncios regulares são necessários
          const regularCount = 6 - (featuredData?.length || 0);
          
          // Buscar anúncios regulares, excluindo os que já são fixados
          let query = supabase
            .from('subscriptions')
            .select('*')
            .order('added_date', { ascending: false })
            .limit(regularCount);
            
          if (featuredData && featuredData.length > 0) {
            const featuredIds = featuredData.map(item => item.id);
            query = query.not('id', 'in', `(${featuredIds.join(',')})`);
          }
          
          const { data: regData, error: regError } = await query;
          
          if (regError) throw regError;
          regularData = regData || [];
        }
        
        // Combinar anúncios fixados e regulares
        const combinedData = [...(featuredData || []), ...regularData];
        
        if (combinedData) {
          const formattedSubscriptions: SubscriptionData[] = combinedData.map((item: SubscriptionFromSupabase) => ({
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
            addedDate: item.added_date,
            pixQrCode: item.pix_qr_code,
            pixKey: item.pix_key,
            paymentProofImage: item.payment_proof_image,
            featured: item.featured
          }));
          
          setAllSubscriptions(formattedSubscriptions);
          setVisibleSubscriptions(formattedSubscriptions);
        }
      } catch (error) {
        console.error('Error fetching featured subscriptions:', error);
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
      
      // Update hasResults based only on this component's results
      if (setHasResults && filtered.length > 0) {
        setHasResults(true);
      }
    } else {
      // When search term is empty, show all featured subscriptions
      setVisibleSubscriptions(allSubscriptions);
    }
  }, [searchTerm, allSubscriptions, setHasResults]);

  if (isLoading) {
    return (
      <div className="grid gap-6 mb-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, index) => (
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
    <div className={`grid gap-6 mb-8 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
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
          subscriptionRefs={subscriptionRefs}
          featured={subscription.featured}
        />
      ))}
    </div>
  );
};

export default FeaturedSubscriptions;
