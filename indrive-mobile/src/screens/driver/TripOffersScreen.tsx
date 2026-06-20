import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  StatusBar,
  Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { theme } from '../../theme/theme';
import { TarjetaBase } from '../../components/TarjetaBase';
import { BotonNeon } from '../../components/BotonNeon';
import { CampoEntrada } from '../../components/CampoEntrada';
import { api } from '../../services/api';
import { useTripStore, ViajeActivo } from '../../store/useTripStore';
import { DriverStackParamList } from '../../navigation/DriverNavigator';
import { getSocket, DRIVER_EVENTS, SERVER_EVENTS } from '../../services/socket';
import { LIMA_CENTRO } from '../../services/config';
import { formatSoles, formatDistancia, formatDuracion } from '../../utils/format';

type Props = {
  navigation: NativeStackNavigationProp<DriverStackParamList, 'TripOffers'>;
};

// Forma del viaje tal como lo devuelve el backend en la vista del conductor.
interface BackendTrip {
  id: number;
  status: ViajeActivo['status'];
  origin: string;
  destination: string;
  distanceKm: number;
  minimumPrice: number;
  acceptedPrice?: number;
}

const PROMEDIO_KMH = 20;

// El backend no guarda coordenadas ni duración del viaje; se completan acá.
const mapBackendTrip = (t: BackendTrip): ViajeActivo => {
  const origen = {
    latitude: LIMA_CENTRO.latitude,
    longitude: LIMA_CENTRO.longitude,
  };
  return {
    id: String(t.id),
    status: t.status,
    origen,
    destino: origen,
    origenDireccion: t.origin,
    destinoDireccion: t.destination,
    distanciaKm: t.distanceKm,
    duracionMin: Math.round((t.distanceKm / PROMEDIO_KMH) * 60),
    tarifa: { minimo: t.minimumPrice, maximo: 0 },
    acceptedPrice: t.acceptedPrice,
  };
};

