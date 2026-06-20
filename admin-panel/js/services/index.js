/**
 * Index - Exportar todos los servicios
 * Importa este archivo para acceder a todos los servicios disponibles
 */

export { apiService } from './api.service.js';
export { authService } from './auth.service.js';
export { socketService } from './socket.service.js';
export { tripsService } from './trips.service.js';
export { reportsService } from './reports.service.js';
export { vehiclesService } from './vehicles.service.js';
export { pricingService } from './pricing.service.js';

// Re-exportar configuración
export { 
  API_CONFIG, 
  AUTH_CONFIG, 
  API_ENDPOINTS, 
  USER_ROLES, 
  TRIP_STATUS,
  UI_CONSTANTS 
} from '../config.js';
