// ⚠️ CONFIGURACIÓN DE RED LOCAL PARA EXPO GO
// Reemplaza HOST_IP con la IP de tu computadora en la red Wi-Fi local.
// Para encontrarla en Linux: ejecuta `ip addr show` o `hostname -I`
// Para Windows: `ipconfig` en cmd
// Para macOS: `ifconfig | grep inet`
//
// IMPORTANTE: No uses 'localhost' ni '127.0.0.1' en dispositivos físicos.
// El celular intentará conectarse a sí mismo y fallará.

export const HOST_IP = '192.168.18.202'; // <-- CAMBIAR A TU IP LOCAL

// La app habla directo al microservicio base (ms-base), que expone tanto la API
// REST (auth, users, vehicles, trips) como el WebSocket en tiempo real.
// El API Gateway (:3000) queda para el panel web admin.
export const API_BASE_URL = `http://${HOST_IP}:3001`;

// WebSocket (socket.io) servido por ms-base en el mismo puerto.
export const WS_BASE_URL = `http://${HOST_IP}:3001`;

// Google Maps API Key
// Configurar también en app.json bajo expo.android.config.googleMaps.apiKey
// y expo.ios.config.googleMaps.apiKey
export const GOOGLE_MAPS_API_KEY = 'AIzaSyD8P5S5XkSVt3epOPC8_dTGmPvFvRm6nx4';

// Coordenadas del centro de Lima Metropolitana para filtrar búsquedas
export const LIMA_CENTRO = {
  latitude: -12.046374,
  longitude: -77.042793,
  latitudeDelta: 0.15,
  longitudeDelta: 0.15,
};

// Radio de búsqueda de Places (en metros) — Lima Metropolitana
export const LIMA_RADIO_BUSQUEDA = 50000;
