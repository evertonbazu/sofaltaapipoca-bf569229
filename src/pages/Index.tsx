
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import SubscriptionList from '@/components/SubscriptionList';
import NoResults from '@/components/NoResults';
import { MessageSquare, Megaphone, User, LucideIcon } from 'lucide-react';
import NavBar from '@/components/NavBar';
import FilterSearch from '@/components/FilterSearch';
import { supabase } from '@/integrations/supabase/client';
import { HeaderButton } from '@/types/subscriptionTypes';
import * as LucideIcons from 'lucide-react';

const Index: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [hasResults, setHasResults] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [headerButtons, setHeaderButtons] = useState<HeaderButton[]>([]);
  const subscriptionRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const appVersion = "2.1.0"; // Versão do aplicativo

  // Verificar se o usuário está logado
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);
    };
    
    checkAuth();
    
    // Configurar listener para mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
    });
    
    return () => subscription.unsubscribe();
  }, []);

  // Carregar botões do cabeçalho
  useEffect(() => {
    const fetchHeaderButtons = async () => {
      try {
        const { data, error } = await supabase
          .from('header_buttons')
          .select('*')
          .eq('visible', true)
          .order('position', { ascending: true });
        
        if (error) throw error;
        setHeaderButtons(data || []);
      } catch (error) {
        console.error('Erro ao buscar botões do cabeçalho:', error);
      }
    };
    
    fetchHeaderButtons();
  }, []);

  const handleSearch = (term: string) => {
    setSearchTerm(term.toLowerCase());
    // Make sure we show all results when search is cleared
    if (!term) {
      setHasResults(true);
    }
  };

  // Função para renderizar o ícone com base no nome
  const renderIcon = (iconName: string) => {
    // @ts-ignore - O tipo do LucideIcons não consegue capturar todas as possibilidades
    const Icon: LucideIcon = LucideIcons[iconName] || LucideIcons.Bookmark;
    return <Icon className="h-5 w-5 mb-1" />;
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <NavBar />
      
      <header className="bg-gradient-to-r from-indigo-600 to-indigo-800 text-white py-4 sm:py-6">
        <div className="container mx-auto px-3 sm:px-4">
          <h1 className="text-center text-xl sm:text-2xl font-bold mb-1">🍿 Só Falta a Pipoca</h1>
          <p className="text-center text-base sm:text-lg mt-2">Assinaturas premium com preços exclusivos</p>
          
          {/* Botões dinâmicos do cabeçalho */}
          <div className="flex gap-2 sm:gap-3 mx-auto max-w-xs sm:max-w-sm mt-4 flex-wrap justify-center">
            {headerButtons.map((button) => (
              <Link 
                key={button.id}
                to={button.url.startsWith('/') ? button.url : ''} 
                href={!button.url.startsWith('/') ? button.url : undefined}
                target={!button.url.startsWith('/') ? "_blank" : undefined}
                rel={!button.url.startsWith('/') ? "noreferrer" : undefined}
                className="flex-1 min-w-[100px] flex flex-col items-center justify-center bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-medium py-2 px-3 transition-all duration-200 hover:-translate-y-1"
              >
                {renderIcon(button.icon)}
                <span className="text-xs sm:text-sm">{button.title}</span>
              </Link>
            ))}
            
            {/* Botão do perfil só aparece quando logado */}
            {isLoggedIn && (
              <Link 
                to="/profile"
                className="flex-1 min-w-[100px] flex flex-col items-center justify-center bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium py-2 px-3 transition-all duration-200 hover:-translate-y-1"
              >
                <User className="h-5 w-5 mb-1" />
                <span className="text-xs sm:text-sm">Meu Perfil</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-3 sm:px-4 py-5 sm:py-8">
        <FilterSearch onFilter={handleSearch} />
        
        {hasResults ? (
          <SubscriptionList 
            subscriptionRefs={subscriptionRefs} 
            searchTerm={searchTerm}
            setHasResults={setHasResults}
          />
        ) : (
          <NoResults />
        )}
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
