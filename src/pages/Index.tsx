
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import SearchBar from '@/components/SearchBar';
import NoResults from '@/components/NoResults';
import FeaturedSubscriptions from '@/components/FeaturedSubscriptions';
import RegularSubscriptions from '@/components/RegularSubscriptions';
import { Button } from '@/components/ui/button';
import { useDebounced } from '@/hooks/useDebounced';

const Index = () => {
  const navigate = useNavigate();
  const { authState } = useAuth();
  
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounced(searchTerm, 300);
  const [showResults, setShowResults] = useState(true);
  const [showNoResults, setShowNoResults] = useState(false);

  const navigateToAuth = () => {
    navigate('/auth');
  };
  
  const navigateToAdmin = () => {
    navigate('/admin');
  };

  const handleNoResults = (hasResults: boolean) => {
    setShowNoResults(!hasResults);
    setShowResults(hasResults);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero section */}
      <div className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
              Só Falta a Pipoca
            </h1>
            <p className="text-lg sm:text-xl mb-8">
              Encontre e compartilhe serviços de assinatura para qualquer ocasião.
              Todos os seus streamings favoritos em um só lugar.
            </p>
            
            {/* Search bar */}
            <div className="w-full max-w-lg mt-6">
              <SearchBar 
                searchTerm={searchTerm} 
                setSearchTerm={handleSearchChange} 
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          {/* User greeting */}
          <div>
            {authState.user ? (
              <h2 className="text-xl font-semibold">
                Olá, {authState.user.username || authState.user.id}!
              </h2>
            ) : (
              <h2 className="text-xl font-semibold">
                Bem-vindo à Só Falta a Pipoca
              </h2>
            )}
          </div>
          
          {/* Action buttons */}
          <div className="flex gap-3">
            {authState.user ? (
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
                Entrar
              </Button>
            )}
          </div>
        </div>
        
        {/* Featured subscriptions */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Destaques</h2>
          <FeaturedSubscriptions searchTerm={debouncedSearchTerm} />
        </div>
        
        {/* Show no results message if search returns nothing */}
        {showNoResults ? (
          <NoResults searchTerm={debouncedSearchTerm} />
        ) : (
          <>
            <SubscriptionList 
              searchTerm={debouncedSearchTerm} 
              onResultsChange={handleNoResults}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default Index;

