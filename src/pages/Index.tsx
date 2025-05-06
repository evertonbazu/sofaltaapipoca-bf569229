
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { SearchBar } from '@/components/SearchBar';
import { FeaturedSubscriptions } from '@/components/FeaturedSubscriptions';
import { RegularSubscriptions } from '@/components/RegularSubscriptions';
import { NoResults } from '@/components/NoResults';
import { useDebounced } from '@/hooks/useDebounced';
import { useAuth } from '@/hooks/use-auth';
import { Home, MessageCircle } from 'lucide-react';

const Index: React.FC = () => {
  const navigate = useNavigate();
  const { authState, signOut } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounced(searchTerm, 300);
  const [showNoResults, setShowNoResults] = useState(false);

  // Handle search logic
  useEffect(() => {
    if (debouncedSearchTerm) {
      // Show NoResults component after a delay to simulate search
      const timer = setTimeout(() => {
        setShowNoResults(true);
      }, 500);

      return () => clearTimeout(timer);
    } else {
      setShowNoResults(false);
    }
  }, [debouncedSearchTerm]);

  // Set document title
  useEffect(() => {
    document.title = '🍿 Só Falta a Pipoca | Os melhores anúncios de streaming';
  }, []);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  return (
    <div className="min-h-screen">
      {/* Header Navigation */}
      <div className="bg-slate-100 p-4 mb-6">
        <div className="container mx-auto flex flex-wrap justify-between items-center gap-4">
          <div className="flex gap-2">
            {authState.user ? (
              <>
                {authState.user.role === 'admin' && (
                  <Button className="flex items-center gap-2" onClick={() => navigate('/admin')}>
                    Admin
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2" 
                  onClick={() => signOut()}
                >
                  Sair
                </Button>
              </>
            ) : (
              <Button 
                onClick={() => navigate('/auth')} 
                variant="outline" 
                className="flex items-center gap-2"
              >
                Entrar
              </Button>
            )}
            <Button 
              variant="default" 
              className="flex items-center gap-2"
              onClick={() => navigate('/')}
            >
              <Home className="h-5 w-5" />
              Início
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4">
        {/* Site Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">🍿 Só Falta a Pipoca</h1>
          <p className="text-lg text-gray-600">Os melhores anúncios de streaming para você</p>
        </div>

        {/* Search Bar */}
        <SearchBar onSearch={handleSearch} />

        {/* Call to action buttons */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 my-6">
          <Button 
            className="w-full sm:w-auto min-w-[200px]" 
            onClick={() => navigate(authState.user ? '/admin/subscriptions/new' : '/auth')}
          >
            Cadastrar Anúncio
          </Button>
          <Button 
            variant="outline" 
            className="w-full sm:w-auto min-w-[200px]"
            onClick={() => window.open('https://t.me/Your_Username', '_blank')}
          >
            Fale Conosco
          </Button>
        </div>

        {/* Content */}
        {showNoResults ? (
          <NoResults searchTerm={debouncedSearchTerm} />
        ) : (
          <>
            {/* Featured Subscriptions */}
            <FeaturedSubscriptions />
            
            {/* Regular Subscriptions */}
            <RegularSubscriptions />
          </>
        )}
      </div>

      {/* Footer */}
      <footer className="mt-16 bg-gray-100 py-6">
        <div className="container mx-auto px-4 text-center">
          <p>© 2025 🍿 Só Falta a Pipoca - Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
