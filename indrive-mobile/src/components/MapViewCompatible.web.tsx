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

// Fallback simulado para la Web
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
        <Text style={estilos.badgePista}>Mapa simulado (Web / Fallback)</Text>
      </View>

      {/* Renderizar marcadores simulados si existen */}
      {children}
    </View>
  );
};

// Marcador compatible para Web
export const MarkerCompatible: React.FC<MarkerProps> = ({ children }) => {
  if (!children) return null;
  return <View style={estilos.marcador}>{children}</View>;
};

// Polilínea compatible para Web (no hace nada en web mock)
export const PolylineCompatible: React.FC<PolylineProps> = () => {
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
