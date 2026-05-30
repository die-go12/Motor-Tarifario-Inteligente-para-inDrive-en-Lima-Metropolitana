import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { MapViewCompatible, MarkerCompatible, PolylineCompatible } from '../../components/MapViewCompatible';
import * as Location from 'expo-location';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { theme } from '../../theme/theme';
import { TarjetaBase } from '../../components/TarjetaBase';
import { BotonNeon } from '../../components/BotonNeon';
import { useAuthStore } from '../../store/useAuthStore';
import { useTripStore } from '../../store/useTripStore';
import { PassengerStackParamList } from '../../navigation/PassengerNavigator';
import { LIMA_CENTRO } from '../../services/config';
import { DARK_MAP_STYLE } from '../../theme/mapStyle';

type Props = {
  navigation: NativeStackNavigationProp<PassengerStackParamList, 'PassengerMap'>;
};

export const PassengerMapScreen: React.FC<Props> = ({ navigation }) => {
  const [ubicacionActual, setUbicacionActual] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [permisoConcedido, setPermisoConcedido] = useState(false);

  const { user, switchRole } = useAuthStore();
  const { viajeActivo, rutaCoords } = useTripStore();

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

      {/* Encabezado con saludo y switch de rol */}
      <View style={estilos.encabezado}>
        <TarjetaBase estilo={estilos.barraEncabezado}>
          <View style={estilos.filaEncabezado}>
            <Text style={estilos.saludo}>Hola, {user?.name?.split(' ')[0]} 👋</Text>
            <TouchableOpacity style={estilos.botonRol} onPress={switchRole}>
              <Text style={estilos.textoRol}>
                {user?.activeRole === 'PASSENGER' ? '🧑 Pasajero' : '🚗 Conductor'}
              </Text>
            </TouchableOpacity>
          </View>
        </TarjetaBase>
      </View>

      {/* Panel inferior — acción principal */}
      <View style={estilos.panelInferior}>
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
  barraEncabezado: { padding: theme.spacing.md },
  filaEncabezado: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  saludo: {
    ...theme.typography.bodyLg,
    color: theme.colors.textPrimary,
  },
  botonRol: {
    backgroundColor: theme.colors.surfaceSecondary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.rounded.full,
  },
  textoRol: {
    ...theme.typography.caption,
    color: theme.colors.primary,
    fontFamily: 'Inter-Bold',
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
});
