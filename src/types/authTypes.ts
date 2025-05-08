
export interface UserProfile {
  id: string;
  username?: string;
  email?: string;
  role: 'admin' | 'member' | 'user';
  created_at?: string;
  updated_at?: string;
}

export interface AuthState {
  user: UserProfile | null;
  session: any | null;
  isLoading: boolean;
  error?: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  email: string;
  password: string;
  username?: string;
}

export interface ResetPasswordCredentials {
  email: string;
}

export interface UpdatePasswordCredentials {
  password: string;
}

export interface UpdateProfileCredentials {
  username?: string;
  email?: string;
}

export interface AuthContextType {
  authState: AuthState;
  signIn: (credentials: LoginCredentials) => Promise<{ success: boolean; message?: string }>;
  signUp: (credentials: SignupCredentials) => Promise<{ success: boolean; message?: string }>;
  signOut: () => Promise<void>;
  resetPassword: (credentials: ResetPasswordCredentials) => Promise<{ success: boolean; message?: string }>;
  updatePassword: (credentials: UpdatePasswordCredentials) => Promise<{ success: boolean; message?: string }>;
  updateProfile: (credentials: UpdateProfileCredentials) => Promise<{ success: boolean; message?: string }>;
  isAdmin: () => boolean;
}
