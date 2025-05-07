
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AuthState, UserProfile } from '@/types/authTypes';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  authState: AuthState;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signOut: () => Promise<void>;
  isAdmin: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { toast } = useToast();
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    isLoading: true,
  });

  useEffect(() => {
    // Configurar o listener de mudança de estado de autenticação PRIMEIRO
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        
        // Atualiza o estado da sessão imediatamente (operação síncrona)
        setAuthState(prev => ({ ...prev, session }));
        
        // Se tiver um usuário autenticado, busca os dados do perfil com setTimeout para evitar deadlocks
        if (session?.user) {
          setTimeout(() => {
            fetchUserProfile(session.user.id);
          }, 0);
        } else {
          setAuthState(prev => ({ ...prev, user: null, isLoading: false }));
        }
      }
    );

    // DEPOIS verifica se existe uma sessão
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Current session:', session?.user?.id);
      setAuthState(prev => ({ ...prev, session }));
      
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (userId: string) => {
    console.log('Buscando perfil do usuário:', userId);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, role')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Erro ao buscar perfil:', error);
        throw error;
      }

      console.log('Perfil encontrado:', data);
      setAuthState(prev => ({
        ...prev,
        user: data as UserProfile,
        isLoading: false,
      }));
    } catch (error) {
      console.error('Erro ao buscar perfil do usuário:', error);
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Iniciando login para:', email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        // Melhorar a mensagem de erro para email não confirmado
        if (error.message === "Email not confirmed" || error.code === "email_not_confirmed") {
          throw new Error("Um email foi enviado para você, faça a confirmação em sua caixa de entrada");
        }
        throw error;
      }
      
      console.log('Login bem-sucedido:', data?.user?.id);
      toast({
        title: "Login realizado com sucesso",
        description: "Você foi autenticado com sucesso.",
      });
      
      // O listener onAuthStateChange irá atualizar o estado
      return data;
    } catch (error: any) {
      console.error('Erro de login:', error);
      toast({
        title: "Erro ao fazer login",
        description: error.message || "Não foi possível fazer login. Tente novamente.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const signUp = async (email: string, password: string, username: string) => {
    try {
      console.log('Iniciando registro para:', email, username);
      
      // Configurar os dados do usuário, incluindo o username nos metadados
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { username },
        }
      });
      
      if (error) throw error;
      
      console.log('Cadastro bem-sucedido:', data?.user?.id);
      
      toast({
        title: "Cadastro realizado com sucesso!",
        description: "Um email de verificação foi enviado para sua caixa de entrada. Confirme seu email para continuar.",
      });
      
      // Não fazemos mais o auto-login após o registro, pois o email precisa ser confirmado
      // O usuário será redirecionado para a página principal, mas precisará confirmar o email
    } catch (error: any) {
      console.error('Erro de cadastro:', error);
      toast({
        title: "Erro ao criar conta",
        description: error.message || "Não foi possível criar a conta. Tente novamente.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setAuthState({
        user: null,
        session: null,
        isLoading: false,
      });
      toast({
        title: "Saiu com sucesso",
        description: "Você foi desconectado da sua conta.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao sair",
        description: error.message || "Não foi possível sair. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const isAdmin = () => {
    return authState.user?.role === 'admin';
  };

  return (
    <AuthContext.Provider value={{ authState, signIn, signUp, signOut, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
