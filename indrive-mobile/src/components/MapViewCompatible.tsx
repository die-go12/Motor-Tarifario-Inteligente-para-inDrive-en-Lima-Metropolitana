import React from 'react';
import { ViewStyle } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { DARK_MAP_STYLE } from '../theme/mapStyle';

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

export const MapViewCompatible: React.FC<MapViewCompatibleProps> = ({
  style,
  initialRegion,
  children,
}) => {
  const defaultRegion = initialRegion || {
    latitude: -12.046374,
    longitude: -77.042793,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  return (
    <MapView
      style={style}
      initialRegion={defaultRegion as any}
      customMapStyle={DARK_MAP_STYLE}
      provider="google"
    >
      {children}
    </MapView>
  );
};

export const MarkerCompatible: React.FC<MarkerProps> = ({ coordinate, children }) => {
  return (
    <Marker coordinate={coordinate}>
      {children}
    </Marker>
  );
};

export const PolylineCompatible: React.FC<PolylineProps> = ({
  coordinates,
  strokeColor,
  strokeWidth,
}) => {
  return (
    <Polyline
      coordinates={coordinates}
      strokeColor={strokeColor}
      strokeWidth={strokeWidth}
    />
  );
};
