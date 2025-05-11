
import React, { useState, useRef, useEffect } from "react";
import NavBar from "../components/NavBar";
import SearchBar from "../components/SearchBar";
import FilterSearch from "../components/FilterSearch";
import NoResults from "../components/NoResults";
import SubscriptionList from "../components/SubscriptionList";
import { Link } from "react-router-dom";
import { getAllHeaderButtons } from "@/services/subscription-service";
import { HeaderButton } from "@/types/subscriptionTypes";

const Index = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [hasResults, setHasResults] = useState(true);
  const [headerButtons, setHeaderButtons] = useState<HeaderButton[]>([]);
  
  // Create reference for subscription elements for smooth scrolling
  const subscriptionRefs = useRef<{[key: string]: HTMLDivElement | null}>({});
  
  useEffect(() => {
    const fetchHeaderButtons = async () => {
      try {
        const buttons = await getAllHeaderButtons();
        // Filter only visible buttons
        setHeaderButtons(buttons.filter((btn: HeaderButton) => btn.visible));
      } catch (error) {
        console.error("Erro ao buscar botões do cabeçalho:", error);
      }
    };
    
    fetchHeaderButtons();
  }, []);
  
  // Function for smooth scrolling to section
  const scrollToSection = (sectionTitle: string) => {
    if (subscriptionRefs.current[sectionTitle]) {
      subscriptionRefs.current[sectionTitle]?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-700 to-purple-700 text-white py-10 md:py-24">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-5xl font-bold mb-4 text-center">
            Gerencie suas assinaturas.
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-center">
            Encontre, organize e acompanhe todas as suas assinaturas em um só lugar.
          </p>
          
          <div className="flex flex-col md:flex-row justify-center gap-4 items-center mb-8">
            <SearchBar 
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
            />
            <FilterSearch 
              onCategoryClick={scrollToSection}
            />
          </div>
          
          <div className="flex flex-wrap justify-center gap-2 md:gap-4">
            {/* Dynamically generated header buttons from database */}
            {headerButtons.map(button => {
              const icon = button.icon;
              const isExternal = button.url.startsWith('http');
              
              if (isExternal) {
                return (
                  <a 
                    key={button.id}
                    href={button.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white text-blue-700 hover:bg-blue-50 font-medium rounded-full px-6 py-3 flex items-center gap-2 transition-colors"
                  >
                    <span className="text-xl">{icon}</span>
                    {button.title}
                  </a>
                );
              } else {
                return (
                  <Link 
                    key={button.id}
                    to={button.url}
                    className="bg-white text-blue-700 hover:bg-blue-50 font-medium rounded-full px-6 py-3 flex items-center gap-2 transition-colors"
                  >
                    <span className="text-xl">{icon}</span>
                    {button.title}
                  </Link>
                );
              }
            })}
            
            {/* Submit subscription button */}
            <Link 
              to="/submit-subscription" 
              className="bg-green-600 text-white hover:bg-green-700 font-medium rounded-full px-6 py-3 flex items-center gap-2 transition-colors"
            >
              <span className="text-xl">➕</span>
              Submeter Assinatura
            </Link>
          </div>
        </div>
      </div>
      
      {/* Subscription list */}
      <div className="container mx-auto px-4 py-8">
        {/* Show list or no results message */}
        {hasResults ? (
          <SubscriptionList 
            subscriptionRefs={subscriptionRefs} 
            searchTerm={searchTerm}
            setHasResults={setHasResults}
          />
        ) : (
          <NoResults searchTerm={searchTerm} />
        )}
      </div>
      
      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm">
            &copy; {new Date().getFullYear()} Sistema de Gerenciamento de Assinaturas. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
