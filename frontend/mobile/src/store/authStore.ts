import {create} from 'zustand';
import {AuthState, User} from '../types';

export const useAuthStore = create<AuthState>(set => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  setUser: (user: User | null) =>
    set({user, isAuthenticated: !!user, isLoading: false}),

  setLoading: (isLoading: boolean) => set({isLoading}),

  logout: () => set({user: null, isAuthenticated: false, isLoading: false}),
}));
