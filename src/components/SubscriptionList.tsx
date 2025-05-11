
import React, { useEffect, useState } from "react";
import FeaturedSubscriptions from "./FeaturedSubscriptions";
import RegularSubscriptions from "./RegularSubscriptions";
import { useIsMobile } from "@/hooks/use-mobile";
import { SubscriptionData } from "@/types/subscriptionTypes";
import { getAllSubscriptions, getFeaturedSubscriptions } from "@/services/subscription-service";

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
  const [featuredList, setFeaturedList] = useState<SubscriptionData[]>([]);
  const [regularList, setRegularList] = useState<SubscriptionData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Buscar assinaturas do banco de dados
  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        setIsLoading(true);
        const featured = await getFeaturedSubscriptions();
        const all = await getAllSubscriptions();
        
        // Filtrar assinaturas regulares (todas exceto as destacadas)
        const regular = all.filter(sub => !sub.featured);
        
        setFeaturedList(featured);
        setRegularList(regular);
      } catch (error) {
        console.error("Erro ao buscar assinaturas:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSubscriptions();
  }, []);
  
  useEffect(() => {
    // Verificar resultados da busca para ambas as listas
    const hasFeaturedResults = featuredList.some(sub => 
      sub.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.paymentMethod.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.access.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    const hasRegularResults = regularList.some(sub => 
      sub.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.paymentMethod.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.access.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    // Se o termo de busca estiver vazio, sempre mostra resultados
    if (searchTerm === "") {
      setHasResults(true);
    } else {
      // Caso contrário, verifica se há algum resultado em qualquer uma das listas
      setHasResults(hasFeaturedResults || hasRegularResults);
    }
  }, [searchTerm, featuredList, regularList, setHasResults]);
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-pulse text-center">
          <div className="h-8 w-48 bg-gray-300 rounded mx-auto mb-4"></div>
          <div className="h-4 w-64 bg-gray-200 rounded mx-auto"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`space-y-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
      <FeaturedSubscriptions 
        subscriptionRefs={subscriptionRefs} 
        searchTerm={searchTerm}
        setHasResults={setHasResults}
        subscriptionList={featuredList}
      />
      <RegularSubscriptions 
        searchTerm={searchTerm}
        setHasResults={setHasResults}
        subscriptionList={regularList}
      />
    </div>
  );
};

export default SubscriptionList;
