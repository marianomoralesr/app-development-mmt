import { create } from 'zustand';
import type { AuthStore } from '../types';

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  role: null,
  setUser: (user) => set({ user }),
  setRole: (role) => set({ role }),
}));