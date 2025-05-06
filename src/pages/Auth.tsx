
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from '@/context/AuthContext';
import { Home, Loader2 } from 'lucide-react';

const Auth: React.FC = () => {
  const { signIn, signUp, authState } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  
  // Form states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    document.title = 'Entrar | Só Falta a Pipoca';
    
    // If user is already logged in, redirect to home
    if (authState.user) {
      navigate('/');
    }
  }, [authState.user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      await signIn(loginEmail, loginPassword);
      navigate('/');
    } catch (error) {
      console.error('Login error:', error);
      setError('Falha ao fazer login. Verifique suas credenciais.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (registerPassword !== confirmPassword) {
      setError('As senhas não correspondem.');
      return;
    }
    
    setIsLoading(true);
    
    try {
      await signUp(registerEmail, registerPassword, username);
      // The Auth Context already handles redirects after successful sign-up
    } catch (error) {
      console.error('Registration error:', error);
      setError('Falha ao registrar. O e-mail já pode estar em uso.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header Navigation */}
      <div className="bg-slate-100 p-4 mb-6">
        <div className="container mx-auto flex justify-between items-center">
          <Button 
            variant="default" 
            className="flex gap-2"
            onClick={() => navigate('/')}
          >
            <Home className="h-5 w-5" />
            Voltar ao Início
          </Button>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-bold text-center mb-4">🍿 Só Falta a Pipoca</h1>
          
          <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Entrar</TabsTrigger>
              <TabsTrigger value="register">Cadastrar</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <Card>
                <form onSubmit={handleLogin}>
                  <CardHeader>
                    <CardTitle>Entrar</CardTitle>
                    <CardDescription>
                      Acesse sua conta para gerenciar seus anúncios.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {error && (
                      <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
                        {error}
                      </div>
                    )}
                    <div className="space-y-2">
                      <Label htmlFor="login-email">E-mail</Label>
                      <Input 
                        id="login-email" 
                        type="email" 
                        placeholder="seu@email.com" 
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="login-password">Senha</Label>
                      <Input 
                        id="login-password" 
                        type="password" 
                        placeholder="••••••••" 
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        required
                      />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Entrando...
                        </>
                      ) : 'Entrar'}
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>
            
            <TabsContent value="register">
              <Card>
                <form onSubmit={handleRegister}>
                  <CardHeader>
                    <CardTitle>Criar Conta</CardTitle>
                    <CardDescription>
                      Crie sua conta para começar a anunciar.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {error && (
                      <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
                        {error}
                      </div>
                    )}
                    <div className="space-y-2">
                      <Label htmlFor="username">Nome de Usuário</Label>
                      <Input 
                        id="username" 
                        placeholder="Seu nome de usuário" 
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-email">E-mail</Label>
                      <Input 
                        id="register-email" 
                        type="email" 
                        placeholder="seu@email.com" 
                        value={registerEmail}
                        onChange={(e) => setRegisterEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-password">Senha</Label>
                      <Input 
                        id="register-password" 
                        type="password" 
                        placeholder="••••••••" 
                        value={registerPassword}
                        onChange={(e) => setRegisterPassword(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirmar Senha</Label>
                      <Input 
                        id="confirm-password" 
                        type="password" 
                        placeholder="••••••••" 
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Registrando...
                        </>
                      ) : 'Cadastrar'}
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="bg-gray-100 py-4 text-center text-sm text-gray-600">
        <div className="container mx-auto">
          <p>© 2025 🍿 Só Falta a Pipoca - Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default Auth;
