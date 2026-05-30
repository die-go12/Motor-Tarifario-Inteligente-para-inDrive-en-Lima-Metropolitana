import React from 'react';
import {
  TextInput,
  StyleSheet,
  View,
  Text,
  TextInputProps,
} from 'react-native';
import { theme } from '../theme/theme';

interface CampoEntradaProps extends TextInputProps {
  etiqueta?: string;
  error?: string;
}

export const CampoEntrada: React.FC<CampoEntradaProps> = ({
  etiqueta,
  error,
  ...props
}) => {
  return (
    <View style={estilos.contenedor}>
      {etiqueta && <Text style={estilos.etiqueta}>{etiqueta}</Text>}
      <TextInput
        style={[estilos.input, error ? estilos.inputError : null]}
        placeholderTextColor={theme.colors.textMuted}
        {...props}
      />
      {error && <Text style={estilos.textoError}>{error}</Text>}
    </View>
  );
};

const estilos = StyleSheet.create({
  contenedor: {
    gap: theme.spacing.sm,
  },
  etiqueta: {
    ...theme.typography.bodyMd,
    color: theme.colors.textSecondary,
  },
  input: {
    backgroundColor: theme.colors.input,
    borderRadius: theme.rounded.md,
    paddingHorizontal: theme.spacing.lg,
    height: 56,
    color: theme.colors.textPrimary,
    fontSize: 15,
    fontFamily: 'Inter-Regular',
  },
  inputError: {
    borderWidth: 1,
    borderColor: theme.colors.error,
  },
  textoError: {
    ...theme.typography.caption,
    color: theme.colors.error,
  },
});
