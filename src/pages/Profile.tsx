
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import NavBar from '@/components/NavBar';
import { useAuth } from '@/contexts/AuthContext';
import UserMessages from '@/components/UserMessages';
import MemberSubscriptions from '@/components/MemberSubscriptions';
import { supabase } from '@/integrations/supabase/client';
import { SubscriptionData } from '@/types/subscriptionTypes';

const Profile = () => {
  const { authState, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("info");
  const [userSubscriptions, setUserSubscriptions] = useState<SubscriptionData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  React.useEffect(() => {
    // Redirect to login if not authenticated
    if (!authState.user && !authState.isLoading) {
      navigate('/auth');
    }
  }, [authState, navigate]);

  // Fetch user subscriptions
  useEffect(() => {
    const fetchUserSubscriptions = async () => {
      if (!authState.user) return;
      
      setIsLoading(true);
      try {
        // Get subscriptions where user_id matches the current user's ID
        const { data, error } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', authState.user.id);
        
        if (error) {
          console.error('Error fetching user subscriptions:', error);
          return;
        }
        
        // Transform the data to match SubscriptionData format
        const transformedData: SubscriptionData[] = data.map(sub => ({
          id: sub.id,
          title: sub.title,
          price: sub.price,
          paymentMethod: sub.payment_method,
          status: sub.status,
          access: sub.access,
          headerColor: sub.header_color,
          priceColor: sub.price_color,
          whatsappNumber: sub.whatsapp_number,
          telegramUsername: sub.telegram_username,
          icon: sub.icon,
          addedDate: sub.added_date,
          featured: sub.featured,
          code: sub.code,
          userId: sub.user_id,
          pixKey: sub.pix_key,
          isMemberSubmission: true
        }));
        
        setUserSubscriptions(transformedData);
      } catch (error) {
        console.error('Error in fetchUserSubscriptions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (authState.user) {
      fetchUserSubscriptions();
    }
  }, [authState.user]);

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
                  {isLoading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-pulse space-y-2">
                        <div className="h-6 w-48 bg-gray-200 rounded"></div>
                        <div className="h-4 w-64 bg-gray-200 rounded"></div>
                      </div>
                    </div>
                  ) : userSubscriptions.length > 0 ? (
                    <MemberSubscriptions subscriptionList={userSubscriptions} />
                  ) : (
                    <p className="text-center py-4 text-gray-500">
                      Você ainda não possui assinaturas cadastradas.
                    </p>
                  )}
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
