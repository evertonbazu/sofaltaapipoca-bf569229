
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '../ui/button';
import { 
  Layers, 
  Users, 
  MessageSquare, 
  Settings, 
  LogOut, 
  Home, 
  ClipboardList,
  FileText,
  Clock,
  Upload,
  FilePlus2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, title }) => {
  const location = useLocation();
  const { signOut } = useAuth();

  const handleSignOut = () => {
    signOut();
  };

  const navItems = [
    { name: 'Dashboard', to: '/admin', icon: Home },
    { name: 'Anúncios', to: '/admin/subscriptions', icon: Layers },
    { name: 'Anúncios Pendentes', to: '/admin/pending-subscriptions', icon: Clock },
    { name: 'Mensagens', to: '/admin/messages', icon: MessageSquare },
    { name: 'Usuários', to: '/admin/users', icon: Users },
    { name: 'Exportar', to: '/admin/export', icon: FileText },
    { name: 'Exportar TXT', to: '/admin/export-txt', icon: FileText },
    { name: 'Importar Excel', to: '/admin/import', icon: Upload },
    { name: 'Importar Bulk', to: '/admin/import-bulk', icon: ClipboardList },
    { name: 'Importar Texto', to: '/admin/import-text', icon: FilePlus2 },
    { name: 'Perfil', to: '/admin/profile', icon: Settings },
  ];

  const isActiveLink = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-md p-4">
        <div className="flex justify-center mb-8 pt-4">
          <h2 className="text-xl font-bold">Painel Admin</h2>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => (
            <Link to={item.to} key={item.name}>
              <div 
                className={cn(
                  "flex items-center px-4 py-3 text-sm rounded-md mb-1 hover:bg-gray-100",
                  isActiveLink(item.to) && "bg-blue-50 text-blue-700 font-medium"
                )}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </div>
            </Link>
          ))}

          <Button 
            variant="ghost" 
            onClick={handleSignOut}
            className="w-full justify-start px-4 py-3 mt-4 text-sm"
          >
            <LogOut className="mr-3 h-5 w-5" />
            Sair
          </Button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        {title && <h1 className="text-2xl font-bold mb-6">{title}</h1>}
        {children}
      </div>
    </div>
  );
};

export default AdminLayout;
