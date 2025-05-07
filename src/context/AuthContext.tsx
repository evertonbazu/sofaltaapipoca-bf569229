
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
        .select('id, username, role')
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

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Starting login for:', email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
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
      
      // No need to return data, the onAuthStateChange listener will update the state
    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        title: "Error logging in",
        description: error.message || "Could not log in. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const signUp = async (email: string, password: string, username: string) => {
    try {
      console.log('Starting registration for:', email, username);
      
      // Set up user data, including username in metadata
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { username },
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
    } catch (error: any) {
      console.error('Registration error:', error);
      toast({
        title: "Error creating account",
        description: error.message || "Could not create account. Please try again.",
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