export const TripOffersScreen: React.FC<Props> = ({ navigation }) => {
  const [solicitudes, setSolicitudes] = useState<ViajeActivo[]>([]);
  const [cargando, setCargando] = useState(true);
  const [ofertas, setOfertas] = useState<Record<string, string>>({});
  const [ofrecidos, setOfrecidos] = useState<Record<string, boolean>>({});
  const descartadosRef = React.useRef<string[]>([]);

  const { setViajeActivo } = useTripStore();

  useEffect(() => {
    cargarSolicitudes();

    const socket = getSocket();
    if (socket) {
      // Nuevas solicitudes en tiempo real
      socket.on(SERVER_EVENTS.TRIP_CREATED, (t: BackendTrip) => {
        const viaje = mapBackendTrip(t);
        if (descartadosRef.current.includes(viaje.id)) return;
        setSolicitudes((prev) => {
          if (prev.some((s) => s.id === viaje.id)) return prev;
          return [viaje, ...prev];
        });
      });

      // Si el pasajero acepta nuestra oferta
      socket.on(SERVER_EVENTS.TRIP_ASSIGNED, (t: BackendTrip) => {
        const viaje = mapBackendTrip(t);
        setViajeActivo(viaje);
        navigation.navigate('DriverTripAccepted');
      });

      // Escuchar errores del servidor
      socket.on('error', (err: { message: string }) => {
        Alert.alert('Error de Oferta', err.message);
      });
    }

    return () => {
      socket?.off(SERVER_EVENTS.TRIP_CREATED);
      socket?.off(SERVER_EVENTS.TRIP_ASSIGNED);
      socket?.off('error');
    };
  }, []);

  const cargarSolicitudes = async () => {
    setCargando(true);
    try {
      const { data } = await api.get<BackendTrip[]>('/trips/available');
      const mapeados = data.map(mapBackendTrip);
      setSolicitudes(mapeados.filter((s) => !descartadosRef.current.includes(s.id)));
    } catch (e) {
      console.error('Error cargando solicitudes:', e);
    } finally {
      setCargando(false);
    }
  };

  const descartarSolicitud = (id: string) => {
    descartadosRef.current.push(id);
    setSolicitudes((prev) => prev.filter((s) => s.id !== id));
  };

  const enviarOferta = (tripId: string) => {
    const socket = getSocket();
    const solicitud = solicitudes.find((s) => s.id === tripId);
    if (!solicitud) return;

    const valorIngresado = ofertas[tripId];
    const monto = valorIngresado ? parseFloat(valorIngresado) : solicitud.tarifa.minimo;

    if (!socket || !monto) return;

    socket.emit(DRIVER_EVENTS.SEND_OFFER, {
      tripId: Number(tripId),
      amount: monto,
    });

    setOfrecidos((prev) => ({ ...prev, [tripId]: true }));
  };

  return (
    <View style={estilos.contenedor}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.background} />

      <View style={estilos.encabezado}>
        <Text style={estilos.titulo}>Solicitudes de viaje</Text>
        <Text style={estilos.subtitulo}>Lima Metropolitana</Text>
      </View>

      {cargando ? (
        <ActivityIndicator color={theme.colors.primary} style={{ flex: 1 }} />
      ) : (
        <FlatList
          data={solicitudes}
          keyExtractor={(item) => item.id}
          contentContainerStyle={estilos.lista}
          renderItem={({ item }) => (
            <TarjetaBase estilo={estilos.tarjetaSolicitud}>
              <View style={estilos.filaDireccion}>
                <View style={estilos.puntoOrigen} />
                <Text style={estilos.textoDireccion} numberOfLines={1}>
                  {item.origenDireccion}
                </Text>
              </View>
              <View style={estilos.lineaConector} />
              <View style={estilos.filaDireccion}>
                <View style={estilos.puntoDestino} />
                <Text style={estilos.textoDireccion} numberOfLines={1}>
                  {item.destinoDireccion}
                </Text>
              </View>

              <View style={estilos.detalles}>
                <Text style={estilos.detalleTexto}>{formatDistancia(item.distanciaKm)}</Text>
                <Text style={estilos.detalleTexto}>·</Text>
                <Text style={estilos.detalleTexto}>{formatDuracion(item.duracionMin)}</Text>
              </View>

              {/* ⭐ VISUALIZACIÓN ASIMÉTRICA: Conductor solo ve el PISO (mínimo) */}
              <View style={estilos.pisoTarifario}>
                <Text style={estilos.pisoLabel}>Ganancia mínima garantizada</Text>
                <Text style={estilos.pisoMonto}>{formatSoles(item.tarifa.minimo)}</Text>
              </View>

              <CampoEntrada
                etiqueta="Tu oferta (en soles)"
                placeholder={formatSoles(item.tarifa.minimo)}
                value={ofertas[item.id] || ''}
                onChangeText={(val) =>
                  setOfertas((prev) => ({ ...prev, [item.id]: val }))
                }
                keyboardType="numeric"
                editable={!ofrecidos[item.id]}
              />

              <View style={estilos.filaBotones}>
                <BotonNeon
                  titulo="Descartar"
                  onPress={() => descartarSolicitud(item.id)}
                  estilo={estilos.botonDescartar}
                  deshabilitado={ofrecidos[item.id]}
                />
                <BotonNeon
                  titulo={ofrecidos[item.id] ? 'Oferta enviada' : 'Enviar oferta'}
                  onPress={() => enviarOferta(item.id)}
                  estilo={ofrecidos[item.id] ? estilos.botonEnviado : estilos.botonEnviar}
                  deshabilitado={ofrecidos[item.id]}
                />
              </View>
            </TarjetaBase>
          )}
          ItemSeparatorComponent={() => <View style={{ height: theme.spacing.md }} />}
          ListEmptyComponent={
            <View style={estilos.vacio}>
              <Text style={estilos.vacioTexto}>No hay solicitudes disponibles</Text>
              <Text style={estilos.vacioPista}>Nuevas solicitudes aparecerán aquí automáticamente</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const estilos = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: theme.colors.background },
  encabezado: {
    paddingTop: 48,
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing.lg,
  },
  titulo: { ...theme.typography.h2, color: theme.colors.textPrimary },
  subtitulo: { ...theme.typography.bodyMd, color: theme.colors.textSecondary },
  lista: { paddingHorizontal: theme.spacing.xl, paddingBottom: 32 },
  tarjetaSolicitud: { gap: theme.spacing.md },
  filaDireccion: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md },
  puntoOrigen: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.locationCurrent,
  },
  puntoDestino: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.locationDestination,
  },
  lineaConector: {
    width: 2,
    height: 16,
    backgroundColor: theme.colors.borderSubtle,
    marginLeft: 4,
  },
  textoDireccion: { ...theme.typography.bodyMd, color: theme.colors.textPrimary, flex: 1 },
  detalles: { flexDirection: 'row', gap: theme.spacing.sm },
  detalleTexto: { ...theme.typography.caption, color: theme.colors.textSecondary },
  pisoTarifario: {
    backgroundColor: theme.colors.surfaceTertiary,
    borderRadius: theme.rounded.md,
    padding: theme.spacing.md,
  },
  pisoLabel: { ...theme.typography.caption, color: theme.colors.textSecondary },
  pisoMonto: { ...theme.typography.h2, color: theme.colors.primary },
  vacio: { alignItems: 'center', paddingTop: 64, gap: theme.spacing.sm },
  vacioTexto: { ...theme.typography.bodyLg, color: theme.colors.textSecondary },
  vacioPista: { ...theme.typography.caption, color: theme.colors.textMuted, textAlign: 'center' },
  filaBotones: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginTop: theme.spacing.xs,
  },
  botonDescartar: {
    flex: 1,
    backgroundColor: theme.colors.surfaceSecondary,
  },
  botonEnviar: {
    flex: 1.5,
  },
  botonEnviado: {
    flex: 1.5,
    backgroundColor: theme.colors.surfaceTertiary,
  },
});
