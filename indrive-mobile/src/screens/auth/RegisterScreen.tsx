import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { theme } from '../../theme/theme';
import { BotonNeon } from '../../components/BotonNeon';
import { CampoEntrada } from '../../components/CampoEntrada';
import { api } from '../../services/api';
import { useAuthStore } from '../../store/useAuthStore';
import { API_BASE_URL } from '../../services/config';
import { AuthStackParamList } from '../../navigation/AuthNavigator';

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Register'>;
};

export const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [rol, setRol] = useState<'passenger' | 'driver'>('passenger');
  const [cargando, setCargando] = useState(false);
  const [errores, setErrores] = useState<Record<string, string>>({});

  const { setSession } = useAuthStore();

  const validar = (): boolean => {
    const e: Record<string, string> = {};
    if (!nombre.trim()) e.nombre = 'El nombre es requerido';
    if (!email.trim()) e.email = 'El correo es requerido';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Correo inválido';
    if (password.length < 8) e.password = 'Mínimo 8 caracteres';
    if (password !== confirmar) e.confirmar = 'Las contraseñas no coinciden';
    setErrores(e);
    return Object.keys(e).length === 0;
  };

  const handleRegistro = async () => {
    if (!validar()) return;
    setCargando(true);
    try {
      const { data } = await api.post('/auth/register', {
        name: nombre,
        email,
        password,
        role: rol,
      });
      await setSession(data.accessToken, data.refreshToken, data.user);
    } catch (error: unknown) {
      console.warn('[RegisterScreen Error]:', error);
      const axiosError = error as { response?: { data?: { message?: string | string[] }; status?: number }; message?: string; code?: string };
      const mensaje = axiosError?.response?.data?.message;
      const mensajeMostrar = Array.isArray(mensaje) ? mensaje.join(', ') : mensaje || null;
      
      let errorMsg = 'Error al crear la cuenta. Intenta de nuevo.';
      if (mensajeMostrar) {
        errorMsg = mensajeMostrar;
      } else if (axiosError?.code === 'ERR_NETWORK' || !axiosError?.response) {
        errorMsg = 'Error de conexión. Verifica que el servidor esté encendido e intenta de nuevo.';
      }
      Alert.alert('Error en el registro', errorMsg);
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
          <Text style={estilos.titulo}>Crear cuenta</Text>
          <Text style={estilos.subtitulo}>Únete a inDrive+ hoy</Text>
        </View>

        <View style={estilos.formulario}>
          <CampoEntrada
            etiqueta="Nombre completo"
            placeholder="Juan Pérez"
            value={nombre}
            onChangeText={setNombre}
            autoCapitalize="words"
            error={errores.nombre}
          />
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
            placeholder="Mínimo 8 caracteres"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            error={errores.password}
          />
          <CampoEntrada
            etiqueta="Confirmar contraseña"
            placeholder="Repite tu contraseña"
            value={confirmar}
            onChangeText={setConfirmar}
            secureTextEntry
            error={errores.confirmar}
          />

          <View>
            <Text style={estilos.etiquetaRol}>Quiero usar inDrive+ como</Text>
            <View style={estilos.selectorRol}>
              <TouchableOpacity
                style={[estilos.opcionRol, rol === 'passenger' && estilos.opcionRolActiva]}
                onPress={() => setRol('passenger')}
              >
                <Text style={[estilos.opcionRolTexto, rol === 'passenger' && estilos.opcionRolTextoActivo]}>
                  🧑 Pasajero
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[estilos.opcionRol, rol === 'driver' && estilos.opcionRolActiva]}
                onPress={() => setRol('driver')}
              >
                <Text style={[estilos.opcionRolTexto, rol === 'driver' && estilos.opcionRolTextoActivo]}>
                  🚗 Conductor
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <BotonNeon
            titulo="Crear cuenta"
            onPress={handleRegistro}
            cargando={cargando}
            estilo={estilos.boton}
          />

          <View style={estilos.pieFormulario}>
            <Text style={estilos.textoLogin}>¿Ya tienes cuenta? </Text>
            <Text
              style={estilos.enlaceLogin}
              onPress={() => navigation.navigate('Login')}
            >
              Inicia sesión
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
  titulo: {
    ...theme.typography.h2,
    color: theme.colors.textPrimary,
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
  etiquetaRol: {
    ...theme.typography.bodyMd,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  selectorRol: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  opcionRol: {
    flex: 1,
    height: 48,
    borderRadius: theme.rounded.md,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
    justifyContent: 'center',
    alignItems: 'center',
  },
  opcionRolActiva: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.surfaceTertiary,
  },
  opcionRolTexto: {
    ...theme.typography.bodyMd,
    color: theme.colors.textSecondary,
  },
  opcionRolTextoActivo: {
    color: theme.colors.primary,
    fontFamily: 'Inter-Bold',
  },
  pieFormulario: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: theme.spacing.md,
  },
  textoLogin: {
    ...theme.typography.bodyMd,
    color: theme.colors.textSecondary,
  },
  enlaceLogin: {
    ...theme.typography.bodyMd,
    color: theme.colors.primary,
    fontFamily: 'Inter-Bold',
  },
});
