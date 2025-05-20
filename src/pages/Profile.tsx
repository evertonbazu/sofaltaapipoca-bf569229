
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase, formatDateBR, calculateDaysRemaining, isExpirationImminent } from '@/integrations/supabase/client';
import { SubscriptionData, ExpiredSubscriptionData } from '@/types/subscriptionTypes';
import { deleteSubscription } from '@/services/subscription-service';
import { getExpiredSubscriptions, resubmitExpiredSubscription } from '@/services/expired-subscription-service';
import NavBar from '@/components/NavBar';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, User } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";

// Import the refactored components
import ProfileInfoForm from '@/components/profile/ProfileInfoForm';
import PasswordFormComponent from '@/components/profile/PasswordForm';
import SubscriptionsList from '@/components/profile/SubscriptionsList';
import ExpiredSubscriptionsList from '@/components/profile/ExpiredSubscriptionsList';

// Schema para o formulário de perfil
const profileFormSchema = z.object({
  email: z.string().email({ message: "E-mail inválido" }).min(1, { message: "E-mail é obrigatório" }),
  username: z.string().min(3, { message: "Nome de usuário deve ter pelo menos 3 caracteres" }),
});

// Schema para o formulário de senha
const passwordFormSchema = z.object({
  password: z.string().min(6, { message: "A senha deve ter pelo menos 6 caracteres" }),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;
type PasswordFormValues = z.infer<typeof passwordFormSchema>;

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [userSubscriptions, setUserSubscriptions] = useState<SubscriptionData[]>([]);
  const [expiredSubscriptions, setExpiredSubscriptions] = useState<ExpiredSubscriptionData[]>([]);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  const { signOut, authState } = useAuth();
  const [redirected, setRedirected] = useState(false);

  // Formulário de perfil
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      email: "",
      username: "",
    },
  });

  // Formulário de senha
  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  // Verificar se o usuário está logado e buscar dados
  useEffect(() => {
    const checkUser = async () => {
      try {
        setIsLoading(true);
        
        // Usar o estado de autenticação do contexto
        if (!authState.session || !authState.user) {
          if (!redirected) {
            setRedirected(true);
            navigate('/auth');
          }
          return;
        }
        
        setUser(authState.user);
        
        // Buscar perfil do usuário
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authState.user.id)
          .single();
        
        if (profileError && profileError.code !== 'PGRST116') {
          console.error('Erro ao buscar perfil do usuário:', profileError);
        } else if (profileData) {
          setUserProfile(profileData);
          profileForm.reset({
            email: authState.user.email || '',
            username: profileData.username || '',
          });
        }
        
        // Buscar assinaturas aprovadas do usuário
        const { data: subscriptions, error: subscriptionsError } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', authState.user.id);
        
        if (subscriptionsError) {
          console.error('Erro ao buscar assinaturas do usuário:', subscriptionsError);
        } else {
          // Processar as assinaturas e calcular dias restantes
          const processedSubs = (subscriptions || []).map(sub => {
            const daysRemaining = sub.expiration_date 
              ? calculateDaysRemaining(sub.expiration_date)
              : 15;
              
            return {
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
              code: sub.code,
              userId: sub.user_id,
              pixKey: sub.pix_key,
              expirationDate: sub.expiration_date,
              daysRemaining
            };
          });
          
          setUserSubscriptions(processedSubs);
        }
        
        // Buscar assinaturas expiradas
        try {
          const expiredSubs = await getExpiredSubscriptions();
          setExpiredSubscriptions(expiredSubs);
        } catch (error) {
          console.error('Erro ao buscar assinaturas expiradas:', error);
          toast({
            title: "Erro",
            description: "Não foi possível buscar as assinaturas expiradas.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Erro ao verificar usuário:', error);
        if (!redirected) {
          setRedirected(true);
          navigate('/auth');
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    if (!redirected) {
      checkUser();
    }
  }, [navigate, authState, redirected, toast, profileForm]);
  
  // Função para atualizar o perfil
  const onUpdateProfile = async (data: ProfileFormValues) => {
    try {
      setActionInProgress('profile');
      
      // Atualizar o perfil
      const { error } = await supabase
        .from('profiles')
        .update({
          username: data.username,
        })
        .eq('id', user.id);
      
      if (error) throw error;
      
      toast({
        title: "Perfil atualizado",
        description: "Seu perfil foi atualizado com sucesso.",
      });
      
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar seu perfil.",
        variant: "destructive",
      });
    } finally {
      setActionInProgress(null);
    }
  };
  
  // Função para atualizar a senha
  const onUpdatePassword = async (data: PasswordFormValues) => {
    try {
      setActionInProgress('password');
      
      // Atualizar a senha
      const { error } = await supabase.auth.updateUser({
        password: data.password,
      });
      
      if (error) throw error;
      
      toast({
        title: "Senha atualizada",
        description: "Sua senha foi atualizada com sucesso.",
      });
      
      passwordForm.reset();
      
    } catch (error) {
      console.error('Erro ao atualizar senha:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar sua senha.",
        variant: "destructive",
      });
    } finally {
      setActionInProgress(null);
    }
  };
  
  // Função para excluir uma assinatura
  const handleDeleteSubscription = async (id: string) => {
    try {
      setActionInProgress(id);
      
      await deleteSubscription(id);
      
      toast({
        title: "Assinatura excluída",
        description: "Sua assinatura foi excluída com sucesso.",
      });
      
      // Atualizar a lista de assinaturas
      setUserSubscriptions(prev => prev.filter(item => item.id !== id));
      
      // Recarregar assinaturas expiradas para obter a recém-excluída
      const expiredSubs = await getExpiredSubscriptions();
      setExpiredSubscriptions(expiredSubs);
      
    } catch (error) {
      console.error('Erro ao excluir assinatura:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir sua assinatura.",
        variant: "destructive",
      });
    } finally {
      setActionInProgress(null);
    }
  };
  
  // Função para reenviar uma assinatura expirada
  const handleResubmitExpiredSubscription = async (subscription: ExpiredSubscriptionData) => {
    try {
      setActionInProgress(subscription.id || '');
      
      await resubmitExpiredSubscription(subscription);
      
      toast({
        title: "Assinatura reenviada",
        description: "Sua assinatura foi reenviada para aprovação com sucesso.",
      });
      
      // Atualizar a lista de assinaturas expiradas
      setExpiredSubscriptions(prev => prev.filter(item => item.id !== subscription.id));
      
    } catch (error) {
      console.error('Erro ao reenviar assinatura:', error);
      toast({
        title: "Erro",
        description: "Não foi possível reenviar sua assinatura.",
        variant: "destructive",
      });
    } finally {
      setActionInProgress(null);
    }
  };
  
  // Função para fazer logout
  const handleLogout = async () => {
    try {
      await signOut();
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
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <NavBar />
        <div className="container mx-auto py-8 flex justify-center items-center min-h-[70vh]">
          <Loader2 className="animate-spin h-12 w-12 text-primary" />
        </div>
      </div>
    );
  }
  
  // Se o usuário não estiver logado após a verificação, não renderize o conteúdo
  if (!user && !isLoading) {
    return null;
  }
  
  return (
    <div className="min-h-screen bg-gray-100">
      <NavBar />
      
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-6 flex items-center">
          <User className="mr-2" /> Meu Perfil
        </h1>
        
        <Tabs defaultValue="profile">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="profile">Meus Dados</TabsTrigger>
            <TabsTrigger value="subscriptions">Minhas Assinaturas</TabsTrigger>
            <TabsTrigger value="expired">Assinaturas Expiradas/Excluídas</TabsTrigger>
          </TabsList>
          
          {/* Aba de Perfil */}
          <TabsContent value="profile">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Card de informações do perfil */}
              <Card>
                <CardHeader>
                  <CardTitle>Informações Pessoais</CardTitle>
                  <CardDescription>Atualize suas informações de perfil</CardDescription>
                </CardHeader>
                <CardContent>
                  <ProfileInfoForm
                    form={profileForm}
                    onSubmit={onUpdateProfile}
                    isSubmitting={actionInProgress === 'profile'}
                  />
                </CardContent>
              </Card>
              
              {/* Card de alteração de senha */}
              <Card>
                <CardHeader>
                  <CardTitle>Alterar Senha</CardTitle>
                  <CardDescription>Defina uma nova senha para sua conta</CardDescription>
                </CardHeader>
                <CardContent>
                  <PasswordFormComponent
                    form={passwordForm}
                    onSubmit={onUpdatePassword}
                    isSubmitting={actionInProgress === 'password'}
                    onLogout={handleLogout}
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Aba de Assinaturas */}
          <TabsContent value="subscriptions">
            <h2 className="text-xl font-medium mb-4">Minhas Assinaturas</h2>
            <SubscriptionsList 
              subscriptions={userSubscriptions}
              onDelete={handleDeleteSubscription}
              actionInProgress={actionInProgress}
            />
          </TabsContent>
          
          {/* Aba de Assinaturas Expiradas/Excluídas */}
          <TabsContent value="expired">
            <h2 className="text-xl font-medium mb-4">Assinaturas Expiradas/Excluídas</h2>
            <ExpiredSubscriptionsList 
              subscriptions={expiredSubscriptions}
              onResubmit={handleResubmitExpiredSubscription}
              actionInProgress={actionInProgress}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;
