import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Menu, 
  Plus, 
  ListFilter, 
  Settings,
  Bookmark
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from '@/contexts/AuthContext';
import NavBar from '@/components/NavBar';

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, title }) => {
  const navigate = useNavigate();
  const { authState } = useAuth();
  const [open, setOpen] = React.useState(false);

  // Verificar se o usuário é admin e redirecionar se não for
  React.useEffect(() => {
    if (!authState.isLoading && (!authState.user || !authState.isAdmin)) {
      navigate('/auth');
    }
  }, [authState, navigate]);

  // Array de links do menu
  const menuLinks = [
    { 
      name: 'Dashboard', 
      path: '/admin', 
      icon: <LayoutDashboard className="h-5 w-5 mr-2" /> 
    },
    { 
      name: 'Assinaturas', 
      path: '/admin/subscriptions', 
      icon: <ListFilter className="h-5 w-5 mr-2" /> 
    },
    { 
      name: 'Adicionar Assinatura', 
      path: '/admin/subscriptions/new', 
      icon: <Plus className="h-5 w-5 mr-2" /> 
    },
    { 
      name: 'Gerenciar Botões', 
      path: '/admin/buttons', 
      icon: <Bookmark className="h-5 w-5 mr-2" /> 
    },
    { 
      name: 'Configurações', 
      path: '/admin/settings', 
      icon: <Settings className="h-5 w-5 mr-2" /> 
    }
  ];

  // Verificar se o usuário é admin e redirecionar se não for
  

  if (authState.isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <NavBar />
      
      {/* Cabeçalho com menu hamburguer para mobile */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-3 flex items-center">
          <div className="flex items-center space-x-2">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu size={20} />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 pt-12">
                <div className="flex flex-col h-full">
                  <div className="flex-1 space-y-1">
                    {menuLinks.map((link) => (
                      <Button
                        key={link.path}
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={() => {
                          navigate(link.path);
                          setOpen(false);
                        }}
                      >
                        {link.icon}
                        {link.name}
                      </Button>
                    ))}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
            <h1 className="text-xl font-semibold">{title}</h1>
          </div>
        </div>
      </header>

      {/* Menu lateral para desktop */}
      <div className="flex min-h-[calc(100vh-57px)]">
        <aside className="hidden md:flex md:w-64 bg-white border-r flex-col">
          <div className="flex-1 px-4 py-6 space-y-1">
            {menuLinks.map((link) => (
              <Button
                key={link.path}
                variant="ghost"
                className="w-full justify-start"
                onClick={() => navigate(link.path)}
              >
                {link.icon}
                {link.name}
              </Button>
            ))}
          </div>
        </aside>

        {/* Conteúdo principal */}
        <main className="flex-1 p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
