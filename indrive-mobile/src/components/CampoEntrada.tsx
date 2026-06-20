import React, { useState } from 'react';
import {
  TextInput,
  StyleSheet,
  View,
  Text,
  TextInputProps,
  TouchableOpacity,
} from 'react-native';
import { theme } from '../theme/theme';

interface CampoEntradaProps extends TextInputProps {
  etiqueta?: string;
  error?: string;
}

export const CampoEntrada: React.FC<CampoEntradaProps> = ({
  etiqueta,
  error,
  secureTextEntry,
  ...props
}) => {
  const [mostrarTexto, setMostrarTexto] = useState(false);
  const esPassword = secureTextEntry !== undefined && secureTextEntry;

  return (
    <View style={estilos.contenedor}>
      {etiqueta && <Text style={estilos.etiqueta}>{etiqueta}</Text>}
      <View style={estilos.inputWrapper}>
        <TextInput
          style={[
            estilos.input,
            esPassword && estilos.inputConBoton,
            error ? estilos.inputError : null,
          ]}
          placeholderTextColor={theme.colors.textMuted}
          secureTextEntry={esPassword && !mostrarTexto}
          {...props}
        />
        {esPassword && (
          <TouchableOpacity
            style={estilos.botonOjo}
            onPress={() => setMostrarTexto(!mostrarTexto)}
            activeOpacity={0.6}
          >
            <Text style={estilos.iconoOjo}>{mostrarTexto ? '🙈' : '👁️'}</Text>
          </TouchableOpacity>
        )}
      </View>
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
  inputWrapper: {
    position: 'relative',
    justifyContent: 'center',
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
  inputConBoton: {
    paddingRight: 56,
  },
  inputError: {
    borderWidth: 1,
    borderColor: theme.colors.error,
  },
  textoError: {
    ...theme.typography.caption,
    color: theme.colors.error,
  },
  botonOjo: {
    position: 'absolute',
    right: 0,
    height: 56,
    width: 52,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconoOjo: {
    fontSize: 20,
  },
});
