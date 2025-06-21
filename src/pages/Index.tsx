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
import { useSiteConfig } from "@/hooks/useSiteConfig";
import Footer from "@/components/Footer";

const Index: React.FC = () => {
  const {
    siteTitle,
    siteSubtitle,
    appVersion,
    contactWhatsapp
  } = useSiteConfig("3.0.9");
  const [searchTerm, setSearchTerm] = useState("");
  const [hasResults, setHasResults] = useState(true);

  const subscriptionRefs = useRef<{
    [key: string]: HTMLDivElement | null;
  }>({});

  const {
    authState
  } = useAuth();
  const isLoggedIn = !!authState.session;

  const handleSearch = (term: string) => {
    setSearchTerm(term.toLowerCase());
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
          <div className="mt-4">
            <HeaderButtonsDisplay />
          </div>
          <div className="flex gap-2 sm:gap-3 mx-auto max-w-xs sm:max-w-sm mt-4">
            <Link to="/contact" className="flex-1">
              
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-3 sm:px-4 py-5 sm:py-8">
        <FilterSearch onFilter={handleSearch} />
        {hasResults
          ? <SubscriptionList subscriptionRefs={subscriptionRefs} searchTerm={searchTerm} setHasResults={setHasResults} />
          : <NoResults searchTerm={searchTerm} />}
      </main>

      <Footer appVersion={appVersion} />
    </div>
  );
};

export default Index;
