import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useAuth } from '@/contexts/AuthContext';

// Schema para validação do formulário de login
const loginSchema = z.object({
  email: z.string().email({
    message: "Email inválido"
  }),
  password: z.string().min(6, {
    message: "A senha deve ter pelo menos 6 caracteres"
  })
});

// Schema para validação do formulário de cadastro
const signupSchema = z.object({
  email: z.string().email({
    message: "Email inválido"
  }),
  password: z.string().min(6, {
    message: "A senha deve ter pelo menos 6 caracteres"
  }),
  confirmPassword: z.string().min(6, {
    message: "A senha deve ter pelo menos 6 caracteres"
  }),
  full_name: z.string().min(2, {
    message: "Nome completo é obrigatório"
  }),
  username: z.string().min(3, {
    message: "Nome de usuário deve ter pelo menos 3 caracteres"
  }),
  whatsapp: z.string().min(10, {
    message: "WhatsApp é obrigatório"
  }),
  telegram_username: z.string().optional()
}).refine(data => data.password === data.confirmPassword, {
  message: "As senhas não correspondem",
  path: ["confirmPassword"]
});
type LoginFormValues = z.infer<typeof loginSchema>;
type SignupFormValues = z.infer<typeof signupSchema>;

/**
 * Página de autenticação com login e cadastro
 * @version 2.0.0
 */
const Auth: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("login");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const {
    signIn,
    authState
  } = useAuth();
  const navigate = useNavigate();
  const [redirected, setRedirected] = useState(false);
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  });
  const signupForm = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      full_name: "",
      username: "",
      whatsapp: "",
      telegram_username: ""
    }
  });

  // Redirecionar se já estiver autenticado
  React.useEffect(() => {
    if (authState.user && !authState.isLoading && !redirected) {
      setRedirected(true);
      navigate('/');
    }
  }, [authState, navigate, redirected]);

  // Manipulador para envio do formulário de login
  const onLoginSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      await signIn(data.email, data.password);
      setRedirected(true);
      navigate('/');
    } catch (error) {
      console.error('Erro no login:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Manipulador para envio do formulário de cadastro
  const onSignupSubmit = async (data: SignupFormValues) => {
    setIsLoading(true);
    try {
      const {
        supabase
      } = await import('@/integrations/supabase/client');
      const {
        error
      } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.full_name,
            username: data.username,
            whatsapp: data.whatsapp,
            telegram_username: data.telegram_username || null
          }
        }
      });
      if (error) {
        throw error;
      }
      setActiveTab('login');
    } catch (error) {
      console.error('Erro no cadastro:', error);
    } finally {
      setIsLoading(false);
    }
  };
  if (authState.isLoading) {
    return <div className="flex h-screen w-full items-center justify-center">
        <p>Carregando...</p>
      </div>;
  }
  return <div className="flex min-h-screen bg-gray-100 items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Só Falta a Pipoca</CardTitle>
          <CardDescription className="text-center">
            Login para área administrativa
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Cadastro</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4 mt-4">
                  <FormField control={loginForm.control} name="email" render={({
                  field
                }) => <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="nome@exemplo.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>} />
                  <FormField control={loginForm.control} name="password" render={({
                  field
                }) => <FormItem>
                        <FormLabel>Senha</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="******" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>} />
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Entrando..." : "Entrar"}
                  </Button>
                </form>
              </Form>
            </TabsContent>
            
            <TabsContent value="signup">
              <Form {...signupForm}>
                <form onSubmit={signupForm.handleSubmit(onSignupSubmit)} className="space-y-4 mt-4">
                  <FormField control={signupForm.control} name="email" render={({
                  field
                }) => <FormItem>
                        <FormLabel>Email *</FormLabel>
                        <FormControl>
                          <Input placeholder="nome@exemplo.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>} />
                  
                  <FormField control={signupForm.control} name="full_name" render={({
                  field
                }) => <FormItem>
                        <FormLabel>Nome Completo *</FormLabel>
                        <FormControl>
                          <Input placeholder="Seu nome completo" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>} />
                  
                  <FormField control={signupForm.control} name="username" render={({
                  field
                }) => <FormItem>
                        <FormLabel>Nome de Usuário *</FormLabel>
                        <FormControl>
                          <Input placeholder="usuario123" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>} />
                  
                  <FormField control={signupForm.control} name="whatsapp" render={({
                  field
                }) => <FormItem>
                        <FormLabel>WhatsApp *</FormLabel>
                        <FormControl>
                          <Input placeholder="(11) 99999-9999" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>} />
                  
                  <FormField control={signupForm.control} name="telegram_username" render={({
                  field
                }) => <FormItem>
                        <FormLabel>Telegram (Opcional)</FormLabel>
                        <FormControl>
                          <Input placeholder="@usuario" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>} />
                  
                  <FormField control={signupForm.control} name="password" render={({
                  field
                }) => <FormItem>
                        <FormLabel>Senha * (Crie uma senha com 6 caracteres ou números)</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="******" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>} />
                  <FormField control={signupForm.control} name="confirmPassword" render={({
                  field
                }) => <FormItem>
                        <FormLabel>Confirmar Senha *</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="******" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>} />
                  
                  <div className="text-sm text-gray-500">
                    <span className="text-red-500">* Campos obrigatórios</span>
                  </div>
                  
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Cadastrando..." : "Cadastrar"}
                  </Button>
                </form>
              </Form>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex flex-col items-center">
          <Button variant="link" onClick={() => navigate('/')}>
            Voltar para o site
          </Button>
        </CardFooter>
      </Card>
    </div>;
};
export default Auth;