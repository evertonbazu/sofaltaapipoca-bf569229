
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
        
        // Organizar assinaturas por categoria e tipo (featured ou regular)
        const featured: SubscriptionData[] = [];
        const regular: { [category: string]: SubscriptionData[] } = {};
        
        allSubscriptions.forEach((sub: SubscriptionData) => {
          // Filtrar por termo de busca se houver
          const matchesSearch = searchTerm === '' || 
            sub.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            sub.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            sub.category.toLowerCase().includes(searchTerm.toLowerCase());
          
          if (matchesSearch) {
            if (sub.featured) {
              featured.push(sub);
            } else {
              // Agrupar por categoria
              if (!regular[sub.category]) {
                regular[sub.category] = [];
              }
              regular[sub.category].push(sub);
            }
          }
        });
        
        // Atualizar state com assinaturas organizadas
        setSubscriptions({ featured, regular });
        
        // Verificar se há resultados
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
      {/* Assinaturas em Destaque */}
      {subscriptions.featured.length > 0 && (
        <FeaturedSubscriptions subscriptions={subscriptions.featured} />
      )}
      
      {/* Assinaturas Regulares */}
      {Object.keys(subscriptions.regular).length > 0 && (
        <RegularSubscriptions 
          categorizedSubscriptions={subscriptions.regular}
          subscriptionRefs={subscriptionRefs}
        />
      )}
    </div>
  );
};

export default SubscriptionList;
