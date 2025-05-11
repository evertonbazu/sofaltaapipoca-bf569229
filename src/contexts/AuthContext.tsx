
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAdmin: boolean;
}

interface AuthContextType {
  authState: AuthState;
  login: (email: string, password: string) => Promise<{ error: any }>;
  signup: (email: string, password: string) => Promise<{ error: any }>;
  logout: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<{ error: any }>;
  resetPassword: (password: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    isLoading: true,
    isAdmin: false,
  });

  useEffect(() => {
    // Check active session
    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }
        
        if (session) {
          const { data: { user } } = await supabase.auth.getUser();
          
          // Check if user is admin
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', user?.id)
            .single();
          
          const isAdmin = profile?.is_admin || false;
          
          setAuthState({
            user,
            session,
            isLoading: false,
            isAdmin,
          });
        } else {
          setAuthState({
            user: null,
            session: null,
            isLoading: false,
            isAdmin: false,
          });
        }
      } catch (error: any) {
        console.error('Error getting session:', error.message);
        setAuthState({
          user: null,
          session: null,
          isLoading: false,
          isAdmin: false,
        });
      }
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session) {
          const { data: { user } } = await supabase.auth.getUser();
          
          // Check if user is admin
          const { data: profile } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', user?.id)
            .single();
          
          const isAdmin = profile?.is_admin || false;
          
          setAuthState({
            user,
            session,
            isLoading: false,
            isAdmin,
          });
        } else {
          setAuthState({
            user: null,
            session: null,
            isLoading: false,
            isAdmin: false,
          });
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      
      return { error: null };
    } catch (error: any) {
      return { error };
    }
  };

  const signup = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      
      // Criar entrada na tabela de profiles
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('profiles').insert({
          id: user.id,
          email: user.email,
          is_admin: false,
          created_at: new Date(),
        });
      }
      
      return { error: null };
    } catch (error: any) {
      return { error };
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error: any) {
      toast({
        title: "Erro ao sair",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const requestPasswordReset = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth?mode=reset`,
      });
      if (error) throw error;
      
      return { error: null };
    } catch (error: any) {
      return { error };
    }
  };

  const resetPassword = async (password: string) => {
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      
      return { error: null };
    } catch (error: any) {
      return { error };
    }
  };

  const contextValue = {
    authState,
    login,
    signup,
    logout,
    requestPasswordReset,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
