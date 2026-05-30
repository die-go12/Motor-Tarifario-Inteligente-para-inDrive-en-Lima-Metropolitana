import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { theme } from '../../theme/theme';
import { BotonNeon } from '../../components/BotonNeon';
import { CampoEntrada } from '../../components/CampoEntrada';
import { api } from '../../services/api';
import { useAuthStore } from '../../store/useAuthStore';
import { AuthStackParamList } from '../../navigation/AuthNavigator';

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Login'>;
};

export const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cargando, setCargando] = useState(false);
  const [errores, setErrores] = useState<{ email?: string; password?: string }>({});

  const { setSession } = useAuthStore();

  const validar = (): boolean => {
    const nuevosErrores: typeof errores = {};
    if (!email.trim()) nuevosErrores.email = 'El correo es requerido';
    else if (!/\S+@\S+\.\S+/.test(email)) nuevosErrores.email = 'Correo inválido';
    if (!password.trim()) nuevosErrores.password = 'La contraseña es requerida';
    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleLogin = async () => {
    if (!validar()) return;
    setCargando(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      await setSession(data.accessToken, data.refreshToken, data.user);
    } catch (error: unknown) {
      const mensaje =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Credenciales incorrectas. Verifica tu email y contraseña.';
      Alert.alert('Error al ingresar', mensaje);
    } finally {
      setCargando(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={estilos.contenedor}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={estilos.scroll} keyboardShouldPersistTaps="handled">
        <View style={estilos.encabezado}>
          <Text style={estilos.logo}>inDrive+</Text>
          <Text style={estilos.subtitulo}>El precio justo, siempre.</Text>
        </View>

        <View style={estilos.formulario}>
          <CampoEntrada
            etiqueta="Correo electrónico"
            placeholder="tu@email.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            error={errores.email}
          />
          <CampoEntrada
            etiqueta="Contraseña"
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            error={errores.password}
          />

          <BotonNeon
            titulo="Ingresar"
            onPress={handleLogin}
            cargando={cargando}
            estilo={estilos.boton}
          />

          <View style={estilos.pieFormulario}>
            <Text style={estilos.textoRegistro}>¿No tienes cuenta? </Text>
            <Text
              style={estilos.enlaceRegistro}
              onPress={() => navigation.navigate('Register')}
            >
              Regístrate
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const estilos = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing['2xl'],
  },
  encabezado: {
    alignItems: 'center',
    marginBottom: theme.spacing['2xl'],
  },
  logo: {
    ...theme.typography.h1,
    color: theme.colors.primary,
    marginBottom: theme.spacing.sm,
  },
  subtitulo: {
    ...theme.typography.bodyMd,
    color: theme.colors.textSecondary,
  },
  formulario: {
    gap: theme.spacing.lg,
  },
  boton: {
    marginTop: theme.spacing.sm,
  },
  pieFormulario: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: theme.spacing.md,
  },
  textoRegistro: {
    ...theme.typography.bodyMd,
    color: theme.colors.textSecondary,
  },
  enlaceRegistro: {
    ...theme.typography.bodyMd,
    color: theme.colors.primary,
    fontFamily: 'Inter-Bold',
  },
});
