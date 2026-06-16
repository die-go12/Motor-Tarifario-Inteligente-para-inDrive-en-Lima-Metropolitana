// CONFIGURACIÓN DE RED LOCAL PARA EXPO DEV CLIENT / EXPO GO
// Las variables de conexión y API keys ahora se manejan mediante variables de entorno en un archivo `.env`.
// Para desarrollo local se lee process.env.EXPO_PUBLIC_*.

const DEFAULT_IP = '192.168.18.202';

// La app habla directo al microservicio base (ms-base), que expone tanto la API
// REST (auth, users, vehicles, trips) como el WebSocket en tiempo real.
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || `http://${DEFAULT_IP}:3001`;

// WebSocket (socket.io) servido por ms-base en el mismo puerto.
export const WS_BASE_URL = process.env.EXPO_PUBLIC_WS_URL || `http://${DEFAULT_IP}:3001`;

// Google Maps API Key
export const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || 'AIzaSyD8P5S5XkSVt3epOPC8_dTGmPvFvRm6nx4';

// Coordenadas del centro de Lima Metropolitana para filtrar búsquedas
export const LIMA_CENTRO = {
  latitude: -12.046374,
  longitude: -77.042793,
  latitudeDelta: 0.15,
  longitudeDelta: 0.15,
};

// Radio de búsqueda de Places (en metros) — Lima Metropolitana
export const LIMA_RADIO_BUSQUEDA = 50000;
