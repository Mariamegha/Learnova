import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserState {
  isAuthenticated: boolean;
  authMode: 'local' | 'supabase' | null;
  user: {
    name: string;
    email: string;
    xp: number;
    level: number;
    streak: number;
  } | null;
  login: (email: string, name: string, authMode?: 'local' | 'supabase') => void;
  logout: () => void;
  addXP: (amount: number) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      authMode: null,
      user: null,
      login: (email, name, authMode = 'supabase') =>
        set({
          isAuthenticated: true,
          authMode,
          user: { name, email, xp: 0, level: 1, streak: 0 },
        }),
      logout: () =>
        set({
          isAuthenticated: false,
          authMode: null,
          user: null,
        }),
      addXP: (amount) =>
        set((state) => {
          if (!state.user) return state;
          const newXP = state.user.xp + amount;
          const newLevel = Math.floor(newXP / 100) + 1;
          return {
            user: {
              ...state.user,
              xp: newXP,
              level: newLevel,
            },
          };
        }),
    }),
    {
      name: 'edumite-user',
    }
  )
);
