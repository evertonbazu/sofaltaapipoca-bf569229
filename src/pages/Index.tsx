import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import SubscriptionList from '@/components/SubscriptionList';
import NoResults from '@/components/NoResults';
import NavBar from '@/components/NavBar';
import FilterSearch from '@/components/FilterSearch';
import HeaderButtonsDisplay from '@/components/HeaderButtonsDisplay';
import { supabase } from '@/integrations/supabase/client';
import { getSiteConfig } from '@/services/subscription-service';
import { useAuth } from '@/contexts/AuthContext';
import { APP_VERSION } from '@/utils/shareUtils';
import { User, MessageCircle, Plus } from 'lucide-react';
import { Button } from "@/components/ui/button";

const Index: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [hasResults, setHasResults] = useState(true);
  const [siteTitle, setSiteTitle] = useState("🍿 Só Falta a Pipoca");
  const [siteSubtitle, setSiteSubtitle] = useState("Assinaturas premium com preços exclusivos");
  const [appVersion, setAppVersion] = useState("3.0.9");
  const [contactWhatsapp, setContactWhatsapp] = useState("5513992077804");
  const subscriptionRefs = useRef<{
    [key: string]: HTMLDivElement | null;
  }>({});
  const {
    authState
  } = useAuth();
  const isLoggedIn = !!authState.session;

  useEffect(() => {
    const loadSiteConfig = async () => {
      try {
        const title = await getSiteConfig('site_title');
        const subtitle = await getSiteConfig('site_subtitle');
        const whatsapp = await getSiteConfig('contact_whatsapp');
        const configVersion = await getSiteConfig('app_version');
        
        if (title) setSiteTitle(title);
        if (subtitle) setSiteSubtitle(subtitle);
        if (whatsapp) setContactWhatsapp(whatsapp);

        // Força a versão a ser sempre 3.0.9 no rodapé
        setAppVersion("3.0.9");
        // Removido o update em banco para não sobrescrever globalmente neste momento
        
        console.log(`App version set to 3.0.9`);
      } catch (error) {
        console.error('Erro ao carregar configurações do site:', error);
        setAppVersion("3.0.9");
      }
    };
    loadSiteConfig();
  }, []);

  const handleSearch = (term: string) => {
    setSearchTerm(term.toLowerCase());
    // Make sure we show all results when search is cleared
    if (!term) {
      setHasResults(true);
    }
  };

  return <div className="min-h-screen bg-gray-100">
      <NavBar />
      
      <header className="bg-gradient-to-r from-indigo-600 to-indigo-800 text-white py-4 sm:py-6">
        <div className="container mx-auto px-3 sm:px-4">
          <h1 className="text-center text-xl sm:text-2xl font-bold mb-1">{siteTitle}</h1>
          <p className="text-center text-base sm:text-lg mt-2">{siteSubtitle}</p>
          
          {/* Botões do cabeçalho dinâmicos */}
          <div className="mt-4">
            <HeaderButtonsDisplay />
          </div>
          
          {/* Botões fixos */}
          <div className="flex gap-2 sm:gap-3 mx-auto max-w-xs sm:max-w-sm mt-4">
            <Link to="/contact" className="flex-1">
              
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-3 sm:px-4 py-5 sm:py-8">
        <FilterSearch onFilter={handleSearch} />
        
        {hasResults ? <SubscriptionList subscriptionRefs={subscriptionRefs} searchTerm={searchTerm} setHasResults={setHasResults} /> : <NoResults searchTerm={searchTerm} />}
      </main>

      <footer className="bg-gray-800 text-white py-3 sm:py-4">
        <div className="container mx-auto px-3 sm:px-4 text-center">
          <p className="text-sm sm:text-base">&copy; 2025 Só Falta a Pipoca. Todos os direitos reservados.</p>
          <p className="text-xs text-gray-400 mt-1">v{appVersion}</p>
        </div>
      </footer>
    </div>;
};

export default Index;
