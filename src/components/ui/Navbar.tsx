
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, UserCircle, Settings, User } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useAuth } from '@/hooks/use-auth';

const Navbar: React.FC = () => {
  const { authState, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="bg-white shadow-sm sticky top-0 z-50">
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
  );
};

export default Navbar;
