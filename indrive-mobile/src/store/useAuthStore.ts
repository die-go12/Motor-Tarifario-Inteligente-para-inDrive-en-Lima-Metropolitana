import { create } from 'zustand';
import { api, saveToken, deleteToken, SECURE_KEYS } from '../services/api';

export type UserRole = 'PASSENGER' | 'DRIVER';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  activeRole: UserRole;
}

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  user: UserProfile | null;
  isAuthenticated: boolean;

  // Acciones
  setSession: (token: string, refreshToken: string, user: UserProfile) => Promise<void>;
  switchRole: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: null,
  refreshToken: null,
  user: null,
  isAuthenticated: false,

  setSession: async (token, refreshToken, user) => {
    await saveToken(SECURE_KEYS.accessToken, token);
    await saveToken(SECURE_KEYS.refreshToken, refreshToken);
    set({ token, refreshToken, user, isAuthenticated: true });
  },

  switchRole: async () => {
    const { user } = get();
    if (!user) return;

    const newRole: UserRole =
      user.activeRole === 'PASSENGER' ? 'DRIVER' : 'PASSENGER';

    // Notificar al backend el cambio de disponibilidad del conductor
    try {
      await api.patch('/users/role', { activeRole: newRole });
    } catch (error) {
      console.warn('[AuthStore] No se pudo notificar el cambio de rol al backend:', error);
    }

    set({
      user: { ...user, activeRole: newRole },
    });
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignorar errores al hacer logout en el servidor
    }
    await deleteToken(SECURE_KEYS.accessToken);
    await deleteToken(SECURE_KEYS.refreshToken);
    set({ token: null, refreshToken: null, user: null, isAuthenticated: false });
  },
}));
