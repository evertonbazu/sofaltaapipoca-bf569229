
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Navigate, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare } from 'lucide-react';

const Auth: React.FC = () => {
  const { authState, signIn, signUp } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('signin');
  const navigate = useNavigate();

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Signup form state
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  // Check if user is already authenticated
  useEffect(() => {
    if (authState.user && !authState.isLoading) {
      navigate('/');
    }
  }, [authState.user, authState.isLoading, navigate]);

  // Se o usuário já estiver autenticado, redirecionamos para a home
  if (authState.user && !authState.isLoading) {
    return <Navigate to="/" />;
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      // Usar um console.log para depuração
      console.log('Tentando login com:', loginEmail);
      await signIn(loginEmail, loginPassword);
      // Se o login for bem-sucedido, o hook useAuth irá atualizar o estado e redirecionar
    } catch (error: any) {
      console.error('Erro de login:', error);
      setError(error.message || 'Falha no login. Verifique suas credenciais.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (signupPassword !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    setIsLoading(true);
    try {
      console.log('Tentando cadastrar:', signupEmail, username);
      await signUp(signupEmail, signupPassword, username);
      // Se o cadastro for bem-sucedido, o hook useAuth já fará login automático e redirecionará
    } catch (error: any) {
      console.error('Erro de cadastro:', error);
      setError(error.message || 'Falha no cadastro. Tente novamente mais tarde.');
    } finally {
      setIsLoading(false);
    }
  };

  if (authState.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-gradient-indigo text-white py-4 sm:py-6">
        <div className="container mx-auto px-3 sm:px-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-center">🍿 Só Falta a Pipoca</h1>
          <p className="text-center text-base sm:text-lg mt-2">Assinaturas premium com preços exclusivos</p>
        </div>
      </header>

      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Bem-vindo</CardTitle>
            <CardDescription className="text-center">
              {activeTab === 'signin' 
                ? 'Faça login para acessar sua conta' 
                : 'Crie sua conta para começar'
              }
            </CardDescription>
          </CardHeader>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="signin">Entrar</TabsTrigger>
              <TabsTrigger value="signup">Cadastrar</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin">
              <form onSubmit={handleSignIn}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="email">E-mail</label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="seu@email.com" 
                      value={loginEmail} 
                      onChange={(e) => setLoginEmail(e.target.value)} 
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium" htmlFor="password">Senha</label>
                    </div>
                    <Input 
                      id="password" 
                      type="password" 
                      placeholder="••••••••" 
                      value={loginPassword} 
                      onChange={(e) => setLoginPassword(e.target.value)} 
                      required 
                    />
                  </div>
                  {error && <p className="text-sm font-medium text-red-500">{error}</p>}
                </CardContent>
                
                <CardFooter>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Entrando...' : 'Entrar'}
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignUp}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="signup-email">E-mail</label>
                    <Input 
                      id="signup-email" 
                      type="email" 
                      placeholder="seu@email.com" 
                      value={signupEmail} 
                      onChange={(e) => setSignupEmail(e.target.value)} 
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="username">Nome de usuário</label>
                    <Input 
                      id="username" 
                      type="text" 
                      placeholder="Seu nome de usuário" 
                      value={username} 
                      onChange={(e) => setUsername(e.target.value)} 
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="signup-password">Senha</label>
                    <Input 
                      id="signup-password" 
                      type="password" 
                      placeholder="••••••••" 
                      value={signupPassword} 
                      onChange={(e) => setSignupPassword(e.target.value)} 
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="confirm-password">Confirmar Senha</label>
                    <Input 
                      id="confirm-password" 
                      type="password" 
                      placeholder="••••••••" 
                      value={confirmPassword} 
                      onChange={(e) => setConfirmPassword(e.target.value)} 
                      required 
                    />
                  </div>
                  {error && <p className="text-sm font-medium text-red-500">{error}</p>}
                </CardContent>
                
                <CardFooter>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Cadastrando...' : 'Cadastrar'}
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>
          </Tabs>
          
          <div className="px-8 pb-6 pt-2">
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <MessageSquare className="h-4 w-4" />
              <a href="https://wa.me/5513992077804" className="text-blue-600 hover:underline">Precisa de ajuda?</a>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
