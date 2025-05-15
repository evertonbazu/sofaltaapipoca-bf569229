import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { LayoutDashboard, ListFilter, Settings, Users, MessageSquare, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { useNotifications } from '@/contexts/NotificationContext';
import { NotificationBadge } from '@/components/ui/notification-badge';

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, title }) => {
  const { authState, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const { user, isAdmin, isLoading } = authState;
  const { notifications } = useNotifications();
  const location = useLocation();

  const handleBackToSite = () => {
    navigate('/');
  };

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  if (!isAdmin) {
    // Se não for um administrador, redireciona para a página inicial
    toast({
      title: "Acesso negado",
      description: "Você não tem permissão para acessar esta página.",
      variant: "destructive",
    });
    navigate('/');
    return null;
  }
  
  // Add admin nav items
  const navItems = [
    { path: '/admin', label: 'Dashboard', icon: <LayoutDashboard className="mr-2 h-4 w-4" /> },
    { 
      path: '/admin/messages', 
      label: 'Mensagens', 
      icon: <MessageSquare className="mr-2 h-4 w-4" />,
      notification: notifications.unreadAdminMessages 
    },
    { path: '/admin/subscriptions', label: 'Assinaturas', icon: <ListFilter className="mr-2 h-4 w-4" /> },
    { path: '/admin/header-buttons', label: 'Botões do Cabeçalho', icon: <Users className="mr-2 h-4 w-4" /> },
    { path: '/admin/settings', label: 'Configurações', icon: <Settings className="mr-2 h-4 w-4" /> },
  ];
  
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow-sm">
        <div className="container mx-auto py-3 px-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold text-indigo-600">
              🍿 Painel Administrativo
            </h1>
            <Button variant="outline" size="sm" onClick={handleBackToSite}>
              <ArrowLeft className="mr-1 h-4 w-4" />
              Voltar ao Site
            </Button>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <aside className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-4 sticky top-4">
              <h2 className="font-medium text-gray-700 mb-4">Menu</h2>
              <nav className="space-y-1">
                {navItems.map((item) => (
                  <Link key={item.path} to={item.path}>
                    <Button 
                      variant={location.pathname === item.path ? "default" : "ghost"} 
                      className="w-full justify-start relative"
                    >
                      {item.icon}
                      {item.label}
                      {item.notification && item.notification > 0 && (
                        <NotificationBadge count={item.notification} className="-top-2 -right-2" />
                      )}
                    </Button>
                  </Link>
                ))}
              </nav>
            </div>
          </aside>
          
          <main className="lg:col-span-10">
            <div className="bg-white rounded-lg shadow">
              <div className="border-b p-4">
                <h1 className="text-xl font-medium">{title}</h1>
              </div>
              <div className="p-4">
                {children}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
