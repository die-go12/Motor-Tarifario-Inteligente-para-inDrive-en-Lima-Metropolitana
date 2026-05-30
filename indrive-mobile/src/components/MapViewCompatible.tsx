/**
 * MapViewCompatible — Componente de mapa compatible con Expo Go.
 *
 * En Expo Go (sin build nativa), react-native-maps no está disponible.
 * Este componente muestra un placeholder visual del mapa que mantiene
 * el diseño coherente con design.md.
 *
 * Para activar el mapa real: genera un Expo Dev Client o una build APK.
 */
import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { theme } from '../theme/theme';

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

// Mapa simulado para Expo Go
export const MapViewCompatible: React.FC<MapViewCompatibleProps> = ({
  style,
  children,
}) => {
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
        <Text style={estilos.badgePista}>Mapa disponible en Dev Client</Text>
      </View>

      {/* Renderizar marcadores y polilíneas si se pasan como children */}
      {children}
    </View>
  );
};

// Marcador simulado
export const MarkerCompatible: React.FC<MarkerProps> = ({ children }) => {
  if (!children) return null;
  return <View style={estilos.marcador}>{children}</View>;
};

// Polilínea simulada (no visible en placeholder, pero no rompe el código)
export const PolylineCompatible: React.FC<PolylineProps> = () => null;

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
