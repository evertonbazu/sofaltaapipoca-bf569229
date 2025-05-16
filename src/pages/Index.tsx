
import React from 'react';
import { Link } from 'react-router-dom';
import SubscriptionList from '@/components/SubscriptionList';
import NoResults from '@/components/NoResults';
import { MessageSquare, Megaphone, User } from 'lucide-react';
import NavBar from '@/components/NavBar';
import FilterSearch from '@/components/FilterSearch';
import HeaderButtonsDisplay from '@/components/HeaderButtonsDisplay';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const Index: React.FC = () => {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [hasResults, setHasResults] = React.useState(true);
  const [siteTitle, setSiteTitle] = React.useState("🍿 Só Falta a Pipoca");
  const [siteSubtitle, setSiteSubtitle] = React.useState("Assinaturas premium com preços exclusivos");
  const [appVersion, setAppVersion] = React.useState("2.1.2");
  const [contactWhatsapp, setContactWhatsapp] = React.useState("5513992077804");
  const subscriptionRefs = React.useRef<{
    [key: string]: HTMLDivElement | null;
  }>({});
  const { authState } = useAuth();
  const isLoggedIn = !!authState.session;

  // Carregar configurações do site
  React.useEffect(() => {
    const loadSiteConfig = async () => {
      try {
        const { data: titleData } = await supabase
          .from('site_configurations')
          .select('*')
          .eq('key', 'site_title')
          .single();
        
        const { data: subtitleData } = await supabase
          .from('site_configurations')
          .select('*')
          .eq('key', 'site_subtitle')
          .single();
        
        const { data: versionData } = await supabase
          .from('site_configurations')
          .select('*')
          .eq('key', 'app_version')
          .single();
        
        const { data: whatsappData } = await supabase
          .from('site_configurations')
          .select('*')
          .eq('key', 'contact_whatsapp')
          .single();
        
        if (titleData?.value) setSiteTitle(titleData.value);
        if (subtitleData?.value) setSiteSubtitle(subtitleData.value);
        if (versionData?.value) setAppVersion(versionData.value);
        if (whatsappData?.value) setContactWhatsapp(whatsappData.value);
      } catch (error) {
        console.error('Erro ao carregar configurações do site:', error);
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
  
  return (
    <div className="min-h-screen bg-gray-100">
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
            {/* Add contact button */}
            <Link to="/form_contato" className="flex-1">
              <button className="w-full bg-white hover:bg-gray-100 text-indigo-700 font-medium py-2 px-4 rounded-lg flex items-center justify-center">
                <MessageSquare size={18} className="mr-2" />
                <span>Fale Conosco</span>
              </button>
            </Link>

            <Link to="/submit-subscription" className="flex-1">
              <button className="w-full bg-white hover:bg-gray-100 text-indigo-700 font-medium py-2 px-4 rounded-lg flex items-center justify-center">
                <Megaphone size={18} className="mr-2" />
                <span>Anunciar</span>
              </button>
            </Link>

            {isLoggedIn ? (
              <Link to="/profile" className="flex-1">
                <button className="w-full bg-white hover:bg-gray-100 text-indigo-700 font-medium py-2 px-4 rounded-lg flex items-center justify-center">
                  <User size={18} className="mr-2" />
                  <span>Perfil</span>
                </button>
              </Link>
            ) : (
              <Link to="/auth" className="flex-1">
                <button className="w-full bg-white hover:bg-gray-100 text-indigo-700 font-medium py-2 px-4 rounded-lg flex items-center justify-center">
                  <User size={18} className="mr-2" />
                  <span>Entrar</span>
                </button>
              </Link>
            )}
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
    </div>
  );
};

export default Index;
