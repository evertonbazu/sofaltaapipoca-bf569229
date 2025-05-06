
import React, { useEffect } from 'react';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarProvider, Sidebar, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { Home, ListPlus, Edit, LogOut } from 'lucide-react';
import AdminDashboard from '@/components/admin/AdminDashboard';
import SubscriptionForm from '@/components/admin/SubscriptionForm';
import SubscriptionList from '@/components/admin/SubscriptionList';

const Admin: React.FC = () => {
  const { authState, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Painel Administrativo | Só Falta a Pipoca';
  }, []);

  if (authState.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // If user is not authenticated or not an admin, redirect to auth page
  if (!authState.user) {
    return <Navigate to="/auth" />;
  }
  
  if (!isAdmin()) {
    return <Navigate to="/" />;
  }

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen overflow-hidden">
        <Sidebar>
          <div className="p-4">
            <h1 className="text-2xl font-bold">🍿 Só Falta a Pipoca</h1>
            <p className="text-sm text-muted-foreground">Painel Administrativo</p>
          </div>
          <Separator />
          <div className="flex-1 overflow-y-auto py-4">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={() => navigate('/admin')}
                  isActive={location.pathname === '/admin'}
                >
                  <Home className="mr-2 h-5 w-5" />
                  Dashboard
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={() => navigate('/admin/subscriptions')}
                  isActive={location.pathname === '/admin/subscriptions'}
                >
                  <ListPlus className="mr-2 h-5 w-5" />
                  Listar Anúncios
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={() => navigate('/admin/subscriptions/new')}
                  isActive={location.pathname === '/admin/subscriptions/new'}
                >
                  <Edit className="mr-2 h-5 w-5" />
                  Novo Anúncio
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </div>
          <div className="p-4">
            <Button 
              variant="outline" 
              className="w-full flex gap-2" 
              onClick={handleSignOut}
            >
              <LogOut className="h-5 w-5" />
              Sair
            </Button>
            <p className="mt-4 text-xs text-center text-muted-foreground">
              Logado como {authState.user.username || authState.user.id}
              <br />
              <span className="font-semibold">{isAdmin() ? 'Administrador' : 'Membro'}</span>
            </p>
          </div>
        </Sidebar>
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            <Routes>
              <Route path="/" element={<AdminDashboard />} />
              <Route path="/subscriptions" element={<SubscriptionList />} />
              <Route path="/subscriptions/new" element={<SubscriptionForm />} />
              <Route path="/subscriptions/edit/:id" element={<SubscriptionForm />} />
            </Routes>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Admin;
