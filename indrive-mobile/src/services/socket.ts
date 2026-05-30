import { io, Socket } from 'socket.io-client';
import { getToken, SECURE_KEYS } from './api';
import { WS_BASE_URL } from './config';

let socketInstance: Socket | null = null;

export const initSocket = async (): Promise<Socket> => {
  if (socketInstance?.connected) return socketInstance;

  const token = await getToken(SECURE_KEYS.accessToken);

  socketInstance = io(WS_BASE_URL, {
    auth: { token },
    transports: ['websocket'],
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 2000,
  });

  socketInstance.on('connect', () => {
    console.log('[Socket] Conectado al servidor:', socketInstance?.id);
  });

  socketInstance.on('disconnect', (reason) => {
    console.log('[Socket] Desconectado:', reason);
  });

  socketInstance.on('connect_error', (err) => {
    console.warn('[Socket] Error de conexión:', err.message);
  });

  return socketInstance;
};

export const getSocket = (): Socket | null => socketInstance;

export const disconnectSocket = () => {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
};

// Eventos que emite el Pasajero
export const PASSENGER_EVENTS = {
  REQUEST_TRIP: 'trip_request',    // Solicitar viaje con origen, destino y oferta inicial
  ACCEPT_OFFER: 'accept_offer',    // Aceptar oferta de un conductor
  CANCEL_TRIP: 'cancel_trip',      // Cancelar viaje
} as const;

// Eventos que emite el Conductor
export const DRIVER_EVENTS = {
  SEND_OFFER: 'driver_offer',      // Enviar contraoferta para un viaje
  UPDATE_LOCATION: 'driver_location', // Actualizar ubicación GPS
  START_TRIP: 'start_trip',        // Confirmar inicio del trayecto
  COMPLETE_TRIP: 'complete_trip',  // Marcar viaje como finalizado
} as const;

// Eventos que recibe la app del servidor
export const SERVER_EVENTS = {
  TRIP_CREATED: 'trip_created',         // Nuevo viaje disponible (conductor)
  OFFER_RECEIVED: 'offer_received',     // Nueva oferta recibida (pasajero)
  TRIP_ASSIGNED: 'trip_assigned',       // Oferta aceptada — viaje asignado
  DRIVER_LOCATION: 'driver_location_update', // Posición del conductor (pasajero)
  TRIP_STARTED: 'trip_started',         // El conductor inició el viaje
  TRIP_COMPLETED: 'trip_completed',     // Viaje finalizado con tarifa final
  TRIP_CANCELLED: 'trip_cancelled',     // Viaje cancelado
} as const;
