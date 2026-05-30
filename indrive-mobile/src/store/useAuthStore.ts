import { create } from 'zustand';
import { api, saveToken, deleteToken, SECURE_KEYS } from '../services/api';

export type UserRole = 'PASSENGER' | 'DRIVER';

// Usuario tal como lo devuelve el backend (role en minúsculas, id numérico).
export interface BackendUser {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  activeRole: UserRole;
}

// Mapea el usuario del backend al perfil que usa la app.
export const toUserProfile = (u: BackendUser): UserProfile => ({
  id: String(u.id),
  name: u.name,
  email: u.email,
  activeRole: u.role.toUpperCase() as UserRole,
});

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  user: UserProfile | null;
  isAuthenticated: boolean;

  setSession: (
    token: string,
    refreshToken: string,
    backendUser: BackendUser,
  ) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: null,
  refreshToken: null,
  user: null,
  isAuthenticated: false,

  setSession: async (token, refreshToken, backendUser) => {
    await saveToken(SECURE_KEYS.accessToken, token);
    await saveToken(SECURE_KEYS.refreshToken, refreshToken);
    set({
      token,
      refreshToken,
      user: toUserProfile(backendUser),
      isAuthenticated: true,
    });
  },

  logout: async () => {
    const { refreshToken } = get();
    try {
      await api.post('/auth/logout', { refreshToken });
    } catch {
      // Ignorar errores al cerrar sesión en el servidor
    }
    await deleteToken(SECURE_KEYS.accessToken);
    await deleteToken(SECURE_KEYS.refreshToken);
    set({
      token: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
    });
  },
}));
