import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
} from 'react-native';
import { theme } from '../theme/theme';

interface BotonNeonProps {
  titulo: string;
  onPress: () => void;
  cargando?: boolean;
  deshabilitado?: boolean;
  estilo?: ViewStyle;
}

export const BotonNeon: React.FC<BotonNeonProps> = ({
  titulo,
  onPress,
  cargando = false,
  deshabilitado = false,
  estilo,
}) => {
  return (
    <TouchableOpacity
      style={[estilos.boton, deshabilitado && estilos.deshabilitado, estilo]}
      onPress={onPress}
      activeOpacity={0.75}
      disabled={deshabilitado || cargando}
    >
      {cargando ? (
        <ActivityIndicator color={theme.colors.background} />
      ) : (
        <Text style={estilos.texto}>{titulo}</Text>
      )}
    </TouchableOpacity>
  );
};

const estilos = StyleSheet.create({
  boton: {
    backgroundColor: theme.colors.primary,
    height: 56,
    borderRadius: theme.rounded.md,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  texto: {
    ...theme.typography.button,
    color: theme.colors.background,
  },
  deshabilitado: {
    opacity: 0.4,
  },
});
