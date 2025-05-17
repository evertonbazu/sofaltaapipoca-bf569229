
import React, { useEffect, useState } from "react";
import FeaturedSubscriptions from "./FeaturedSubscriptions";
import RegularSubscriptions from "./RegularSubscriptions";
import MemberSubscriptions from "./MemberSubscriptions";
import { SubscriptionData } from "@/types/subscriptionTypes";
import { getAllSubscriptions, getFeaturedSubscriptions, getMemberSubscriptions } from "@/services/subscription-service";
interface SubscriptionListProps {
  subscriptionRefs: React.MutableRefObject<{
    [key: string]: HTMLDivElement | null;
  }>;
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
  const [memberSubmissionsList, setMemberSubmissionsList] = useState<SubscriptionData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Buscar assinaturas do banco de dados
  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        setIsLoading(true);
        const featured = await getFeaturedSubscriptions();
        const all = await getAllSubscriptions();

        // Get all visible member submissions
        const memberSubmissions = await getMemberSubscriptions();

        // Filtrar assinaturas regulares (todas exceto as destacadas)
        const regular = all.filter(sub => !sub.featured && !sub.isMemberSubmission);
        setFeaturedList(featured);
        setRegularList(regular);
        setMemberSubmissionsList(memberSubmissions);
      } catch (error) {
        console.error("Erro ao buscar assinaturas:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSubscriptions();
  }, []);
  useEffect(() => {
    // Verificar resultados da busca para todas as listas
    const lowercaseSearchTerm = searchTerm.toLowerCase();
    const hasFeaturedResults = featuredList.some(sub => {
      const content = `${sub.title} ${sub.price} ${sub.paymentMethod} ${sub.status} ${sub.access}`.toLowerCase();
      return content.includes(lowercaseSearchTerm);
    });
    const hasRegularResults = regularList.some(sub => {
      const content = `${sub.title} ${sub.price} ${sub.paymentMethod} ${sub.status} ${sub.access}`.toLowerCase();
      return content.includes(lowercaseSearchTerm);
    });
    const hasMemberSubmissionResults = memberSubmissionsList.some(sub => {
      const content = `${sub.title} ${sub.price} ${sub.paymentMethod} ${sub.status} ${sub.access}`.toLowerCase();
      return content.includes(lowercaseSearchTerm);
    });

    // Se o termo de busca estiver vazio, sempre mostra resultados
    if (searchTerm === "") {
      setHasResults(true);
    } else {
      // Caso contrário, verifica se há algum resultado em qualquer uma das listas
      setHasResults(hasFeaturedResults || hasRegularResults || hasMemberSubmissionResults);
    }
  }, [searchTerm, featuredList, regularList, memberSubmissionsList, setHasResults]);
  if (isLoading) {
    return <div className="flex justify-center items-center p-8">
        <div className="animate-pulse text-center">
          <div className="h-8 w-48 bg-gray-300 rounded mx-auto mb-4"></div>
          <div className="h-4 w-64 bg-gray-200 rounded mx-auto"></div>
        </div>
      </div>;
  }
  return <div className="space-y-6">
      <FeaturedSubscriptions subscriptionRefs={subscriptionRefs} searchTerm={searchTerm} setHasResults={setHasResults} subscriptionList={featuredList} />
      
      {memberSubmissionsList.length > 0 && <div className="mb-6">
          <h2 className="mb-3 text-2xl font-bold text-center">Assinaturas enviadas por Membros do &quot;🍿Só Falta a Pipoca&quot;</h2>
          <MemberSubscriptions searchTerm={searchTerm} setHasResults={setHasResults} subscriptionList={memberSubmissionsList} />
        </div>}
      
      <RegularSubscriptions searchTerm={searchTerm} setHasResults={setHasResults} subscriptionList={regularList} />
    </div>;
};
export default SubscriptionList;
