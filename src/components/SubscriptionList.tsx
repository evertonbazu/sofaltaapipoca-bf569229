
import React, { useEffect, useState } from "react";
import FeaturedSubscriptions from "./FeaturedSubscriptions";
import RegularSubscriptions from "./RegularSubscriptions";
import { SubscriptionData, PendingSubscriptionData } from "@/types/subscriptionTypes";
import { getAllSubscriptions, getFeaturedSubscriptions, getPendingSubscriptions } from "@/services/subscription-service";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

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
  const [featuredList, setFeaturedList] = useState<SubscriptionData[]>([]);
  const [regularList, setRegularList] = useState<SubscriptionData[]>([]);
  const [pendingList, setPendingList] = useState<PendingSubscriptionData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { authState } = useAuth();
  
  // Buscar assinaturas do banco de dados
  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        setIsLoading(true);
        const featured = await getFeaturedSubscriptions();
        const all = await getAllSubscriptions();
        const pending = await getPendingSubscriptions();
        
        // Filtrar assinaturas regulares (todas exceto as destacadas)
        const regular = all.filter(sub => !sub.featured);
        
        // Transformar assinaturas pendentes para o formato de SubscriptionData
        const pendingSubscriptions = pending
          .filter(sub => sub.statusApproval === 'pending')
          .map(sub => ({
            ...sub,
            title: `${sub.title} *`,  // Adicionar asterisco para indicar que é uma submissão de membro
            status: "Assinado",
            isUserSubmission: true
          }));
        
        setFeaturedList(featured);
        setRegularList([...regular, ...pendingSubscriptions]);
        setPendingList(pendingSubscriptions);
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
    const lowercaseSearchTerm = searchTerm.toLowerCase();
    
    const hasFeaturedResults = featuredList.some(sub => {
      const content = `${sub.title} ${sub.price} ${sub.paymentMethod} ${sub.status} ${sub.access}`.toLowerCase();
      return content.includes(lowercaseSearchTerm);
    });
    
    const hasRegularResults = regularList.some(sub => {
      const content = `${sub.title} ${sub.price} ${sub.paymentMethod} ${sub.status} ${sub.access}`.toLowerCase();
      return content.includes(lowercaseSearchTerm);
    });
    
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
    <div className="space-y-6">
      <FeaturedSubscriptions 
        subscriptionRefs={subscriptionRefs} 
        searchTerm={searchTerm}
        setHasResults={setHasResults}
        subscriptionList={featuredList}
        isAdmin={authState.isAdmin}
      />
      <RegularSubscriptions 
        searchTerm={searchTerm}
        setHasResults={setHasResults}
        subscriptionList={regularList}
        isAdmin={authState.isAdmin}
      />
    </div>
  );
};

export default SubscriptionList;
