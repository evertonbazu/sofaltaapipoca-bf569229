
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Search, User, Menu, X, LogOut } from 'lucide-react';
import { useDebounced } from '@/hooks/useDebounced';
import { useIsMobile } from '@/hooks/use-mobile';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { NotificationBadge } from '@/components/ui/notification-badge';
import { useNotifications } from '@/contexts/NotificationContext';

const NavBar: React.FC = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signOut, authState } = useAuth();

  // Verificar se o usuário está logado e se é administrador
  useEffect(() => {
    // Usar o estado da autenticação do contexto
    setIsLoggedIn(!!authState.session);
    setIsAdmin(authState.isAdmin);
    
  }, [authState]);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const handleLogout = async () => {
    try {
      await signOut();
      // O estado será atualizado pelo contexto de autenticação
      navigate('/');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      toast({
        title: "Erro",
        description: "Não foi possível realizar o logout",
        variant: "destructive",
      });
    } finally {
      // Feche o menu móvel se estiver aberto
      if (menuOpen) {
        setMenuOpen(false);
      }
    }
  };

  const { notifications } = useNotifications();
  const totalNotifications = authState.isAdmin 
    ? notifications.unreadAdminMessages 
    : notifications.unreadUserReplies;

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
              {totalNotifications > 0 && !menuOpen && (
                <NotificationBadge count={totalNotifications} />
              )}
            </Button>
          </div>
        ) : (
          <div className="flex items-center space-x-4">
            {isAdmin && (
              <Link to="/admin">
                <Button variant="outline" size="sm">
                  Painel Admin
                  {notifications.unreadAdminMessages > 0 && (
                    <NotificationBadge count={notifications.unreadAdminMessages} />
                  )}
                </Button>
              </Link>
            )}
            {isLoggedIn ? (
              <>
                <Link to="/profile">
                  <Button variant="outline" size="sm" className="flex items-center relative">
                    <User className="mr-1 h-4 w-4" />
                    Meu Perfil
                    {notifications.unreadUserReplies > 0 && (
                      <NotificationBadge count={notifications.unreadUserReplies} />
                    )}
                  </Button>
                </Link>
                <Button variant="outline" size="sm" onClick={handleLogout} className="flex items-center">
                  <LogOut className="mr-1 h-4 w-4" />
                  Sair
                </Button>
              </>
            ) : (
              <>
                <Link to="/auth">
                  <Button variant="outline" size="sm">
                    Entrar
                  </Button>
                </Link>
              </>
            )}
          </div>
        )}
      </div>
      
      {/* Menu mobile */}
      {isMobile && menuOpen && (
        <div className="bg-white border-t py-2">
          <div className="container mx-auto px-4 flex flex-col space-y-2">
            {isAdmin && (
              <Link to="/admin" onClick={() => setMenuOpen(false)}>
                <Button variant="outline" size="sm" className="w-full justify-start relative">
                  Painel Admin
                  {notifications.unreadAdminMessages > 0 && (
                    <NotificationBadge count={notifications.unreadAdminMessages} className="right-2" />
                  )}
                </Button>
              </Link>
            )}
            {isLoggedIn ? (
              <>
                <Link to="/profile" onClick={() => setMenuOpen(false)}>
                  <Button variant="outline" size="sm" className="w-full justify-start flex items-center relative">
                    <User className="mr-1 h-4 w-4" />
                    Meu Perfil
                    {notifications.unreadUserReplies > 0 && (
                      <NotificationBadge count={notifications.unreadUserReplies} className="right-2" />
                    )}
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleLogout}
                  className="w-full justify-start flex items-center"
                >
                  <LogOut className="mr-1 h-4 w-4" />
                  Sair
                </Button>
              </>
            ) : (
              <>
                <Link to="/auth" onClick={() => setMenuOpen(false)}>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    Entrar
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default NavBar;
