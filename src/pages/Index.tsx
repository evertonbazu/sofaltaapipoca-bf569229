
import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SearchBar from '@/components/SearchBar';
import SubscriptionList from '@/components/SubscriptionList';
import NoResults from '@/components/NoResults';
import { MessageSquare, Megaphone, User, Settings } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const Index: React.FC = () => {
  const { authState, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [hasResults, setHasResults] = useState(true);
  const [isImporting, setIsImporting] = useState(false);
  const subscriptionRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const handleSearch = (term: string) => {
    setSearchTerm(term.toLowerCase());
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const importSubscriptions = async () => {
    if (!authState.user || !isAdmin()) return;
    
    try {
      setIsImporting(true);
      
      const { data, error } = await supabase.functions.invoke('import-subscriptions');
      
      if (error) throw error;
      
      toast({
        title: "Anúncios importados",
        description: "Os anúncios foram importados com sucesso!"
      });

      // Force page reload to show new data
      window.location.reload();
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Erro ao importar anúncios",
        description: err.message || "Ocorreu um erro ao importar os anúncios."
      });
    } finally {
      setIsImporting(false);
    }
  };

  // Get current date and time formatted for display
  const getCurrentDateTime = () => {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return now.toLocaleDateString('pt-BR', options);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-gradient-indigo text-white py-4 sm:py-6">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl sm:text-3xl font-bold">🍿 Só Falta a Pipoca</h1>
            <div className="flex gap-2">
              {authState.user ? (
                <div className="flex gap-2">
                  {isAdmin() && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="bg-white/20 text-white border-white/40 hover:bg-white/30"
                      onClick={() => navigate('/admin')}
                    >
                      <Settings className="h-4 w-4 mr-1" />
                      Admin
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    className="bg-white/20 text-white border-white/40 hover:bg-white/30"
                    onClick={handleSignOut}
                  >
                    <User className="h-4 w-4 mr-1" />
                    Sair
                  </Button>
                </div>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  className="bg-white/20 text-white border-white/40 hover:bg-white/30"
                  onClick={() => navigate('/auth')}
                >
                  <User className="h-4 w-4 mr-1" />
                  Entrar
                </Button>
              )}
            </div>
          </div>
          <p className="text-center text-base sm:text-lg mt-1">Assinaturas premium com preços exclusivos</p>
          
          {/* Botões de Anunciar e Fale Conosco */}
          <div className="flex gap-2 sm:gap-3 mx-auto max-w-xs sm:max-w-sm mt-4">
            <a 
              href="https://docs.google.com/forms/d/e/1FAIpQLSevzfyGAMn0eIadvblubVIj1XuLVamMkq4TUFlAgqyQbjDfcw/viewform" 
              target="_blank"
              className="flex-1 flex flex-col items-center justify-center bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-medium py-2 px-3 transition-all duration-200 hover:-translate-y-1"
            >
              <Megaphone className="h-5 w-5 mb-1" />
              <span className="text-xs sm:text-sm">Quer anunciar aqui?</span>
            </a>
            <a 
              href="https://wa.me/5513992077804" 
              target="_blank"
              className="flex-1 flex flex-col items-center justify-center bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium py-2 px-3 transition-all duration-200 hover:-translate-y-1"
            >
              <MessageSquare className="h-5 w-5 mb-1" />
              <span className="text-xs sm:text-sm">Fale Conosco</span>
            </a>
          </div>
          
          {authState.user && isAdmin() && (
            <div className="mt-4 flex justify-center">
              <Button
                size="sm"
                variant="outline"
                className="bg-white/20 text-white border-white/40 hover:bg-white/30"
                onClick={importSubscriptions}
                disabled={isImporting}
              >
                {isImporting ? 'Importando...' : 'Importar Anúncios'}
              </Button>
            </div>
          )}
        </div>
      </header>

      <main className="container mx-auto px-3 sm:px-4 py-5 sm:py-8">
        <SearchBar onSearch={handleSearch} />
        
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
          <p className="text-xs text-gray-400 mt-1">v1.1.1 • Atualizado em: {getCurrentDateTime()}</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
