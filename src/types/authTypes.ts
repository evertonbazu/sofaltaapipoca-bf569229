
export interface UserProfile {
  id: string;
  username?: string;
  email?: string;
  role: 'admin' | 'member' | 'user';
}

export interface AuthState {
  user: UserProfile | null;
  session: any | null;
  isLoading: boolean;
}
