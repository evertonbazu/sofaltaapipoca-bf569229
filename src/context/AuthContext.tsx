
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AuthState, UserProfile, LoginCredentials, SignupCredentials, ResetPasswordCredentials, UpdatePasswordCredentials, UpdateProfileCredentials, AuthContextType } from '@/types/authTypes';
import { useToast } from '@/hooks/use-toast';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { toast } = useToast();
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    isLoading: true,
  });

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        
        // Update session state immediately (synchronous operation)
        setAuthState(prev => ({ ...prev, session }));
        
        // If user is authenticated, fetch profile data with setTimeout to avoid deadlocks
        if (session?.user) {
          setTimeout(() => {
            fetchUserProfile(session.user.id);
          }, 0);
        } else {
          setAuthState(prev => ({ ...prev, user: null, isLoading: false }));
        }
      }
    );

    // THEN check for existing session
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
    console.log('Fetching user profile:', userId);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, role, email')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
        throw error;
      }

      console.log('Profile found:', data);
      setAuthState(prev => ({
        ...prev,
        user: data as UserProfile,
        isLoading: false,
      }));
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const signIn = async (credentials: LoginCredentials) => {
    try {
      console.log('Starting login for:', credentials.email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });
      
      if (error) {
        // Improve error message for unconfirmed email
        if (error.message === "Email not confirmed" || error.code === "email_not_confirmed") {
          throw new Error("Um email foi enviado para você, por favor confirme-o em sua caixa de entrada");
        }
        throw error;
      }
      
      console.log('Login successful:', data?.user?.id);
      return { success: true };
    } catch (error: any) {
      console.error('Login error:', error);
      return { success: false, message: error.message };
    }
  };

  const signUp = async (credentials: SignupCredentials) => {
    try {
      console.log('Starting registration for:', credentials.email, credentials.username);
      
      // Set up user data, including username in metadata
      const { data, error } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        options: {
          data: { username: credentials.username },
        }
      });
      
      if (error) throw error;
      
      console.log('Registration successful:', data?.user?.id);
      
      // Update profiles table with username and email
      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ 
            username: credentials.username, 
            email: credentials.email,
            senha: credentials.password // Store password in profiles table as requested
          })
          .eq('id', data.user.id);
        
        if (profileError) {
          console.error('Error updating profile:', profileError);
        }
      }
      
      // We no longer auto-login after registration since email needs to be confirmed
      // The user will be redirected to the main page but will need to confirm their email
      return { success: true };
    } catch (error: any) {
      console.error('Registration error:', error);
      return { success: false, message: error.message };
    }
  };

  const updateProfile = async (credentials: UpdateProfileCredentials) => {
    try {
      if (!authState.user) {
        throw new Error("You must be logged in to update your profile");
      }

      // First, try to update the username in the profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          username: credentials.username,
          email: credentials.email,
          updated_at: new Date().toISOString()
        })
        .eq('id', authState.user.id);

      if (profileError) throw profileError;

      // If we need to update the email in auth.users too, we'd do that here
      if (credentials.email && credentials.email !== authState.user.email) {
        const { error: authError } = await supabase.auth.updateUser({
          email: credentials.email,
        });

        if (authError) throw authError;
      }

      // Refetch user profile to update the authState
      fetchUserProfile(authState.user.id);

      toast({
        title: "Perfil atualizado",
        description: "Seu perfil foi atualizado com sucesso.",
      });

      return { success: true };
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: "Erro ao atualizar perfil",
        description: error.message || "Não foi possível atualizar o perfil. Por favor tente novamente.",
        variant: "destructive",
      });
      return { success: false, message: error.message };
    }
  };

  const updatePassword = async (credentials: UpdatePasswordCredentials) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: credentials.password,
      });

      if (error) throw error;

      toast({
        title: "Senha atualizada",
        description: "Sua senha foi atualizada com sucesso.",
      });

      return { success: true };
    } catch (error: any) {
      console.error('Error updating password:', error);
      toast({
        title: "Erro ao atualizar senha",
        description: error.message || "Não foi possível atualizar a senha. Por favor tente novamente.",
        variant: "destructive",
      });
      return { success: false, message: error.message };
    }
  };

  const resetPassword = async (credentials: ResetPasswordCredentials) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        credentials.email,
        {
          redirectTo: window.location.origin + '/reset-password',
        }
      );

      if (error) throw error;

      toast({
        title: "Email de redefinição de senha enviado",
        description: "Verifique seu email para um link para redefinir sua senha.",
      });

      return { success: true };
    } catch (error: any) {
      console.error('Error resetting password:', error);
      toast({
        title: "Erro ao redefinir senha",
        description: error.message || "Não foi possível enviar o email de redefinição de senha. Por favor tente novamente.",
        variant: "destructive",
      });
      return { success: false, message: error.message };
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
        title: "Logout bem-sucedido",
        description: "Você foi desconectado da sua conta.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao fazer logout",
        description: error.message || "Não foi possível fazer logout. Por favor tente novamente.",
        variant: "destructive",
      });
    }
  };

  const isAdmin = () => {
    return authState.user?.role === 'admin';
  };

  return (
    <AuthContext.Provider value={{ 
      authState, 
      signIn, 
      signUp, 
      signOut, 
      resetPassword,
      updatePassword,
      updateProfile,
      isAdmin 
    }}>
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
