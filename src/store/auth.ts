import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';
import { api, setAuthToken, setUnauthorizedHandler } from '@/services/api';
import type { User } from '@/services/types';

const TOKEN_KEY = 'petmotion.token';

interface AuthState {
  user: User | null;
  status: 'booting' | 'signedOut' | 'signedIn';
  bootstrap: () => Promise<void>;
  signIn: (token: string, user: User) => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuth = create<AuthState>((set, get) => ({
  user: null,
  status: 'booting',

  bootstrap: async () => {
    setUnauthorizedHandler(() => {
      if (get().status === 'signedIn') get().signOut();
    });
    const token = await SecureStore.getItemAsync(TOKEN_KEY);
    if (!token) return set({ status: 'signedOut' });

    setAuthToken(token);
    try {
      set({ user: await api.me(), status: 'signedIn' });
    } catch {
      setAuthToken(null);
      set({ status: 'signedOut' });
    }
  },

  signIn: async (token, user) => {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
    setAuthToken(token);
    set({ user, status: 'signedIn' });
  },

  signOut: async () => {
    api.logout().catch(() => undefined);
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    setAuthToken(null);
    set({ user: null, status: 'signedOut' });
  },
}));
