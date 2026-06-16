/**
 * MapViewCompatible — Componente de mapa compatible con Expo Go, Web y Dev Client.
 *
 * En Web o Expo Go básico, se muestra un placeholder simulado.
 * En Expo Dev Client / APK nativa, se inicializa el componente real react-native-maps.
 */
import React from 'react';
import { View, Text, StyleSheet, ViewStyle, Platform } from 'react-native';
import { theme } from '../theme/theme';
import { DARK_MAP_STYLE } from '../theme/mapStyle';

let MapView: any = null;
let Marker: any = null;
let Polyline: any = null;

if (Platform.OS !== 'web') {
  try {
    const Maps = require('react-native-maps');
    MapView = Maps.default || Maps;
    Marker = Maps.Marker;
    Polyline = Maps.Polyline;
  } catch (error) {
    console.warn('No se pudo cargar react-native-maps, usando el fallback simulado:', error);
  }
}

interface Coords {
  latitude: number;
  longitude: number;
  latitudeDelta?: number;
  longitudeDelta?: number;
}

interface MapViewCompatibleProps {
  style?: ViewStyle;
  initialRegion?: Coords;
  children?: React.ReactNode;
}

interface MarkerProps {
  coordinate: Coords;
  children?: React.ReactNode;
}

interface PolylineProps {
  coordinates: Coords[];
  strokeColor?: string;
  strokeWidth?: number;
}

// Mapa compatible
export const MapViewCompatible: React.FC<MapViewCompatibleProps> = ({
  style,
  initialRegion,
  children,
}) => {
  // Centro predeterminado de Lima Centro si no se recibe región
  const defaultRegion = initialRegion || {
    latitude: -12.046374,
    longitude: -77.042793,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  if (MapView) {
    return (
      <MapView
        style={style}
        initialRegion={defaultRegion}
        customMapStyle={DARK_MAP_STYLE}
        provider="google"
      >
        {children}
      </MapView>
    );
  }

  // Fallback simulado para la Web o si react-native-maps no está presente
  return (
    <View style={[estilos.mapa, style]}>
      {/* Cuadrícula de calles simulada */}
      <View style={estilos.grid}>
        {[...Array(8)].map((_, i) => (
          <View key={`h-${i}`} style={[estilos.lineaH, { top: `${i * 13}%` }]} />
        ))}
        {[...Array(6)].map((_, i) => (
          <View key={`v-${i}`} style={[estilos.lineaV, { left: `${i * 17}%` }]} />
        ))}
      </View>

      {/* Indicador de mapa placeholder */}
      <View style={estilos.badge}>
        <Text style={estilos.badgeTexto}>🗺️ Lima Metropolitana</Text>
        <Text style={estilos.badgePista}>Mapa simulado (Web / Fallback)</Text>
      </View>

      {/* Renderizar marcadores simulados si existen */}
      {children}
    </View>
  );
};

// Marcador compatible
export const MarkerCompatible: React.FC<MarkerProps> = ({ coordinate, children }) => {
  if (Marker) {
    return (
      <Marker coordinate={coordinate}>
        {children}
      </Marker>
    );
  }

  if (!children) return null;
  return <View style={estilos.marcador}>{children}</View>;
};

// Polilínea compatible
export const PolylineCompatible: React.FC<PolylineProps> = ({
  coordinates,
  strokeColor,
  strokeWidth,
}) => {
  if (Polyline) {
    return (
      <Polyline
        coordinates={coordinates}
        strokeColor={strokeColor}
        strokeWidth={strokeWidth}
      />
    );
  }
  return null;
};

const estilos = StyleSheet.create({
  mapa: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    overflow: 'hidden',
    position: 'relative',
  },
  grid: {
    ...StyleSheet.absoluteFillObject,
  },
  lineaH: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: theme.colors.surfaceTertiary,
  },
  lineaV: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: theme.colors.surfaceTertiary,
  },
  badge: {
    position: 'absolute',
    top: '45%',
    alignSelf: 'center',
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.rounded.lg,
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
  },
  badgeTexto: {
    ...theme.typography.bodyLg,
    color: theme.colors.textPrimary,
    fontFamily: 'Inter-Bold',
  },
  badgePista: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
  },
  marcador: {
    position: 'absolute',
    top: '40%',
    left: '40%',
  },
});
