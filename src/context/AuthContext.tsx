
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AuthState, UserProfile, LoginCredentials, SignupCredentials, ResetPasswordCredentials, UpdatePasswordCredentials, UpdateProfileCredentials } from '@/types/authTypes';
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
          throw new Error("An email has been sent to you, please confirm it in your inbox");
        }
        throw error;
      }
      
      console.log('Login successful:', data?.user?.id);
      toast({
        title: "Login successful",
        description: "You have been successfully authenticated.",
      });
      
      return { success: true };
    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        title: "Error logging in",
        description: error.message || "Could not log in. Please try again.",
        variant: "destructive",
      });
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
      
      toast({
        title: "Registration successful!",
        description: "A verification email has been sent to your inbox. Please confirm your email to continue.",
      });
      
      // We no longer auto-login after registration since email needs to be confirmed
      // The user will be redirected to the main page but will need to confirm their email
      return { success: true };
    } catch (error: any) {
      console.error('Registration error:', error);
      toast({
        title: "Error creating account",
        description: error.message || "Could not create account. Please try again.",
        variant: "destructive",
      });
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
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });

      return { success: true };
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error updating profile",
        description: error.message || "Could not update profile. Please try again.",
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
        title: "Password updated",
        description: "Your password has been updated successfully.",
      });

      return { success: true };
    } catch (error: any) {
      console.error('Error updating password:', error);
      toast({
        title: "Error updating password",
        description: error.message || "Could not update password. Please try again.",
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
        title: "Password reset email sent",
        description: "Check your email for a link to reset your password.",
      });

      return { success: true };
    } catch (error: any) {
      console.error('Error resetting password:', error);
      toast({
        title: "Error resetting password",
        description: error.message || "Could not send password reset email. Please try again.",
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
        title: "Logged out successfully",
        description: "You have been disconnected from your account.",
      });
    } catch (error: any) {
      toast({
        title: "Error logging out",
        description: error.message || "Could not log out. Please try again.",
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
