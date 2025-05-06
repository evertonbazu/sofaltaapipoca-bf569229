
import React, { useEffect } from 'react';
import { Navigate, Route, Routes, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarProvider, Sidebar, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { Home, ListPlus, Edit, LogOut, Users, Bell, FileSpreadsheet, User, Download } from 'lucide-react';
import AdminDashboard from '@/components/admin/AdminDashboard';
import SubscriptionForm from '@/components/admin/SubscriptionForm';
import SubscriptionList from '@/components/admin/SubscriptionList';
import UserManagement from '@/components/admin/UserManagement';
import PendingSubscriptions from '@/components/admin/PendingSubscriptions';
import ImportExcel from '@/components/admin/ImportExcel';
import ExportSubscriptions from '@/components/admin/ExportSubscriptions';

const Admin: React.FC = () => {
  const { authState, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

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

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen overflow-hidden w-full">
        <Sidebar>
          <div className="p-4">
            <h1 className="text-2xl font-bold text-center">🍿 Só Falta a Pipoca</h1>
            <p className="text-sm text-muted-foreground text-center">Painel Administrativo</p>
          </div>
          <Separator />
          <div className="flex-1 overflow-y-auto py-4">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={() => navigate('/admin')}
                  isActive={isActive('/admin')}
                >
                  <Home className="mr-2 h-5 w-5" />
                  Dashboard
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={() => navigate('/admin/subscriptions')}
                  isActive={isActive('/admin/subscriptions')}
                >
                  <ListPlus className="mr-2 h-5 w-5" />
                  Listar Anúncios
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={() => navigate('/admin/subscriptions/new')}
                  isActive={isActive('/admin/subscriptions/new')}
                >
                  <Edit className="mr-2 h-5 w-5" />
                  Novo Anúncio
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={() => navigate('/admin/subscriptions/pending')}
                  isActive={isActive('/admin/subscriptions/pending')}
                >
                  <Bell className="mr-2 h-5 w-5" />
                  Anúncios Pendentes
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={() => navigate('/admin/subscriptions/import-excel')}
                  isActive={isActive('/admin/subscriptions/import-excel')}
                >
                  <FileSpreadsheet className="mr-2 h-5 w-5" />
                  Importar Excel
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={() => navigate('/admin/subscriptions/export-excel')}
                  isActive={isActive('/admin/subscriptions/export-excel')}
                >
                  <Download className="mr-2 h-5 w-5" />
                  Exportar Excel
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={() => navigate('/admin/users')}
                  isActive={isActive('/admin/users')}
                >
                  <Users className="mr-2 h-5 w-5" />
                  Gerenciar Usuários
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </div>
          <div className="p-4">
            <Button 
              variant="default" 
              className="w-full flex gap-2 mb-2" 
              onClick={() => navigate('/')}
            >
              <Home className="h-5 w-5" />
              Voltar ao Início
            </Button>
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
              <Route path="/subscriptions/pending" element={<PendingSubscriptions />} />
              <Route path="/subscriptions/import-excel" element={<ImportExcel />} />
              <Route path="/subscriptions/export-excel" element={<ExportSubscriptions />} />
              <Route path="/users" element={<UserManagement />} />
            </Routes>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Admin;
