
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Home, Package, Settings, Users, MessageSquare, Plus, PlusCircle, ClipboardList } from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, title }) => {
  const location = useLocation();

  const menuItems = [
    { icon: Home, label: 'Dashboard', path: '/admin' },
    { icon: Package, label: 'Assinaturas', path: '/admin/subscriptions' },
    { icon: ClipboardList, label: 'Pendentes', path: '/admin/pending' },
    { icon: MessageSquare, label: 'Mensagens', path: '/admin/messages' },
    { icon: Users, label: 'Usuários', path: '/admin/users' },
    { icon: PlusCircle, label: 'Botões', path: '/admin/header-buttons' },
    { icon: Settings, label: 'Configurações', path: '/admin/settings' },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-sm min-h-screen">
          <div className="p-6">
            <Link to="/" className="text-xl font-bold text-indigo-600">
              🍿 Admin Panel
            </Link>
          </div>
          
          <nav className="mt-6">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center px-6 py-3 text-sm font-medium transition-colors hover:bg-gray-50 hover:text-indigo-600 ${
                    isActive ? 'bg-indigo-50 text-indigo-600 border-r-2 border-indigo-600' : 'text-gray-600'
                  }`}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="absolute bottom-6 left-6">
            <Link to="/">
              <Button variant="outline" size="sm">
                Voltar ao Site
              </Button>
            </Link>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
