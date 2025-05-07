import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SearchBar from '@/components/SearchBar';
import SubscriptionList from '@/components/SubscriptionList';
import NoResults from '@/components/NoResults';
import { MessageSquare, Megaphone, User, Settings, Home, Plus, UserCircle } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { supabase, importSampleSubscriptions } from '@/integrations/supabase/client';
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
      
      // Get existing subscriptions to avoid importing duplicates
      const { data: existingSubs } = await supabase
        .from('subscriptions')
        .select('title, telegram_username');
        
      const existingMap = new Map();
      if (existingSubs) {
        existingSubs.forEach((sub: any) => {
          const key = `${sub.title}-${sub.telegram_username}`.toLowerCase();
          existingMap.set(key, true);
        });
      }
      
      // Use a função local em vez da Edge Function
      const subscriptions = await importSampleSubscriptions();
      
      // Filter out subscriptions that already exist
      const newSubs = subscriptions.filter((sub: any) => {
        const key = `${sub.title}-${sub.telegram_username}`.toLowerCase();
        return !existingMap.has(key);
      });
      
      if (newSubs.length === 0) {
        toast({
          title: "Nenhum anúncio novo",
          description: "Todos os anúncios já estão importados."
        });
        return;
      }
      
      // Insert new subscriptions one by one
      for (const sub of newSubs) {
        // Generate a unique code for each subscription
        const code = 'SF' + Math.floor(1000 + Math.random() * 9000).toString();
        
        // Add code to the subscription
        const subWithCode = {
          ...sub,
          code: code
        };
        
        // Insert the subscription
        const { error: insertError } = await supabase
          .from('subscriptions')
          .insert(subWithCode);
          
        if (insertError) throw insertError;
      }
      
      toast({
        title: "Anúncios importados",
        description: `${newSubs.length} novos anúncios foram importados com sucesso!`
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
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-3 sm:px-4 py-2">
          <div className="flex justify-between items-center">
            <Button 
              variant="ghost" 
              className="font-medium px-3"
              onClick={() => navigate('/')}
            >
              <Home className="h-4 w-4 mr-2" /> 
              Início
            </Button>
            <div className="flex gap-2">
              {authState.user ? (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate('/profile')}
                  >
                    <UserCircle className="h-4 w-4 mr-1" />
                    Meu Perfil
                  </Button>
                  {isAdmin() && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate('/admin')}
                    >
                      <Settings className="h-4 w-4 mr-1" />
                      Admin
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleSignOut}
                  >
                    <User className="h-4 w-4 mr-1" />
                    Sair
                  </Button>
                </>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigate('/auth')}
                >
                  <User className="h-4 w-4 mr-1" />
                  Entrar
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <header className="bg-gradient-indigo text-white py-4 sm:py-6">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="flex justify-center items-center mb-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-center">🍿 Só Falta a Pipoca</h1>
          </div>
          <p className="text-center text-base sm:text-lg mt-1">Assinaturas premium com preços exclusivos</p>
          
          {/* Botões de Anunciar e Fale Conosco */}
          <div className="flex gap-2 sm:gap-3 mx-auto max-w-xs sm:max-w-sm mt-4">
            {authState.user ? (
              <Button
                className="flex-1 flex flex-col items-center justify-center h-16 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-medium py-2 px-3 transition-all duration-200 hover:-translate-y-1"
                onClick={() => navigate('/new')}
              >
                <Plus className="h-5 w-5 mb-1" />
                <span className="text-xs sm:text-sm">Cadastrar Anúncio</span>
              </Button>
            ) : (
              <Button
                variant="default" 
                onClick={() => navigate('/auth')}
                className="flex-1 flex flex-col items-center justify-center h-16 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-medium py-2 px-3 transition-all duration-200 hover:-translate-y-1"
              >
                <Megaphone className="h-5 w-5 mb-1" />
                <span className="text-xs sm:text-sm">Cadastre-se para Anunciar</span>
              </Button>
            )}
            <a 
              href="https://wa.me/5513992077804" 
              target="_blank"
              className="flex-1 flex flex-col items-center justify-center h-16 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium py-2 px-3 transition-all duration-200 hover:-translate-y-1"
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
          <p className="text-xs text-gray-400 mt-1">v1.3.0 • Atualizado em: {getCurrentDateTime()}</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
