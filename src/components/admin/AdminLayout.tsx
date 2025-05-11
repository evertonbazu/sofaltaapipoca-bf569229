
import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  List,
  Settings as SettingsIcon,
  LogOut,
  MessageSquare,
  ButtonsSquare,
  FormInput
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface AdminLayoutProps {
  title: string;
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ title, children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-md hidden md:block">
        <div className="p-4">
          <h2 className="text-xl font-bold">Admin</h2>
        </div>
        <nav className="mt-4">
          <ul>
            <li>
              <Link to="/admin">
                <Button
                  variant={isActive('/admin') && !isActive('/admin/subscriptions') && !isActive('/admin/settings') && !isActive('/admin/buttons') ? "default" : "ghost"}
                  className="w-full justify-start mb-1"
                >
                  <LayoutDashboard className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
            </li>
            <li>
              <Link to="/admin/subscriptions">
                <Button
                  variant={isActive('/admin/subscriptions') ? "default" : "ghost"}
                  className="w-full justify-start mb-1"
                >
                  <List className="h-4 w-4 mr-2" />
                  Assinaturas
                </Button>
              </Link>
            </li>
            <li>
              <Link to="/admin/subscriptions/chat">
                <Button
                  variant={isActive('/admin/subscriptions/chat') ? "default" : "ghost"}
                  className="w-full justify-start mb-1"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Chat Assinaturas
                </Button>
              </Link>
            </li>
            <li>
              <Link to="/admin/buttons">
                <Button
                  variant={isActive('/admin/buttons') ? "default" : "ghost"}
                  className="w-full justify-start mb-1"
                >
                  <ButtonsSquare className="h-4 w-4 mr-2" />
                  Botões
                </Button>
              </Link>
            </li>
            <li>
              <Link to="/admin/form-options">
                <Button
                  variant={isActive('/admin/form-options') ? "default" : "ghost"}
                  className="w-full justify-start mb-1"
                >
                  <FormInput className="h-4 w-4 mr-2" />
                  Opções Formulário
                </Button>
              </Link>
            </li>
            <li>
              <Link to="/admin/settings">
                <Button
                  variant={isActive('/admin/settings') ? "default" : "ghost"}
                  className="w-full justify-start mb-1"
                >
                  <SettingsIcon className="h-4 w-4 mr-2" />
                  Configurações
                </Button>
              </Link>
            </li>
            <li className="mt-8">
              <Button
                variant="ghost"
                className="w-full justify-start mb-1 text-red-500 hover:text-red-700 hover:bg-red-50"
                onClick={handleSignOut}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </li>
          </ul>
        </nav>
      </div>
      
      {/* Main content */}
      <div className="flex-1">
        {/* Mobile header */}
        <div className="bg-white p-4 shadow-sm md:hidden flex justify-between items-center">
          <h1 className="font-bold">{title}</h1>
          {/* Mobile menu button would go here */}
        </div>
        
        {/* Content */}
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">{title}</h1>
          </div>
          
          {children}
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
