
import React, { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ListChecks, 
  MessageSquare, 
  Users, 
  Settings, 
  LogOut,
  BookOpen,
  Menu,
  Printer,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, title }) => {
  const { pathname } = useLocation();
  const { logout } = useAuth();
  
  const menuItems = [
    {
      label: 'Dashboard',
      href: '/admin',
      icon: <LayoutDashboard className="mr-2 h-4 w-4" />,
      active: pathname === '/admin'
    },
    {
      label: 'Assinaturas',
      href: '/admin/subscriptions',
      icon: <ListChecks className="mr-2 h-4 w-4" />,
      active: pathname === '/admin/subscriptions' || 
             pathname.startsWith('/admin/subscriptions/edit/') ||
             pathname === '/admin/subscriptions/new'
    },
    {
      label: 'Gerar por IA',
      href: '/admin/subscriptions/chat',
      icon: <MessageSquare className="mr-2 h-4 w-4" />,
      active: pathname === '/admin/subscriptions/chat'
    },
    {
      label: 'Pendentes',
      href: '/admin/subscriptions/pending',
      icon: <BookOpen className="mr-2 h-4 w-4" />,
      active: pathname === '/admin/subscriptions/pending'
    },
    {
      label: 'Botões do Cabeçalho',
      href: '/admin/header-buttons',
      icon: <Printer className="mr-2 h-4 w-4" />,
      active: pathname === '/admin/header-buttons'
    },
    {
      label: 'Membros',
      href: '/admin/users',
      icon: <Users className="mr-2 h-4 w-4" />,
      active: pathname === '/admin/users'
    },
    {
      label: 'Configurações',
      href: '/admin/settings',
      icon: <Settings className="mr-2 h-4 w-4" />,
      active: pathname === '/admin/settings'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Menu */}
      <div className="lg:hidden p-4 bg-white border-b">
        <div className="flex justify-between items-center">
          <h1 className="text-lg font-semibold">Admin - {title}</h1>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <div className="py-4">
                <h2 className="text-lg font-medium mb-4">Menu</h2>
                <nav className="space-y-2">
                  {menuItems.map((item) => (
                    <Link 
                      key={item.href} 
                      to={item.href}
                      className={`flex items-center py-2 px-3 rounded-md transition-colors ${
                        item.active 
                          ? 'bg-primary text-white' 
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </Link>
                  ))}
                </nav>
                <Separator className="my-4" />
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-red-500 hover:text-red-700 hover:bg-red-50"
                  onClick={logout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sair</span>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="lg:flex">
        {/* Sidebar */}
        <aside className="hidden lg:block lg:w-64 xl:w-72 border-r bg-white h-screen sticky top-0">
          <div className="p-6">
            <h1 className="text-xl font-bold mb-6">Admin Dashboard</h1>
            <nav className="space-y-1">
              {menuItems.map((item) => (
                <Link 
                  key={item.href} 
                  to={item.href}
                  className={`flex items-center py-2 px-3 rounded-md transition-colors ${
                    item.active 
                      ? 'bg-primary text-white' 
                      : 'hover:bg-gray-100'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              ))}
              
              <Separator className="my-4" />
              
              <Button 
                variant="ghost" 
                className="w-full justify-start text-red-500 hover:text-red-700 hover:bg-red-50"
                onClick={logout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sair</span>
              </Button>
            </nav>
          </div>
        </aside>
        
        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <div className="hidden lg:block mb-6">
              <h1 className="text-2xl font-bold">{title}</h1>
            </div>
            
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
