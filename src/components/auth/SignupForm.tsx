
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CardContent, CardFooter } from "@/components/ui/card";
import { useAuth } from '@/hooks/use-auth';

interface SignupFormProps {
  setShowVerifyMessage: (show: boolean) => void;
  setActiveTab: (tab: string) => void;
}

const SignupForm: React.FC<SignupFormProps> = ({ setShowVerifyMessage, setActiveTab }) => {
  const { signUp } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    setIsLoading(true);
    try {
      console.log('Tentando registrar:', email, username);
      const result = await signUp(email, password, username);
      if (result.success) {
        // Show verification message
        setShowVerifyMessage(true);
        setActiveTab('signin');
      } else if (result.message) {
        setError(result.message);
      }
    } catch (error: any) {
      console.error('Erro de registro:', error);
      setError(error.message || 'Falha no registro. Por favor, tente novamente mais tarde.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="signup-email">E-mail</label>
          <Input 
            id="signup-email" 
            type="email" 
            placeholder="seu@email.com" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="username">Nome de Usuário</label>
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
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
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
  );
};

export default SignupForm;
