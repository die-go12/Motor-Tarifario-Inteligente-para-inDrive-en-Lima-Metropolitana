import { io } from 'https://cdn.socket.io/4.7.1/socket.io.esm.min.js';
import { API_CONFIG } from '../config.js';

class SocketService {
  constructor() {
    this.socket = null;
  }

  connect(token) {
    if (!token) {
      console.warn('SocketService: no token available for connection');
      return;
    }

    this.disconnect();

    try {
      this.socket = io(API_CONFIG.MS_BASE, {
        auth: { token },
        transports: ['websocket'],
        path: '/socket.io',
        timeout: 10000
      });

      this.socket.on('connect', () => {
        console.debug('Socket.io connected to', API_CONFIG.MS_BASE);
      });

      this.socket.on('connect_error', (error) => {
        console.warn('Socket.io connection failed:', error.message || error);
      });
    } catch (error) {
      console.error('SocketService connect error:', error);
    }
  }

  on(event, handler) {
    if (!this.socket) return;
    this.socket.on(event, handler);
  }

  off(event, handler) {
    if (!this.socket) return;
    this.socket.off(event, handler);
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export const socketService = new SocketService();
