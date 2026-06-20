import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Animated,
  Easing,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { theme } from '../../theme/theme';
import { TarjetaBase } from '../../components/TarjetaBase';
import { BotonNeon } from '../../components/BotonNeon';
import { useTripStore } from '../../store/useTripStore';
import { PassengerStackParamList } from '../../navigation/PassengerNavigator';
import { formatSoles, formatDistancia, formatDuracion } from '../../utils/format';

type Props = {
  navigation: NativeStackNavigationProp<PassengerStackParamList, 'TripAccepted'>;
  route: RouteProp<PassengerStackParamList, 'TripAccepted'>;
};

const PROMEDIO_KMH_LLEGADA = 18; // km/h promedio en tráfico de Lima para la llegada del conductor

export const TripAcceptedScreen: React.FC<Props> = ({ navigation }) => {
  const { viajeActivo } = useTripStore();

  // Animations
  const checkScale = useRef(new Animated.Value(0)).current;
  const fadeIn = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(40)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const progressWidth = useRef(new Animated.Value(0)).current;

  // ETA estimado: asumimos que el conductor está a ~3km en promedio dentro de Lima
  const etaMinutos = viajeActivo
    ? Math.max(3, Math.round((viajeActivo.distanciaKm * 0.3 / PROMEDIO_KMH_LLEGADA) * 60))
    : 5;

  useEffect(() => {
    // Entrance animations sequence
    Animated.sequence([
      // 1. Check icon pops in
      Animated.spring(checkScale, {
        toValue: 1,
        tension: 120,
        friction: 6,
        useNativeDriver: true,
      }),
      // 2. Content fades in and slides up
      Animated.parallel([
        Animated.timing(fadeIn, {
          toValue: 1,
          duration: 500,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(slideUp, {
          toValue: 0,
          duration: 500,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Pulse animation for the ETA badge (loop)
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Progress bar animation (visual countdown)
    Animated.timing(progressWidth, {
      toValue: 1,
      duration: 6000,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start();

    // Auto-navigate to map after 6 seconds
    const timer = setTimeout(() => {
      navigation.replace('PassengerMap');
    }, 6000);

    return () => clearTimeout(timer);
  }, []);

  const irAlMapa = () => {
    navigation.replace('PassengerMap');
  };

  if (!viajeActivo) {
    navigation.replace('PassengerMap');
    return null;
  }

  return (
    <View style={estilos.contenedor}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.background} />

      {/* Background glow effect */}
      <View style={estilos.glowContainer}>
        <View style={estilos.glowCircle} />
      </View>

      {/* Check icon animation */}
      <Animated.View
        style={[
          estilos.checkContainer,
          { transform: [{ scale: checkScale }] },
        ]}
      >
        <View style={estilos.checkCircle}>
          <Text style={estilos.checkIcon}>✓</Text>
        </View>
      </Animated.View>

      {/* Main content */}
      <Animated.View
        style={[
          estilos.contenido,
          {
            opacity: fadeIn,
            transform: [{ translateY: slideUp }],
          },
        ]}
      >
        <Text style={estilos.tituloConfirmacion}>¡Solicitud aceptada!</Text>
        <Text style={estilos.subtituloConfirmacion}>
          Tu conductor está en camino
        </Text>

        {/* ETA Badge */}
        <Animated.View
          style={[
            estilos.etaBadge,
            { transform: [{ scale: pulseAnim }] },
          ]}
        >
          <Text style={estilos.etaNumero}>{etaMinutos}</Text>
          <Text style={estilos.etaUnidad}>min</Text>
          <Text style={estilos.etaLabel}>llegada estimada</Text>
        </Animated.View>

        {/* Route card */}
        <TarjetaBase estilo={estilos.tarjetaRuta}>
          {/* Origin */}
          <View style={estilos.filaRuta}>
            <View style={estilos.indicadorContainer}>
              <View style={estilos.puntoOrigen} />
              <View style={estilos.lineaConector} />
            </View>
            <View style={estilos.direccionContainer}>
              <Text style={estilos.rutaLabel}>Origen</Text>
              <Text style={estilos.rutaDireccion} numberOfLines={2}>
                {viajeActivo.origenDireccion}
              </Text>
            </View>
          </View>

          {/* Destination */}
          <View style={estilos.filaRuta}>
            <View style={estilos.indicadorContainer}>
              <View style={estilos.puntoDestino} />
            </View>
            <View style={estilos.direccionContainer}>
              <Text style={estilos.rutaLabel}>Destino</Text>
              <Text style={estilos.rutaDireccion} numberOfLines={2}>
                {viajeActivo.destinoDireccion}
              </Text>
            </View>
          </View>

          {/* Trip details row */}
          <View style={estilos.separador} />
          <View style={estilos.detallesViaje}>
            <View style={estilos.detalleItem}>
              <Text style={estilos.detalleIcono}>📏</Text>
              <Text style={estilos.detalleValor}>{formatDistancia(viajeActivo.distanciaKm)}</Text>
            </View>
            <View style={estilos.detalleSeparador} />
            <View style={estilos.detalleItem}>
              <Text style={estilos.detalleIcono}>⏱️</Text>
              <Text style={estilos.detalleValor}>{formatDuracion(viajeActivo.duracionMin)}</Text>
            </View>
            <View style={estilos.detalleSeparador} />
            <View style={estilos.detalleItem}>
              <Text style={estilos.detalleIcono}>💰</Text>
              <Text style={estilos.detalleValor}>
                {formatSoles(viajeActivo.tarifa.maximo)}
              </Text>
            </View>
          </View>
        </TarjetaBase>

        {/* Driver info card */}
        <TarjetaBase estilo={estilos.tarjetaConductor}>
          <View style={estilos.conductorFila}>
            <View style={estilos.avatarConductor}>
              <Text style={estilos.avatarIcono}>🧑‍✈️</Text>
            </View>
            <View style={estilos.conductorInfo}>
              <Text style={estilos.conductorNombre}>
                {viajeActivo.conductorNombre || 'Conductor asignado'}
              </Text>
              <Text style={estilos.conductorVehiculo}>
                {viajeActivo.vehiculoModelo || 'Vehículo'} · {viajeActivo.vehiculoPlaca || '—'}
              </Text>
            </View>
          </View>
        </TarjetaBase>

        {/* Progress bar + CTA */}
        <View style={estilos.progressContainer}>
          <Animated.View
            style={[
              estilos.progressBar,
              {
                width: progressWidth.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]}
          />
        </View>

        <BotonNeon titulo="Ver en el mapa" onPress={irAlMapa} />
      </Animated.View>
    </View>
  );
};

const estilos = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.xl,
  },

  // Glow effect
  glowContainer: {
    position: 'absolute',
    top: '15%',
    alignItems: 'center',
    width: '100%',
  },
  glowCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: theme.colors.primary,
    opacity: 0.06,
  },

  // Check icon
  checkContainer: {
    marginBottom: theme.spacing.xl,
  },
  checkCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    // Shadow/glow
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  checkIcon: {
    fontSize: 40,
    color: theme.colors.background,
    fontWeight: '900',
  },

  // Main content
  contenido: {
    width: '100%',
    alignItems: 'center',
    gap: theme.spacing.lg,
  },
  tituloConfirmacion: {
    ...theme.typography.h1,
    color: theme.colors.textPrimary,
    textAlign: 'center',
  },
  subtituloConfirmacion: {
    ...theme.typography.bodyLg,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: -theme.spacing.sm,
  },

  // ETA Badge
  etaBadge: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surfaceTertiary,
    borderRadius: theme.rounded['2xl'],
    paddingHorizontal: theme.spacing['2xl'],
    paddingVertical: theme.spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(198, 247, 10, 0.2)',
  },
  etaNumero: {
    fontFamily: 'Inter-ExtraBold',
    fontSize: 48,
    color: theme.colors.primary,
    lineHeight: 52,
    letterSpacing: -1,
  },
  etaUnidad: {
    ...theme.typography.bodyLg,
    color: theme.colors.primary,
    fontFamily: 'Inter-Bold',
    marginTop: -4,
  },
  etaLabel: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.xs,
  },

  // Route card
  tarjetaRuta: {
    width: '100%',
    gap: theme.spacing.sm,
  },
  filaRuta: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  indicadorContainer: {
    alignItems: 'center',
    width: 20,
    paddingTop: 4,
  },
  puntoOrigen: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: theme.colors.locationCurrent,
    borderWidth: 2,
    borderColor: theme.colors.background,
  },
  lineaConector: {
    width: 2,
    height: 24,
    backgroundColor: theme.colors.borderSubtle,
    marginTop: 4,
  },
  puntoDestino: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: theme.colors.locationDestination,
    borderWidth: 2,
    borderColor: theme.colors.background,
  },
  direccionContainer: {
    flex: 1,
  },
  rutaLabel: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
    fontSize: 11,
    letterSpacing: 0.5,
  },
  rutaDireccion: {
    ...theme.typography.bodyMd,
    color: theme.colors.textPrimary,
    marginTop: 2,
  },

  // Trip details
  separador: {
    height: 1,
    backgroundColor: theme.colors.borderSubtle,
    marginVertical: theme.spacing.xs,
  },
  detallesViaje: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  detalleItem: {
    alignItems: 'center',
    gap: 4,
  },
  detalleIcono: {
    fontSize: 16,
  },
  detalleValor: {
    ...theme.typography.caption,
    color: theme.colors.textPrimary,
    fontFamily: 'Inter-Bold',
  },
  detalleSeparador: {
    width: 1,
    height: 24,
    backgroundColor: theme.colors.borderSubtle,
  },

  // Driver card
  tarjetaConductor: {
    width: '100%',
  },
  conductorFila: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  avatarConductor: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: theme.colors.surfaceSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  avatarIcono: {
    fontSize: 26,
  },
  conductorInfo: {
    flex: 1,
  },
  conductorNombre: {
    ...theme.typography.bodyLg,
    color: theme.colors.textPrimary,
    fontFamily: 'Inter-Bold',
  },
  conductorVehiculo: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },

  // Progress bar
  progressContainer: {
    width: '100%',
    height: 3,
    backgroundColor: theme.colors.surfaceSecondary,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: 2,
  },
});
