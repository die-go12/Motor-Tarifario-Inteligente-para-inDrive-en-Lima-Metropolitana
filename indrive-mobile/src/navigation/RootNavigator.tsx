import React, { useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { AuthNavigator } from './AuthNavigator';
import { PassengerNavigator } from './PassengerNavigator';
import { DriverNavigator } from './DriverNavigator';
import { initSocket, disconnectSocket } from '../services/socket';

export const RootNavigator = () => {
  const { isAuthenticated, user } = useAuthStore();

  // Conectar/desconectar socket según estado de autenticación
  useEffect(() => {
    if (isAuthenticated) {
      initSocket().catch(console.error);
    } else {
      disconnectSocket();
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return <AuthNavigator />;
  }

  if (user?.activeRole === 'DRIVER') {
    return <DriverNavigator />;
  }

  return <PassengerNavigator />;
};
