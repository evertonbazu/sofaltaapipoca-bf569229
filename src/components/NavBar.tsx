import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Search, User, Menu, X } from 'lucide-react';
import { useDebounced } from '@/hooks/useDebounced';
import { useIsMobile } from '@/hooks/use-mobile';
import { supabase } from '@/integrations/supabase/client';

const NavBar: React.FC = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const isMobile = useIsMobile();

  // Verificar se o usuário está logado e se é administrador
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setIsLoggedIn(!!session);
        
        if (session) {
          const { data: isAdminData, error } = await supabase.rpc('is_admin');
          if (error) throw error;
          setIsAdmin(!!isAdminData);
        } else {
          setIsAdmin(false);
        }
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        setIsAdmin(false);
      }
    };
    
    checkAuth();
    
    // Configurar listener para mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
      if (!session) setIsAdmin(false);
    });
    
    return () => subscription.unsubscribe();
  }, []);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center">
          <Link to="/" className="text-xl font-bold text-indigo-600">
            🍿 Só Falta a Pipoca
          </Link>
        </div>
        
        {/* Menu hamburguer para mobile */}
        {isMobile ? (
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMenu}
              className="p-2"
            >
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </Button>
          </div>
        ) : (
          <div className="flex items-center space-x-4">
            {isAdmin && (
              <Link to="/admin">
                <Button variant="ghost" size="sm">
                  Painel Admin
                </Button>
              </Link>
            )}
            {isLoggedIn ? (
              <Link to="/profile">
                <Button variant="outline" size="sm" className="flex items-center">
                  <User className="mr-1 h-4 w-4" />
                  Meu Perfil
                </Button>
              </Link>
            ) : (
              <Link to="/auth">
                <Button variant="outline" size="sm">
                  Entrar
                </Button>
              </Link>
            )}
            <Link to="/submit-subscription">
              <Button size="sm">Anunciar</Button>
            </Link>
          </div>
        )}
      </div>
      
      {/* Menu mobile */}
      {isMobile && menuOpen && (
        <div className="bg-white border-t py-2">
          <div className="container mx-auto px-4 flex flex-col space-y-2">
            {isAdmin && (
              <Link to="/admin" onClick={() => setMenuOpen(false)}>
                <Button variant="ghost" size="sm" className="w-full justify-start">
                  Painel Admin
                </Button>
              </Link>
            )}
            {isLoggedIn ? (
              <Link to="/profile" onClick={() => setMenuOpen(false)}>
                <Button variant="outline" size="sm" className="w-full justify-start flex items-center">
                  <User className="mr-1 h-4 w-4" />
                  Meu Perfil
                </Button>
              </Link>
            ) : (
              <Link to="/auth" onClick={() => setMenuOpen(false)}>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  Entrar
                </Button>
              </Link>
            )}
            <Link to="/submit-subscription" onClick={() => setMenuOpen(false)}>
              <Button size="sm" className="w-full justify-start">
                Anunciar
              </Button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default NavBar;
