
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Settings, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const NavBar: React.FC = () => {
  const { authState, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <div className="bg-white shadow-sm p-2">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-bold">🍿 Só Falta a Pipoca</Link>
        
        <div className="flex gap-2">
          {authState.user && authState.isAdmin && (
            <Button
              variant="outline"
              size="sm"
              className="text-black border-gray-300 hover:bg-gray-100"
              asChild
            >
              <Link to="/admin">
                <Settings className="h-4 w-4 mr-1" />
                Admin
              </Link>
            </Button>
          )}
          
          {authState.user && (
            <Button
              variant="outline"
              size="sm"
              className="text-black border-gray-300 hover:bg-gray-100"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4 mr-1" />
              Sair
            </Button>
          )}
          
          {!authState.user && (
            <Button
              variant="outline"
              size="sm"
              className="text-black border-gray-300 hover:bg-gray-100"
              asChild
            >
              <Link to="/auth">
                <Settings className="h-4 w-4 mr-1" />
                Login
              </Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default NavBar;
