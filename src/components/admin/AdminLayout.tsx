
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { 
  LayoutDashboard, 
  List, 
  Settings, 
  PlusCircle, 
  MessageSquare, 
  ClipboardList, 
  Menu, 
  LogOut,
  LayoutTemplate
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { signOut } = useAuth();

  // Verificar se o usuário é um administrador
  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        // Verificar se o usuário está logado
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          // Não logado, redirecionar para login
          navigate('/auth');
          return;
        }
        
        // Verificar se o usuário é administrador
        const { data: isAdminData, error } = await supabase.rpc('is_admin');
        if (error) throw error;
        
        if (!isAdminData) {
          // Não é admin, redirecionar para home
          toast({
            title: "Acesso Negado",
            description: "Você não tem permissão para acessar esta área.",
            variant: "destructive",
          });
          navigate('/');
          return;
        }
        
        // É admin, permitir acesso
        setIsAdmin(true);
      } catch (error) {
        console.error('Erro ao verificar status de administrador:', error);
        toast({
          title: "Erro",
          description: "Ocorreu um erro ao verificar suas permissões.",
          variant: "destructive",
        });
        navigate('/');
      }
    };
    
    checkAdminStatus();
  }, [navigate, toast]);

  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso.",
      });
      navigate('/');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      toast({
        title: "Erro",
        description: "Não foi possível realizar o logout.",
        variant: "destructive",
      });
    }
  };

  // Se ainda está verificando permissões, mostrar tela de carregamento
  if (!isAdmin) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="animate-pulse text-center">
          <div className="h-8 w-48 bg-gray-300 rounded mx-auto mb-4"></div>
          <div className="h-4 w-64 bg-gray-200 rounded mx-auto"></div>
        </div>
      </div>
    );
  }
  
  // Menu items
  const menuItems = [
    { path: '/admin', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { path: '/admin/subscriptions', label: 'Assinaturas', icon: <List size={20} /> },
    { path: '/admin/subscriptions/new', label: 'Nova Assinatura', icon: <PlusCircle size={20} /> },
    { path: '/admin/subscriptions/chat', label: 'Chat Editor', icon: <MessageSquare size={20} /> },
    { path: '/admin/subscriptions/pending', label: 'Pendentes', icon: <ClipboardList size={20} /> },
    { path: '/admin/header-buttons', label: 'Botões do Cabeçalho', icon: <LayoutTemplate size={20} /> },
    { path: '/admin/settings', label: 'Configurações', icon: <Settings size={20} /> },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link to="/admin" className="text-xl font-bold text-indigo-600">
            Painel de Administração
          </Link>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <Menu />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="flex items-center"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sair</span>
            </Button>
          </div>
        </div>
      </header>
      
      <div className="flex flex-1">
        {/* Sidebar para desktop */}
        <aside className="hidden md:block w-64 bg-white border-r p-4">
          <nav className="space-y-1">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-4 py-2 rounded-md ${
                  location.pathname === item.path
                    ? 'bg-indigo-100 text-indigo-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span className="mr-3">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
          
          <Separator className="my-4" />
          
          <div className="pt-2">
            <Link
              to="/"
              className="flex items-center px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
            >
              <span className="mr-3">🏠</span>
              <span>Voltar ao site</span>
            </Link>
          </div>
        </aside>
        
        {/* Menu mobile */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-40 md:hidden">
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setIsMobileMenuOpen(false)}></div>
            
            <div className="fixed inset-y-0 left-0 flex flex-col w-64 max-w-sm bg-white shadow-xl">
              <div className="p-4 flex justify-between items-center border-b">
                <h2 className="text-lg font-medium">Menu</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Menu />
                </Button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4">
                <nav className="space-y-1">
                  {menuItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center px-4 py-2 rounded-md ${
                        location.pathname === item.path
                          ? 'bg-indigo-100 text-indigo-700 font-medium'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <span className="mr-3">{item.icon}</span>
                      <span>{item.label}</span>
                    </Link>
                  ))}
                  
                  <Separator className="my-4" />
                  
                  <Link
                    to="/"
                    className="flex items-center px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <span className="mr-3">🏠</span>
                    <span>Voltar ao site</span>
                  </Link>
                </nav>
              </div>
            </div>
          </div>
        )}
        
        {/* Conteúdo principal */}
        <main className="flex-1 p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
