
// Certifica que o React é importado corretamente
import React, { createContext, useState, useEffect, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/components/ui/use-toast";

export interface AuthContextType {
  authState: {
    user: User | null;
    session: Session | null;
    isLoading: boolean;
    isAdmin: boolean;
  };
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userData?: any) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Utilizando useState do React
  const [authState, setAuthState] = useState<AuthContextType['authState']>({
    user: null,
    session: null,
    isLoading: true,
    isAdmin: false,
  });
  const { toast } = useToast();

  useEffect(() => {
    // Verificar sessão atual
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          const { user } = session;
          
          // Verificar se o usuário é admin
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();
          
          setAuthState({
            user,
            session,
            isLoading: false,
            isAdmin: profile?.role === 'admin'
          });
        } else {
          setAuthState({
            user: null,
            session: null,
            isLoading: false,
            isAdmin: false
          });
        }
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        setAuthState({
          user: null,
          session: null,
          isLoading: false,
          isAdmin: false
        });
      }
    };

    // Inscrever-se para alterações na autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session) {
          const { user } = session;
          
          // Usando setTimeout para evitar problemas de recursão
          setTimeout(async () => {
            try {
              // Verificar se o usuário é admin
              const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single();
              
              setAuthState({
                user,
                session,
                isLoading: false,
                isAdmin: profile?.role === 'admin'
              });
            } catch (error) {
              console.error('Erro ao verificar papel do usuário:', error);
              setAuthState({
                user,
                session,
                isLoading: false,
                isAdmin: false
              });
            }
          }, 0);
        } else {
          setAuthState({
            user: null,
            session: null,
            isLoading: false,
            isAdmin: false
          });
        }
      }
    );

    checkSession();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Função para fazer login
  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        toast({
          title: "Erro ao fazer login",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }

      toast({
        title: "Login realizado com sucesso",
        description: "Você está conectado agora.",
      });
    } catch (error: any) {
      console.error('Erro ao fazer login:', error);
      throw error;
    }
  };

  // Função para criar conta
  const signUp = async (email: string, password: string, userData?: any) => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: userData
        }
      });
      
      if (error) {
        toast({
          title: "Erro ao criar conta",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }

      toast({
        title: "Conta criada com sucesso",
        description: "Verifique seu email para confirmar o cadastro.",
      });
    } catch (error: any) {
      console.error('Erro ao criar conta:', error);
      throw error;
    }
  };


  // Função para fazer logout - Com tratamento adequado
  const signOut = async () => {
    try {
      // Verificar primeiro se existe uma sessão antes de tentar fazer logout
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (!sessionData.session) {
        // Se não há sessão, apenas atualizar o estado
        setAuthState({
          user: null,
          session: null,
          isLoading: false,
          isAdmin: false
        });
        
        toast({
          title: "Logout realizado",
          description: "Você foi desconectado.",
        });
        return;
      }
      
      // Se houver sessão, então fazer logout
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Erro ao fazer logout:', error);
        toast({
          title: "Erro ao fazer logout",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }

      // Atualizar estado após logout bem-sucedido
      setAuthState({
        user: null,
        session: null,
        isLoading: false,
        isAdmin: false
      });

      toast({
        title: "Logout realizado com sucesso",
        description: "Você foi desconectado.",
      });
    } catch (error: any) {
      console.error('Erro ao fazer logout:', error);
      // Em caso de erro, tente garantir que o estado local seja limpo
      setAuthState({
        user: null,
        session: null,
        isLoading: false,
        isAdmin: false
      });
      throw error;
    }
  };

  const contextValue: AuthContextType = {
    authState,
    signIn,
    signUp,
    signOut
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
