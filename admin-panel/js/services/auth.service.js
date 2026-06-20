/**
 * Auth Service - Gestión de autenticación y usuarios
 * Maneja login, registro, logout y gestión de sesión
 */

import { apiService } from './api.service.js';
import { API_ENDPOINTS, AUTH_CONFIG } from '../config.js';

class AuthService {
  constructor() {
    this.currentUser = this.loadUser();
    this.token = apiService.getToken();
  }

  /**
   * Cargar usuario desde localStorage
   */
  loadUser() {
    const user = localStorage.getItem(AUTH_CONFIG.USER_KEY);
    return user ? JSON.parse(user) : null;
  }

  /**
   * Guardar usuario en localStorage
   */
  saveUser(user) {
    this.currentUser = user;
    localStorage.setItem(AUTH_CONFIG.USER_KEY, JSON.stringify(user));
  }

  /**
   * Obtener usuario actual
   */
  getCurrentUser() {
    return this.currentUser;
  }

  /**
   * Verificar si usuario está autenticado
   */
  isAuthenticated() {
    return !!this.token && this.token !== 'DEMO' && !!this.currentUser;
  }

  /**
   * Verificar si está en modo demo
   */
  isDemo() {
    return this.token === 'DEMO';
  }

  /**
   * Login con email y contraseña
   * @param {string} email
   * @param {string} password
   * @returns {Promise<Object>} - Usuario y token
   */
  async login(email, password) {
    try {
      const response = await apiService.post(API_ENDPOINTS.AUTH.LOGIN, {
        email,
        password
      });

      // Guardar token, refresh token y usuario
      this.token = response.accessToken;
      apiService.setToken(response.accessToken);
      if (response.refreshToken) {
        localStorage.setItem(AUTH_CONFIG.REFRESH_TOKEN_KEY, response.refreshToken);
      } else {
        localStorage.removeItem(AUTH_CONFIG.REFRESH_TOKEN_KEY);
      }
      this.saveUser(response.user);

      return {
        success: true,
        user: response.user,
        token: response.accessToken
      };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  /**
   * Login en modo demo (para desarrollo)
   */
  loginDemo() {
    this.token = 'DEMO';
    this.currentUser = {
      id: 999,
      name: 'Admin Demo',
      email: 'admin@demo.local',
      role: 'admin'
    };
    apiService.setToken('DEMO');
    this.saveUser(this.currentUser);

    return {
      success: true,
      user: this.currentUser,
      token: 'DEMO',
      isDemo: true
    };
  }

  /**
   * Register - Crear nuevo usuario
   * @param {Object} userData - {email, password, name, role}
   * @returns {Promise<Object>}
   */
  async register(userData) {
    try {
      const payload = {
        name: userData.name,
        email: userData.email,
        password: userData.password,
        role: String(userData.role || '').toLowerCase()
      };

      if (userData.phone) {
        payload.phone = userData.phone;
      }

      if (userData.vehicleProfile) {
        payload.vehicleProfile = userData.vehicleProfile;
      }

      const response = await apiService.post(API_ENDPOINTS.AUTH.REGISTER, payload);
      return {
        success: true,
        user: response
      };
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  }

  /**
   * Crear usuario como admin vía /users (dispara auditoría backend)
   */
  async adminCreateUser(userData) {
    try {
      const payload = {
        name: userData.name,
        email: userData.email,
        password: userData.password,
        role: String(userData.role || '').toLowerCase()
      };

      if (userData.phone) {
        payload.phone = userData.phone;
      }

      return await apiService.post(API_ENDPOINTS.USERS.LIST_ALL, payload);
    } catch (error) {
      console.error('Admin create user error:', error);
      throw error;
    }
  }

  /**
   * Logout - Cerrar sesión
   */
  async logout() {
    try {
      // Llamar al endpoint de logout si está disponible
      if (!this.isDemo()) {
        const refreshToken = localStorage.getItem(AUTH_CONFIG.REFRESH_TOKEN_KEY);
        if (refreshToken) {
          await apiService.post(API_ENDPOINTS.AUTH.LOGOUT, {
            refreshToken
          }).catch(() => {}); // Ignorar errores en logout
        }
      }

      // Limpiar datos locales
      this.currentUser = null;
      this.token = null;
      apiService.clearToken();
      localStorage.removeItem(AUTH_CONFIG.USER_KEY);
      localStorage.removeItem(AUTH_CONFIG.REFRESH_TOKEN_KEY);

      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      // Limpiar de todos modos
      this.currentUser = null;
      this.token = null;
      apiService.clearToken();
      return { success: true };
    }
  }

  /**
   * Refresh token - Renovar sesión
   */
  async refreshToken() {
    try {
      const refreshToken = localStorage.getItem(AUTH_CONFIG.REFRESH_TOKEN_KEY);
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await apiService.post(API_ENDPOINTS.AUTH.REFRESH, {
        refreshToken
      });

      this.token = response.accessToken;
      apiService.setToken(response.accessToken);

      return { success: true, token: response.accessToken };
    } catch (error) {
      console.error('Refresh error:', error);
      // Si falla el refresh, logout
      await this.logout();
      throw error;
    }
  }

  /**
   * Obtener perfil del usuario actual
   */
  async getProfile() {
    try {
      const profile = await apiService.get(API_ENDPOINTS.USERS.GET_PROFILE);
      this.saveUser(profile);
      return profile;
    } catch (error) {
      console.error('Get profile error:', error);
      throw error;
    }
  }

  /**
   * Actualizar perfil
   */
  async updateProfile(profileData) {
    try {
      const updated = await apiService.patch(
        API_ENDPOINTS.USERS.UPDATE_PROFILE,
        profileData
      );
      this.saveUser(updated);
      return updated;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  }

  /**
   * Obtener un usuario por ID (solo ADMIN)
   */
  async getUserById(userId) {
    try {
      return await apiService.get(API_ENDPOINTS.USERS.GET_ONE(userId));
    } catch (error) {
      console.error('Get user error:', error);
      throw error;
    }
  }

  /**
   * Actualizar un usuario (solo ADMIN) - patch parcial
   */
  async adminUpdateUser(userId, data) {
    try {
      return await apiService.patch(API_ENDPOINTS.USERS.GET_ONE(userId), data);
    } catch (error) {
      console.error('Admin update user error:', error);
      throw error;
    }
  }

  /**
   * Eliminar un usuario (solo ADMIN)
   */
  async deleteUser(userId) {
    try {
      return await apiService.delete(API_ENDPOINTS.USERS.GET_ONE(userId));
    } catch (error) {
      console.error('Delete user error:', error);
      throw error;
    }
  }

  /**
   * Listar todos los usuarios (solo ADMIN)
   */
  async listAllUsers() {
    try {
      return await apiService.get(API_ENDPOINTS.USERS.LIST_ALL);
    } catch (error) {
      console.error('List users error:', error);
      throw error;
    }
  }
}

// Exportar instancia singleton
export const authService = new AuthService();
