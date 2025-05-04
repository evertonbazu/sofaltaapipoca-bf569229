
import React, { useState, useEffect, useRef } from "react";
import SubscriptionList from "@/components/SubscriptionList";
import SearchBar from "@/components/SearchBar";
import NoResults from "@/components/NoResults";

const Index = () => {
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState("");
  const [hasResults, setHasResults] = useState(true);
  const subscriptionRefs = useRef<{[key: string]: HTMLDivElement | null}>({});
  
  // Update date/time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);
  
  const formattedDate = currentDateTime.toLocaleDateString("pt-BR");
  const formattedTime = currentDateTime.toLocaleTimeString("pt-BR", {
    hour: '2-digit',
    minute: '2-digit'
  });
  
  const version = "1.0.7";

  const handleSearch = (term: string) => {
    setSearchTerm(term.toLowerCase());
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-900 to-indigo-700 p-4">
      <div className="max-w-md mx-auto my-8 relative">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">🍿Só Falta a Pipoca</h1>
          <p className="text-indigo-100">Assinaturas premium com preços exclusivos</p>
          <div className="mt-6">
            <SearchBar onSearch={handleSearch} />
          </div>
        </header>

        {hasResults ? (
          <SubscriptionList 
            subscriptionRefs={subscriptionRefs} 
            searchTerm={searchTerm}
            setHasResults={setHasResults}
          />
        ) : (
          <NoResults />
        )}

        <footer className="mt-10 text-center text-indigo-100 text-sm">
          <p>Ofertas sujeitas a disponibilidade. Entre em contato para mais informações.</p>
          <p className="mt-2">Atualizado em: {formattedDate} às {formattedTime}</p>
          <p className="mt-1">Versão: {version}</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
