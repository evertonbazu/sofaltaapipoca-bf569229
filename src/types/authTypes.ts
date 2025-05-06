
export interface UserProfile {
  id: string;
  username?: string;
  role: 'admin' | 'member';
}

export interface AuthState {
  user: UserProfile | null;
  session: any | null;
  isLoading: boolean;
}
