import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: number;
  username: string;
  role: 'admin' | 'salesman';
}

interface AuthState {
  token: string | null;
  user: User | null;
  set_auth: (token: string, user: User) => void;
  clear_auth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      set_auth: (token, user) => {
        localStorage.setItem('access_token', token);
        set({ token, user });
      },
      clear_auth: () => {
        localStorage.removeItem('access_token');
        set({ token: null, user: null });
      },
    }),
    { name: 'erp_samas_auth' }
  )
);
