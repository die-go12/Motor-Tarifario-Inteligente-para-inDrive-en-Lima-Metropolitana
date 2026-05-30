import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { MapViewCompatible, MarkerCompatible, PolylineCompatible } from '../../components/MapViewCompatible';
import * as Location from 'expo-location';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { theme } from '../../theme/theme';
import { TarjetaBase } from '../../components/TarjetaBase';
import { BotonNeon } from '../../components/BotonNeon';
import { useTripStore } from '../../store/useTripStore';
import { DriverStackParamList } from '../../navigation/DriverNavigator';
import { DARK_MAP_STYLE } from '../../theme/mapStyle';
import { getSocket, DRIVER_EVENTS, SERVER_EVENTS } from '../../services/socket';
import { formatSoles, formatDistancia } from '../../utils/format';

type Props = {
  navigation: NativeStackNavigationProp<DriverStackParamList, 'ActiveTrip'>;
  route: RouteProp<DriverStackParamList, 'ActiveTrip'>;
};

export const ActiveTripScreen: React.FC<Props> = ({ navigation, route }) => {
  // mapRef ya no se usa con el componente compatible
  const locationSubscription = useRef<Location.LocationSubscription | null>(null);
  const { tripId } = route.params;

  const { viajeActivo, rutaCoords, actualizarEstado, setTarifaFinal, reset } = useTripStore();

  useEffect(() => {
    iniciarRastreo();

    const socket = getSocket();
    if (socket) {
      socket.on(SERVER_EVENTS.TRIP_COMPLETED, (data: { tarifaFinal: number }) => {
        setTarifaFinal(data.tarifaFinal);
        locationSubscription.current?.remove();
      });
    }

    return () => {
      locationSubscription.current?.remove();
      socket?.off(SERVER_EVENTS.TRIP_COMPLETED);
    };
  }, []);

  const iniciarRastreo = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return;

    locationSubscription.current = await Location.watchPositionAsync(
      { accuracy: Location.Accuracy.Balanced, timeInterval: 4000, distanceInterval: 10 },
      (location) => {
        const coords = { latitude: location.coords.latitude, longitude: location.coords.longitude };
        const socket = getSocket();
        socket?.emit(DRIVER_EVENTS.UPDATE_LOCATION, { tripId, ...coords });
      }
    );
  };

  const iniciarViaje = () => {
    const socket = getSocket();
    socket?.emit(DRIVER_EVENTS.START_TRIP, { tripId });
    actualizarEstado('IN_PROGRESS');
  };

  const finalizarViaje = () => {
    const socket = getSocket();
    socket?.emit(DRIVER_EVENTS.COMPLETE_TRIP, { tripId });
  };

  // Pantalla de cobro final
  if (viajeActivo?.status === 'COMPLETED' && viajeActivo.tarifaFinal) {
    return (
      <View style={[estilos.contenedor, estilos.centrado]}>
        <Text style={estilos.tituloFinal}>¡Viaje completado!</Text>
        <Text style={estilos.labelFinal}>Ganancia de este viaje</Text>
        <Text style={estilos.montoFinal}>{formatSoles(viajeActivo.tarifaFinal)}</Text>
        <Text style={estilos.formulaFinal}>
          Mín. {formatSoles(viajeActivo.tarifa.minimo)} · Máx. {formatSoles(viajeActivo.tarifa.maximo)}
        </Text>
        <BotonNeon
          titulo="Volver al mapa"
          onPress={() => { reset(); navigation.navigate('DriverMap'); }}
          estilo={estilos.botonFinal}
        />
      </View>
    );
  }

  return (
    <View style={estilos.contenedor}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.background} />

      <MapViewCompatible
        style={estilos.mapa}
        initialRegion={viajeActivo?.origen
          ? { ...viajeActivo.origen, latitudeDelta: 0.05, longitudeDelta: 0.05 }
          : undefined}
      >
        {viajeActivo?.origen && (
          <MarkerCompatible coordinate={viajeActivo.origen}>
            <View style={estilos.marcadorOrigen} />
          </MarkerCompatible>
        )}
        {viajeActivo?.destino && (
          <MarkerCompatible coordinate={viajeActivo.destino}>
            <View style={estilos.marcadorDestino} />
          </MarkerCompatible>
        )}
        {rutaCoords.length > 0 && (
          <PolylineCompatible coordinates={rutaCoords} strokeColor={theme.colors.primary} strokeWidth={4} />
        )}
      </MapViewCompatible>

      {/* Panel inferior */}
      <View style={estilos.panel}>
        <TarjetaBase estilo={estilos.panelContenido}>
          <Text style={estilos.estadoTexto}>
            {viajeActivo?.status === 'ASSIGNED' ? '📍 En camino a recoger al pasajero' : '🛣️ Viaje en curso'}
          </Text>

          {viajeActivo && (
            <View style={estilos.filaInfo}>
              <Text style={estilos.infoLabel}>{formatDistancia(viajeActivo.distanciaKm)}</Text>
              <Text style={estilos.infoLabel}>·</Text>
              <Text style={estilos.destino} numberOfLines={1}>{viajeActivo.destinoDireccion}</Text>
            </View>
          )}

          {viajeActivo?.status === 'ASSIGNED' && (
            <BotonNeon titulo="He llegado — Iniciar viaje" onPress={iniciarViaje} />
          )}
          {viajeActivo?.status === 'IN_PROGRESS' && (
            <BotonNeon titulo="Finalizar viaje" onPress={finalizarViaje} />
          )}
        </TarjetaBase>
      </View>
    </View>
  );
};

const estilos = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: theme.colors.background },
  centrado: { justifyContent: 'center', alignItems: 'center', padding: theme.spacing.xl, gap: theme.spacing.lg },
  mapa: { flex: 1 },
  panel: { position: 'absolute', bottom: 0, left: 0, right: 0 },
  panelContenido: {
    borderTopLeftRadius: theme.rounded['2xl'],
    borderTopRightRadius: theme.rounded['2xl'],
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    gap: theme.spacing.lg,
    paddingBottom: 32,
  },
  estadoTexto: { ...theme.typography.bodyLg, color: theme.colors.textPrimary, fontFamily: 'Inter-Bold' },
  filaInfo: { flexDirection: 'row', gap: theme.spacing.sm, alignItems: 'center' },
  infoLabel: { ...theme.typography.bodyMd, color: theme.colors.textSecondary },
  destino: { ...theme.typography.bodyMd, color: theme.colors.textPrimary, flex: 1 },
  marcadorOrigen: { width: 14, height: 14, borderRadius: 7, backgroundColor: theme.colors.locationCurrent, borderWidth: 2, borderColor: '#fff' },
  marcadorDestino: { width: 14, height: 14, borderRadius: 7, backgroundColor: theme.colors.locationDestination, borderWidth: 2, borderColor: '#fff' },
  // Pantalla final
  tituloFinal: { ...theme.typography.h1, color: theme.colors.textPrimary },
  labelFinal: { ...theme.typography.bodyMd, color: theme.colors.textSecondary },
  montoFinal: { ...theme.typography.h1, color: theme.colors.primary, fontSize: 48 },
  formulaFinal: { ...theme.typography.caption, color: theme.colors.textMuted },
  botonFinal: { width: '100%' },
});
