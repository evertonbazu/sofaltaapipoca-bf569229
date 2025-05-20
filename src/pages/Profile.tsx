
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, User, Edit, Trash2 } from 'lucide-react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from '@/integrations/supabase/client';
import { SubscriptionData } from '@/types/subscriptionTypes';
import { deleteSubscription } from '@/services/subscription-service';
import NavBar from '@/components/NavBar';
import { useAuth } from '@/contexts/AuthContext';

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
          setUserSubscriptions(subscriptions || []);
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
  }, [navigate, authState, redirected]);
  
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
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="profile">Meus Dados</TabsTrigger>
            <TabsTrigger value="subscriptions">Minhas Assinaturas</TabsTrigger>
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
                  <Form {...profileForm}>
                    <form onSubmit={profileForm.handleSubmit(onUpdateProfile)} className="space-y-4">
                      <FormField
                        control={profileForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>E-mail</FormLabel>
                            <FormControl>
                              <Input disabled {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={profileForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome de Usuário</FormLabel>
                            <FormControl>
                              <Input placeholder="Seu nome de usuário" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Button 
                        type="submit" 
                        className="w-full"
                        disabled={actionInProgress === 'profile'}
                      >
                        {actionInProgress === 'profile' ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Atualizando...
                          </>
                        ) : (
                          'Salvar alterações'
                        )}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
              
              {/* Card de alteração de senha */}
              <Card>
                <CardHeader>
                  <CardTitle>Alterar Senha</CardTitle>
                  <CardDescription>Defina uma nova senha para sua conta</CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...passwordForm}>
                    <form onSubmit={passwordForm.handleSubmit(onUpdatePassword)} className="space-y-4">
                      <FormField
                        control={passwordForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nova Senha</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="******" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={passwordForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirme a Nova Senha</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="******" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Button 
                        type="submit" 
                        className="w-full"
                        disabled={actionInProgress === 'password'}
                      >
                        {actionInProgress === 'password' ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Atualizando...
                          </>
                        ) : (
                          'Alterar senha'
                        )}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full" onClick={handleLogout}>
                    Sair da conta
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
          
          {/* Aba de Assinaturas */}
          <TabsContent value="subscriptions">
            <h2 className="text-xl font-medium mb-4">Minhas Assinaturas</h2>
            
            {userSubscriptions.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-gray-500">Você ainda não possui assinaturas aprovadas.</p>
                  <Button 
                    className="mt-4"
                    onClick={() => navigate('/')}
                  >
                    Voltar para a página inicial
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userSubscriptions.map((subscription) => (
                  <Card key={subscription.id}>
                    <CardHeader>
                      <CardTitle>{subscription.title}</CardTitle>
                      <CardDescription>
                        {subscription.price} - {subscription.paymentMethod}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p><strong>Envio:</strong> {subscription.access}</p>
                        <p><strong>Status:</strong> {subscription.status}</p>
                        <p><strong>Adicionado em:</strong> {subscription.addedDate}</p>
                        <p><strong>Código:</strong> {subscription.code}</p>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        variant="destructive" 
                        className="w-full"
                        disabled={!!actionInProgress}
                        onClick={() => handleDeleteSubscription(subscription.id || '')}
                      >
                        {actionInProgress === subscription.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Excluir Assinatura
                          </>
                        )}
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;
