
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import SearchBar from '@/components/SearchBar';
import NoResults from '@/components/NoResults';
import SubscriptionList from '@/components/SubscriptionList';
import { useDebounced } from "@/hooks/useDebounced";
import { useAuth } from "@/hooks/use-auth";

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounced(searchTerm, 300);
  const [showNoResults, setShowNoResults] = useState(false);
  const [hasResults, setHasResults] = useState(true);
  const subscriptionRefs = useRef<{[key: string]: HTMLDivElement | null}>({});

  // Handle search logic
  useEffect(() => {
    if (debouncedSearchTerm) {
      setShowNoResults(!hasResults);
    } else {
      setShowNoResults(false);
    }
  }, [debouncedSearchTerm, hasResults]);
  
  // Handle navigation to admin panel
  const navigateToAdmin = () => {
    navigate('/admin');
  };
  
  // Handle navigation to auth page for login/registration
  const navigateToAuth = () => {
    navigate('/auth');
  };
  
  // Handle navigation to contact
  const navigateToContact = () => {
    navigate('/contact');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-6 sm:py-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-2 sm:mb-4">
              Plataforma de Assinaturas
            </h1>
            <p className="text-lg sm:text-xl text-center">
              🍿 Só Falta a Pipoca
            </p>
            
            {/* Search bar */}
            <div className="w-full max-w-lg mt-6">
              <SearchBar 
                searchTerm={searchTerm} 
                setSearchTerm={setSearchTerm} 
              />
            </div>
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          {/* User greeting */}
          <div>
            {user ? (
              <h2 className="text-xl font-semibold">
                Olá, {user.email}!
              </h2>
            ) : (
              <h2 className="text-xl font-semibold">
                Confira nossas assinaturas
              </h2>
            )}
          </div>
          
          {/* Action buttons */}
          <div className="flex gap-3">
            {user ? (
              <Button
                onClick={navigateToAdmin}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 sm:w-40"
              >
                Painel Admin
              </Button>
            ) : (
              <Button
                onClick={navigateToAuth}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 sm:w-40"
              >
                Cadastrar Anúncio
              </Button>
            )}
            <Button
              onClick={navigateToContact}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 sm:w-40"
            >
              Fale Conosco
            </Button>
          </div>
        </div>
        
        {/* Show no results message if search returns nothing */}
        {showNoResults ? (
          <NoResults searchTerm={debouncedSearchTerm} />
        ) : (
          <>
            <SubscriptionList 
              subscriptionRefs={subscriptionRefs} 
              searchTerm={searchTerm}
              setHasResults={setHasResults}
            />
          </>
        )}
      </main>
      
      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between">
            <div className="mb-6 md:mb-0">
              <h3 className="text-xl font-semibold mb-2">Plataforma de Assinaturas</h3>
              <p>🍿 Só Falta a Pipoca - Todas as assinaturas em um só lugar.</p>
            </div>
            <div>
              <h4 className="text-lg font-medium mb-2">Links Úteis</h4>
              <ul>
                <li className="mb-1"><a href="#" className="hover:text-blue-300">Termos de Uso</a></li>
                <li className="mb-1"><a href="#" className="hover:text-blue-300">Política de Privacidade</a></li>
                <li><a href="#" className="hover:text-blue-300">Perguntas Frequentes</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-6 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} Plataforma de Assinaturas. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
