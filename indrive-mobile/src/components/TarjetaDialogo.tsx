import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { theme } from '../theme/theme';

interface TarjetaDialogoProps {
  children: React.ReactNode;
  estilo?: ViewStyle;
}

export const TarjetaDialogo: React.FC<TarjetaDialogoProps> = ({
  children,
  estilo,
}) => {
  return (
    <View style={[estilos.dialogo, estilo]}>
      <View style={estilos.handle} />
      {children}
    </View>
  );
};

const estilos = StyleSheet.create({
  dialogo: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: theme.rounded['2xl'],
    borderTopRightRadius: theme.rounded['2xl'],
    padding: theme.spacing.xl,
    paddingTop: theme.spacing.md,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: theme.colors.borderSubtle,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: theme.spacing.lg,
  },
});
