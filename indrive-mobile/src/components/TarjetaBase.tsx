import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { theme } from '../theme/theme';

interface TarjetaBaseProps {
  children: React.ReactNode;
  estilo?: ViewStyle;
  flotante?: boolean;
}

export const TarjetaBase: React.FC<TarjetaBaseProps> = ({
  children,
  estilo,
  flotante = false,
}) => {
  return (
    <View
      style={[
        estilos.tarjeta,
        flotante && estilos.flotante,
        estilo,
      ]}
    >
      {children}
    </View>
  );
};

const estilos = StyleSheet.create({
  tarjeta: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.rounded.lg,
    padding: 20,
  },
  flotante: {
    backgroundColor: theme.colors.surfaceSecondary,
    borderRadius: theme.rounded.xl,
    padding: theme.spacing.xl,
  },
});
