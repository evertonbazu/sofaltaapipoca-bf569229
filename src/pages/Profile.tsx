
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import NavBar from '@/components/NavBar';
import { useAuth } from '@/contexts/AuthContext';
import UserMessages from '@/components/UserMessages';
import MemberSubscriptions from '@/components/MemberSubscriptions';

const Profile = () => {
  const { authState, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("info");

  React.useEffect(() => {
    // Redirect to login if not authenticated
    if (!authState.user && !authState.isLoading) {
      navigate('/auth');
    }
  }, [authState, navigate]);

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  if (authState.isLoading) {
    return <div>Loading...</div>;
  }

  if (!authState.user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <NavBar />
      
      <div className="container mx-auto p-4">
        <div className="max-w-3xl mx-auto">
          <Tabs 
            value={activeTab} 
            onValueChange={setActiveTab}
            className="space-y-4"
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="info">Informações</TabsTrigger>
              <TabsTrigger value="messages">Mensagens</TabsTrigger>
              <TabsTrigger value="subscriptions">Assinaturas</TabsTrigger>
            </TabsList>
            
            <TabsContent value="info" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Meu Perfil</CardTitle>
                  <CardDescription>
                    Gerencie suas informações pessoais e configurações da conta.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Email</h3>
                      <p>{authState.user.email}</p>
                    </div>
                    
                    {authState.isAdmin && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Função</h3>
                        <p>Administrador</p>
                      </div>
                    )}
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Membro desde</h3>
                      <p>{new Date(authState.user.created_at).toLocaleDateString('pt-BR')}</p>
                    </div>
                  </div>
                </CardContent>
                
                <CardFooter className="flex justify-between">
                  {authState.isAdmin && (
                    <Button 
                      variant="outline"
                      onClick={() => navigate('/admin')}
                    >
                      Painel Administrativo
                    </Button>
                  )}
                  
                  <Button 
                    variant="destructive"
                    onClick={handleLogout}
                  >
                    Sair da Conta
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="messages" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Minhas Mensagens</CardTitle>
                  <CardDescription>
                    Visualize suas mensagens enviadas e as respostas recebidas.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <UserMessages />
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full"
                    onClick={() => navigate('/faleconosco')}
                  >
                    Enviar Nova Mensagem
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="subscriptions" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Minhas Assinaturas</CardTitle>
                  <CardDescription>
                    Visualize e gerencie suas assinaturas cadastradas.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <MemberSubscriptions />
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full"
                    onClick={() => navigate('/submit-subscription')}
                  >
                    Adicionar Nova Assinatura
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Profile;
