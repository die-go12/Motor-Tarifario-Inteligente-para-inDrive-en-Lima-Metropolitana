import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Alert,
} from 'react-native';
import { MapViewCompatible, MarkerCompatible } from '../../components/MapViewCompatible';
import * as Location from 'expo-location';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { theme } from '../../theme/theme';
import { TarjetaBase } from '../../components/TarjetaBase';
import { BotonNeon } from '../../components/BotonNeon';
import { useAuthStore } from '../../store/useAuthStore';
import { DriverStackParamList } from '../../navigation/DriverNavigator';
import { LIMA_CENTRO } from '../../services/config';
import { DARK_MAP_STYLE } from '../../theme/mapStyle';
import { getSocket, SERVER_EVENTS } from '../../services/socket';

type Props = {
  navigation: NativeStackNavigationProp<DriverStackParamList, 'DriverMap'>;
};

export const DriverMapScreen: React.FC<Props> = ({ navigation }) => {
  const [ubicacion, setUbicacion] = useState<{ latitude: number; longitude: number } | null>(null);
  const [disponible, setDisponible] = useState(true);
  const locationSubscription = useRef<Location.LocationSubscription | null>(null);

  const { user, logout } = useAuthStore();

  useEffect(() => {
    iniciarRastreoGPS();

    // Escuchar solicitudes de viaje entrantes
    const socket = getSocket();
    if (socket) {
      socket.on(SERVER_EVENTS.TRIP_CREATED, () => {
        // Notificar al conductor que hay viajes disponibles
        navigation.navigate('TripOffers');
      });
    }

    return () => {
      locationSubscription.current?.remove();
      socket?.off(SERVER_EVENTS.TRIP_CREATED);
    };
  }, []);

  const iniciarRastreoGPS = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return;

    // El conductor emite su ubicación cada 4 segundos
    locationSubscription.current = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 4000,
        distanceInterval: 10,
      },
      (location) => {
        const coords = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        };
        setUbicacion(coords);
        // La ubicación se transmite al backend solo durante un viaje activo
        // (ver ActiveTripScreen, que envía driver_location con el tripId).
      }
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Seguro que deseas salir de tu cuenta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Salir', style: 'destructive', onPress: () => logout() },
      ],
    );
  };



  return (
    <View style={estilos.contenedor}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.background} />

      <MapViewCompatible style={estilos.mapa}>
        {ubicacion && (
          <MarkerCompatible coordinate={ubicacion}>
            <View style={estilos.marcadorConductor}>
              <Text style={estilos.iconoCarro}>🚗</Text>
            </View>
          </MarkerCompatible>
        )}
      </MapViewCompatible>

      {/* Encabezado */}
      <View style={estilos.encabezado}>
        <TarjetaBase estilo={estilos.barraEncabezado}>
          <View style={estilos.filaEncabezado}>
            <View style={estilos.filaUsuario}>
              <Text style={estilos.saludo}>Conductor: {user?.name?.split(' ')[0]}</Text>
              <TouchableOpacity onPress={handleLogout} activeOpacity={0.7}>
                <Text style={estilos.logoutTexto}>Salir</Text>
              </TouchableOpacity>
            </View>
          </View>

        </TarjetaBase>
      </View>

      {/* Panel inferior */}
      <View style={estilos.panelInferior}>
        <TarjetaBase estilo={estilos.panelContenido}>
          <View style={estilos.estadoFila}>
            <View style={[estilos.indicador, { backgroundColor: disponible ? theme.colors.primary : theme.colors.error }]} />
            <Text style={estilos.estadoTexto}>
              {disponible ? 'Disponible para viajes' : 'No disponible'}
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => setDisponible(!disponible)}
            style={[estilos.toggleDisponible, { borderColor: disponible ? theme.colors.primary : theme.colors.error }]}
          >
            <Text style={[estilos.toggleTexto, { color: disponible ? theme.colors.primary : theme.colors.error }]}>
              {disponible ? 'Pausar disponibilidad' : 'Activar disponibilidad'}
            </Text>
          </TouchableOpacity>

          <BotonNeon
            titulo="Ver solicitudes de viaje"
            onPress={() => navigation.navigate('TripOffers')}
          />
        </TarjetaBase>
      </View>
    </View>
  );
};

const estilos = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: theme.colors.background },
  mapa: { flex: 1 },
  encabezado: {
    position: 'absolute',
    top: 48,
    left: theme.spacing.lg,
    right: theme.spacing.lg,
  },
  barraEncabezado: { padding: theme.spacing.md, gap: theme.spacing.sm },
  filaEncabezado: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  filaUsuario: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flex: 1,
  },
  saludo: { ...theme.typography.bodyLg, color: theme.colors.textPrimary },
  logoutTexto: {
    ...theme.typography.caption,
    color: theme.colors.error,
    fontFamily: 'Inter-Bold',
  },
  botonRol: {
    backgroundColor: theme.colors.surfaceSecondary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.rounded.full,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textoRol: {
    ...theme.typography.caption,
    color: theme.colors.primary,
    fontFamily: 'Inter-Bold',
  },
  switchHint: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
    fontSize: 11,
  },
  panelInferior: { position: 'absolute', bottom: 0, left: 0, right: 0 },
  panelContenido: {
    borderTopLeftRadius: theme.rounded['2xl'],
    borderTopRightRadius: theme.rounded['2xl'],
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    gap: theme.spacing.lg,
    paddingBottom: 32,
  },
  estadoFila: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm },
  indicador: { width: 10, height: 10, borderRadius: 5 },
  estadoTexto: { ...theme.typography.bodyMd, color: theme.colors.textPrimary },
  toggleDisponible: {
    borderWidth: 1,
    borderRadius: theme.rounded.md,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleTexto: { ...theme.typography.button },
  marcadorConductor: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconoCarro: { fontSize: 20 },
});
