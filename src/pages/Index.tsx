
import React, { useState, useRef } from 'react';
import SearchBar from '@/components/SearchBar';
import SubscriptionList from '@/components/SubscriptionList';
import NoResults from '@/components/NoResults';
import { MessageSquare, Megaphone } from 'lucide-react';

const Index: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [hasResults, setHasResults] = useState(true);
  const subscriptionRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const handleSearch = (term: string) => {
    setSearchTerm(term.toLowerCase());
    // Make sure we show all results when search is cleared
    if (!term) {
      setHasResults(true);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-gradient-indigo text-white py-4 sm:py-6">
        <div className="container mx-auto px-3 sm:px-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-center">🍿 Só Falta a Pipoca</h1>
          <p className="text-center text-base sm:text-lg mt-2">Assinaturas premium com preços exclusivos</p>
          
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
          <p className="text-xs text-gray-400 mt-1">v1.1.2</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
