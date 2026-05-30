// ⚠️ CONFIGURACIÓN DE RED LOCAL PARA EXPO GO
// Reemplaza HOST_IP con la IP de tu computadora en la red Wi-Fi local.
// Para encontrarla en Linux: ejecuta `ip addr show` o `hostname -I`
// Para Windows: `ipconfig` en cmd
// Para macOS: `ifconfig | grep inet`
//
// IMPORTANTE: No uses 'localhost' ni '127.0.0.1' en dispositivos físicos.
// El celular intentará conectarse a sí mismo y fallará.

export const HOST_IP = '192.168.18.29'; // <-- CAMBIAR A TU IP LOCAL

// Puerto del API Gateway del backend (indrive-plus/apps/api-gateway)
export const API_BASE_URL = `http://${HOST_IP}:3000`;

// Puerto del WebSocket Gateway (mismo API Gateway)
export const WS_BASE_URL = `ws://${HOST_IP}:3000`;

// Google Maps API Key
// Configurar también en app.json bajo expo.android.config.googleMaps.apiKey
// y expo.ios.config.googleMaps.apiKey
export const GOOGLE_MAPS_API_KEY = 'TU_API_KEY_DE_GOOGLE_MAPS';

// Coordenadas del centro de Lima Metropolitana para filtrar búsquedas
export const LIMA_CENTRO = {
  latitude: -12.046374,
  longitude: -77.042793,
  latitudeDelta: 0.15,
  longitudeDelta: 0.15,
};

// Radio de búsqueda de Places (en metros) — Lima Metropolitana
export const LIMA_RADIO_BUSQUEDA = 50000;
