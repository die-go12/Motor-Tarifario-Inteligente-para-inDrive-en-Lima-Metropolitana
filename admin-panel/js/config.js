/**
 * Configuración centralizada de la aplicación
 * Define URLs de APIs, credenciales de demo, y constantes globales
*/
export const AUTH_CONFIG = {
  TOKEN_KEY: 'ACCESS_TOKEN',
  REFRESH_TOKEN_KEY: 'REFRESH_TOKEN',
  USER_KEY: 'CURRENT_USER'
};

export const API_CONFIG = {
  // Se usan URL directas de cada servicio cuando la gateway no proxea pricing/WS
  GATEWAY: localStorage.getItem('api_gateway_url') || 'http://localhost:3000',

  get MS_BASE() {
    return localStorage.getItem('ms_base_url') || 'http://localhost:3001';
  },

  get MS_PRICING() {
    return localStorage.getItem('ms_pricing_url') || 'http://localhost:3002';
  },

  get BASE_URL() {
    return this.GATEWAY;
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
    LIST_ADMIN: '/trips/all',
    CREATE: '/trips',
    QUOTE: '/trips/quote',
    GET_ONE: (id) => `/trips/${id}`,
    GET_AVAILABLE: '/trips/available',
    ASSIGN: (id) => `/trips/${id}/assign`,
    START: (id) => `/trips/${id}/start`,
    COMPLETE: (id) => `/trips/${id}/complete`,
    CANCEL: (id) => `/trips/${id}/cancel`,
    OFFERS: (id) => `/trips/${id}/offers`,
    OFFERS_ACCEPT: (tripId, offerId) => `/trips/${tripId}/offers/${offerId}/accept`
  },
  USERS: {
    GET_PROFILE: '/users/me',
    UPDATE_PROFILE: '/users/me',
    LIST_ALL: '/users',
    GET_ONE: (id) => `/users/${id}`
  },
  PRICING: {
    QUOTE: '/pricing/quote',
    GET_CONFIG: '/pricing/config',
    UPDATE_CONFIG: '/pricing/config',
    ANOMALIES: '/pricing/anomalies'
  },
  REPORTS: {
    SUMMARY: '/reports/summary'
  },
  VEHICLES: {
    LIST: '/vehicles',
    ME: '/vehicles/me',
    BY_DRIVER: (driverId) => `/vehicles/driver/${driverId}`,
    UPSERT_BY_DRIVER: (driverId) => `/vehicles/driver/${driverId}`
  }
};

export const USER_ROLES = {
  ADMIN: 'admin',
  DRIVER: 'driver',
  PASSENGER: 'passenger',
  AUDITOR: 'auditor'
};

export const TRIP_STATUS = {
  SEARCHING: 'SEARCHING',
  ASSIGNED: 'ASSIGNED',
  ACTIVE: 'IN_PROGRESS',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED'
};

// Constantes UI
export const UI_CONSTANTS = {
  TOAST_DURATION: 3000,
  DEFAULT_TIMEOUT: 10000
};
