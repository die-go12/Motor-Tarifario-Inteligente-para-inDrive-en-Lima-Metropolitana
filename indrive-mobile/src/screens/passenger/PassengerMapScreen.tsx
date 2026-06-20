import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { MapViewCompatible, MarkerCompatible, PolylineCompatible } from '../../components/MapViewCompatible';
import * as Location from 'expo-location';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { theme } from '../../theme/theme';
import { TarjetaBase } from '../../components/TarjetaBase';
import { TarjetaDialogo } from '../../components/TarjetaDialogo';
import { BotonNeon } from '../../components/BotonNeon';
import { useAuthStore } from '../../store/useAuthStore';
import { useTripStore } from '../../store/useTripStore';
import { PassengerStackParamList } from '../../navigation/PassengerNavigator';
import { LIMA_CENTRO } from '../../services/config';
import { DARK_MAP_STYLE } from '../../theme/mapStyle';
import { getSocket, SERVER_EVENTS, PASSENGER_EVENTS } from '../../services/socket';
import { formatSoles } from '../../utils/format';

type Props = {
  navigation: NativeStackNavigationProp<PassengerStackParamList, 'PassengerMap'>;
};

export const PassengerMapScreen: React.FC<Props> = ({ navigation }) => {
  const [ubicacionActual, setUbicacionActual] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [permisoConcedido, setPermisoConcedido] = useState(false);

  const { user, logout, switchRole } = useAuthStore();
  const { 
    viajeActivo, 
    rutaCoords, 
    actualizarEstado, 
    actualizarUbicacionConductor, 
    setTarifaFinal, 
    reset 
  } = useTripStore();

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      setPermisoConcedido(true);
      const location = await Location.getCurrentPositionAsync({});
      setUbicacionActual({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    })();
  }, []);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    socket.on(SERVER_EVENTS.DRIVER_LOCATION, (coords: { latitude: number; longitude: number }) => {
      actualizarUbicacionConductor(coords);
    });

    socket.on(SERVER_EVENTS.TRIP_STARTED, () => {
      actualizarEstado('IN_PROGRESS');
    });

    socket.on(SERVER_EVENTS.TRIP_COMPLETED, (data: { tarifaFinal: number }) => {
      setTarifaFinal(data.tarifaFinal);
    });

    socket.on(SERVER_EVENTS.TRIP_CANCELLED, () => {
      reset();
    });

    return () => {
      socket.off(SERVER_EVENTS.DRIVER_LOCATION);
      socket.off(SERVER_EVENTS.TRIP_STARTED);
      socket.off(SERVER_EVENTS.TRIP_COMPLETED);
      socket.off(SERVER_EVENTS.TRIP_CANCELLED);
    };
  }, []);

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

  const handleSwitchRole = () => {
    switchRole();
  };

  // Pantalla de pago final cuando el viaje está completado
  if (viajeActivo?.status === 'COMPLETED' && viajeActivo.tarifaFinal) {
    return (
      <View style={[estilos.contenedor, estilos.centrado]}>
        <TarjetaDialogo estilo={estilos.dialogoFinal}>
          <Text style={estilos.tituloFinal}>¡Viaje completado!</Text>
          <Text style={estilos.labelFinal}>Total pagado</Text>
          <Text style={estilos.montoFinal}>{formatSoles(viajeActivo.tarifaFinal)}</Text>
          <Text style={estilos.descripcionFinal}>
            {formatSoles(viajeActivo.tarifa.minimo)} mín. · {formatSoles(viajeActivo.tarifa.maximo)} máx.
          </Text>
          <BotonNeon titulo="Volver al inicio" onPress={() => { reset(); }} />
        </TarjetaDialogo>
      </View>
    );
  }

  return (
    <View style={estilos.contenedor}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.background} />

      <MapViewCompatible style={estilos.mapa}>
        {ubicacionActual && (
          <MarkerCompatible coordinate={ubicacionActual}>
            <View style={estilos.marcadorUbicacion} />
          </MarkerCompatible>
        )}
        {viajeActivo?.conductorUbicacion && (
          <MarkerCompatible coordinate={viajeActivo.conductorUbicacion}>
            <View style={estilos.marcadorConductor}>
              <Text style={estilos.iconoCarro}>🚗</Text>
            </View>
          </MarkerCompatible>
        )}
        {rutaCoords.length > 0 && (
          <PolylineCompatible
            coordinates={rutaCoords}
            strokeColor={theme.colors.primary}
            strokeWidth={4}
          />
        )}
      </MapViewCompatible>

      {/* Encabezado con saludo, switch de rol y logout */}
      <View style={estilos.encabezado}>
        <TarjetaBase estilo={estilos.barraEncabezado}>
          <View style={estilos.filaEncabezado}>
            <View style={estilos.filaUsuario}>
              <Text style={estilos.saludo}>Hola, {user?.name?.split(' ')[0]} 👋</Text>
              <TouchableOpacity onPress={handleLogout} activeOpacity={0.7}>
                <Text style={estilos.logoutTexto}>Salir</Text>
              </TouchableOpacity>
            </View>
          </View>
          <TouchableOpacity style={estilos.botonRol} onPress={handleSwitchRole} activeOpacity={0.7}>
            <Text style={estilos.textoRol}>🧑 Pasajero</Text>
            <Text style={estilos.switchHint}>Toca para cambiar a Conductor →</Text>
          </TouchableOpacity>
        </TarjetaBase>
      </View>

      {/* Panel inferior — acción principal */}
      <View style={estilos.panelInferior}>
        {viajeActivo && (viajeActivo.status === 'ASSIGNED' || viajeActivo.status === 'IN_PROGRESS') ? (
          <TarjetaBase estilo={estilos.panelContenido}>
            <Text style={estilos.estadoTexto}>
              {viajeActivo.status === 'ASSIGNED' ? '📍 Tu conductor está en camino' : '🛣️ Viaje en curso'}
            </Text>
            <View style={estilos.tarjetaConductor}>
              <View style={estilos.avatarPlaceholder}>
                <Text style={{ fontSize: 24 }}>🧑‍✈️</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={estilos.nombreConductor}>
                  {viajeActivo.conductorNombre || 'Conductor asignado'}
                </Text>
                <Text style={estilos.detallesVehiculo}>
                  {viajeActivo.vehiculoModelo || 'Vehículo'} · {viajeActivo.vehiculoPlaca || '—'}
                </Text>
              </View>
            </View>
            <View style={estilos.separador} />
            <View style={estilos.filaInfo}>
              <Text style={estilos.infoLabel}>Destino:</Text>
              <Text style={estilos.destino} numberOfLines={1}>{viajeActivo.destinoDireccion}</Text>
            </View>
            {viajeActivo.status === 'ASSIGNED' && (
              <BotonNeon
                titulo="Cancelar viaje"
                onPress={() => {
                  Alert.alert(
                    'Cancelar viaje',
                    '¿Estás seguro de que deseas cancelar este viaje?',
                    [
                      { text: 'No', style: 'cancel' },
                      { 
                        text: 'Sí, cancelar', 
                        style: 'destructive',
                        onPress: () => {
                          const socket = getSocket();
                          socket?.emit(PASSENGER_EVENTS.CANCEL_TRIP, { tripId: Number(viajeActivo.id) });
                          reset();
                        }
                      }
                    ]
                  );
                }}
                estilo={{ backgroundColor: theme.colors.surfaceSecondary }}
              />
            )}
          </TarjetaBase>
        ) : (
          <TarjetaBase estilo={estilos.panelContenido}>
            {!permisoConcedido ? (
              <ActivityIndicator color={theme.colors.primary} />
            ) : (
              <>
                <Text style={estilos.pregunta}>¿A dónde vas?</Text>
                <TouchableOpacity
                  style={estilos.campoBusqueda}
                  onPress={() => navigation.navigate('SearchTrip')}
                  activeOpacity={0.7}
                >
                  <Text style={estilos.placeholder}>Busca tu destino en Lima...</Text>
                </TouchableOpacity>
                <BotonNeon
                  titulo="Solicitar viaje"
                  onPress={() => navigation.navigate('SearchTrip')}
                />
              </>
            )}
          </TarjetaBase>
        )}
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
  filaEncabezado: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  filaUsuario: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flex: 1,
  },
  saludo: {
    ...theme.typography.bodyLg,
    color: theme.colors.textPrimary,
  },
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
  panelInferior: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  panelContenido: {
    borderTopLeftRadius: theme.rounded['2xl'],
    borderTopRightRadius: theme.rounded['2xl'],
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    gap: theme.spacing.lg,
    paddingBottom: 32,
  },
  pregunta: {
    ...theme.typography.h2,
    color: theme.colors.textPrimary,
  },
  campoBusqueda: {
    backgroundColor: theme.colors.input,
    borderRadius: theme.rounded.md,
    height: 56,
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  placeholder: {
    ...theme.typography.bodyMd,
    color: theme.colors.textMuted,
  },
  marcadorUbicacion: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: theme.colors.locationCurrent,
    borderWidth: 3,
    borderColor: theme.colors.background,
  },
  marcadorConductor: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconoCarro: { fontSize: 20 },
  // Estilos de viaje activo y detalles de conductor
  estadoTexto: { ...theme.typography.bodyLg, color: theme.colors.textPrimary, fontFamily: 'Inter-Bold' },
  tarjetaConductor: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md, marginVertical: theme.spacing.sm },
  avatarPlaceholder: { width: 48, height: 48, borderRadius: 24, backgroundColor: theme.colors.surfaceSecondary, justifyContent: 'center', alignItems: 'center' },
  nombreConductor: { ...theme.typography.bodyLg, color: theme.colors.textPrimary, fontFamily: 'Inter-Bold' },
  detallesVehiculo: { ...theme.typography.caption, color: theme.colors.textSecondary },
  separador: { height: 1, backgroundColor: theme.colors.borderSubtle, marginVertical: theme.spacing.xs },
  filaInfo: { flexDirection: 'row', gap: theme.spacing.sm, alignItems: 'center' },
  infoLabel: { ...theme.typography.bodyMd, color: theme.colors.textSecondary },
  destino: { ...theme.typography.bodyMd, color: theme.colors.textPrimary, flex: 1 },
  // Estilos de diálogo final de pago
  dialogoFinal: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: theme.spacing.lg },
  tituloFinal: { ...theme.typography.h1, color: theme.colors.textPrimary },
  labelFinal: { ...theme.typography.bodyMd, color: theme.colors.textSecondary },
  montoFinal: { ...theme.typography.h1, color: theme.colors.primary, fontSize: 48 },
  descripcionFinal: { ...theme.typography.caption, color: theme.colors.textMuted },
  centrado: { justifyContent: 'center', alignItems: 'center', padding: theme.spacing.xl, gap: theme.spacing.lg },
});
