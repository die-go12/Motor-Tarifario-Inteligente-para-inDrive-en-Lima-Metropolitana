/**
 * Configuración centralizada de la aplicación
 * Define URLs de APIs, credenciales de demo, y constantes globales
 */

export const API_CONFIG = {
  // URLs del Backend - Usar API Gateway (puerto 3000) como punto de entrada
  GATEWAY: localStorage.getItem('api_gateway_url') || 'http://localhost:3000',
  MS_BASE: localStorage.getItem('ms_base_url') || 'http://localhost:3001',
  MS_PRICING: localStorage.getItem('ms_pricing_url') || 'http://localhost:3002',
  
  // Seleccionar cuál usar (recomendado: GATEWAY)
  get BASE_URL() {
    return this.GATEWAY;
  }
};

export const AUTH_CONFIG = {
  TOKEN_KEY: 'access_token',
  REFRESH_TOKEN_KEY: 'refresh_token',
  USER_KEY: 'current_user',
  
  // Credenciales de demo para desarrollo
  DEMO_CREDENTIALS: {
    email: 'admin@indrive.pe',
    password: 'Admin1234'
  }
};

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout'
  },
  TRIPS: {
    LIST: '/trips',
    CREATE: '/trips',
    GET_ONE: (id) => `/trips/${id}`,
    GET_AVAILABLE: '/trips/available',
    ASSIGN: (id) => `/trips/${id}/assign`,
    START: (id) => `/trips/${id}/start`,
    COMPLETE: (id) => `/trips/${id}/complete`,
    CANCEL: (id) => `/trips/${id}/cancel`
  },
  USERS: {
    GET_PROFILE: '/users/me',
    UPDATE_PROFILE: '/users/me',
    LIST_ALL: '/users',
    GET_ONE: (id) => `/users/${id}`
  },
  PRICING: {
    QUOTE: '/pricing/quote',
    SETTLE: '/pricing/settle',
    GET_CONFIG: '/pricing/config',
    UPDATE_CONFIG: '/pricing/config'
  }
};

export const USER_ROLES = {
  ADMIN: 'ADMIN',
  DRIVER: 'DRIVER',
  PASSENGER: 'PASSENGER'
};

export const TRIP_STATUS = {
  SEARCHING: 'SEARCHING',
  ASSIGNED: 'ASSIGNED',
  ACTIVE: 'ACTIVE',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED'
};

// Constantes UI
export const UI_CONSTANTS = {
  TOAST_DURATION: 3000,
  DEFAULT_TIMEOUT: 10000
};
