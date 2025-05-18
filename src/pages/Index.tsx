import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import SubscriptionList from '@/components/SubscriptionList';
import NoResults from '@/components/NoResults';
import { MessageSquare, Megaphone, User } from 'lucide-react';
import NavBar from '@/components/NavBar';
import FilterSearch from '@/components/FilterSearch';
import HeaderButtonsDisplay from '@/components/HeaderButtonsDisplay';
import { supabase } from '@/integrations/supabase/client';
import { getSiteConfig } from '@/services/subscription-service';
import { useAuth } from '@/contexts/AuthContext';
import { APP_VERSION } from '@/utils/shareUtils';

const Index: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [hasResults, setHasResults] = useState(true);
  const [siteTitle, setSiteTitle] = useState("🍿 Só Falta a Pipoca");
  const [siteSubtitle, setSiteSubtitle] = useState("Assinaturas premium com preços exclusivos");
  const [appVersion, setAppVersion] = useState(APP_VERSION); // Use version directly from shareUtils
  const [contactWhatsapp, setContactWhatsapp] = useState("5513992077804");
  const subscriptionRefs = useRef<{
    [key: string]: HTMLDivElement | null;
  }>({});
  const { authState } = useAuth();
  const isLoggedIn = !!authState.session;

  // Carregar configurações do site
  useEffect(() => {
    const loadSiteConfig = async () => {
      try {
        const title = await getSiteConfig('site_title');
        const subtitle = await getSiteConfig('site_subtitle');
        const version = await getSiteConfig('app_version');
        const whatsapp = await getSiteConfig('contact_whatsapp');
        if (title) setSiteTitle(title);
        if (subtitle) setSiteSubtitle(subtitle);
        // If version is not set in the database, or doesn't match current app version, use the current app version
        setAppVersion(version || APP_VERSION);
        if (whatsapp) setContactWhatsapp(whatsapp);
      } catch (error) {
        console.error('Erro ao carregar configurações do site:', error);
        // In case of error, use the current app version from shareUtils
        setAppVersion(APP_VERSION);
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
          
          {/* Botões fixos de Anunciar e Fale Conosco */}
          <div className="flex gap-2 sm:gap-3 mx-auto max-w-xs sm:max-w-sm mt-4">
            
            
            
            
            {isLoggedIn}
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
