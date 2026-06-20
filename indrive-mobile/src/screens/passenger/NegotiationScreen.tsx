import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { theme } from '../../theme/theme';
import { TarjetaBase } from '../../components/TarjetaBase';
import { TarjetaDialogo } from '../../components/TarjetaDialogo';
import { BotonNeon } from '../../components/BotonNeon';
import { useTripStore, Oferta } from '../../store/useTripStore';
import { PassengerStackParamList } from '../../navigation/PassengerNavigator';
import { getSocket, SERVER_EVENTS, PASSENGER_EVENTS } from '../../services/socket';
import { formatSoles } from '../../utils/format';
import { api } from '../../services/api';

type Props = {
  navigation: NativeStackNavigationProp<PassengerStackParamList, 'Negotiation'>;
  route: RouteProp<PassengerStackParamList, 'Negotiation'>;
};

// Forma de la oferta tal como la emite el backend.
interface BackendOffer {
  id: number;
  driverId: number | null;
  amount: number;
}

export const NegotiationScreen: React.FC<Props> = ({ navigation }) => {
  const { viajeActivo, ofertas, agregarOferta, actualizarEstado, setTarifaFinal, reset, setViajeActivo } =
    useTripStore();

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    // Escuchar ofertas de conductores (mapea la oferta del backend al modelo de la app)
    socket.on(SERVER_EVENTS.OFFER_RECEIVED, async (offer: BackendOffer) => {
      let driverName = `Conductor ${offer.driverId ?? ''}`;
      let vehiclePlate = '—';
      let vehicleModel = '—';

      if (offer.driverId) {
        try {
          const { data } = await api.get(`/users/${offer.driverId}`);
          if (data && data.name) {
            driverName = data.name;
          }
          if (data && data.vehicle) {
            vehiclePlate = data.vehicle.plate || '—';
            vehicleModel = `${data.vehicle.brand || ''} ${data.vehicle.model || ''}`.trim() || '—';
          }
        } catch (err) {
          console.warn('Error fetching driver details:', err);
        }
      }

      const oferta: Oferta = {
        offerId: offer.id,
        conductorId: String(offer.driverId ?? ''),
        conductorNombre: driverName,
        vehiculoPlaca: vehiclePlate,
        vehiculoModelo: vehicleModel,
        montoPropuesto: offer.amount,
      };
      agregarOferta(oferta);
    });

    // Escuchar asignación del viaje
    socket.on(SERVER_EVENTS.TRIP_ASSIGNED, () => {
      actualizarEstado('ASSIGNED');
    });

    // Escuchar finalización del viaje
    socket.on(SERVER_EVENTS.TRIP_COMPLETED, (data: { tarifaFinal: number }) => {
      setTarifaFinal(data.tarifaFinal);
    });

    return () => {
      socket.off(SERVER_EVENTS.OFFER_RECEIVED);
      socket.off(SERVER_EVENTS.TRIP_ASSIGNED);
      socket.off(SERVER_EVENTS.TRIP_COMPLETED);
    };
  }, []);

  const aceptarOferta = (oferta: Oferta) => {
    const socket = getSocket();
    if (!socket || !viajeActivo) return;
    socket.emit(PASSENGER_EVENTS.ACCEPT_OFFER, {
      tripId: Number(viajeActivo.id),
      offerId: oferta.offerId,
    });
    setViajeActivo({
      ...viajeActivo,
      status: 'ASSIGNED',
      conductorId: oferta.conductorId,
      conductorNombre: oferta.conductorNombre,
      vehiculoPlaca: oferta.vehiculoPlaca,
      vehiculoModelo: oferta.vehiculoModelo,
    });
    navigation.navigate('PassengerMap');
  };

  const cancelarViaje = () => {
    const socket = getSocket();
    if (!socket || !viajeActivo) return;
    socket.emit(PASSENGER_EVENTS.CANCEL_TRIP, { tripId: Number(viajeActivo.id) });
    reset();
    navigation.navigate('PassengerMap');
  };

  // Pantalla de pago final cuando el viaje está completado
  if (viajeActivo?.status === 'COMPLETED' && viajeActivo.tarifaFinal) {
    return (
      <View style={estilos.contenedor}>
        <TarjetaDialogo estilo={estilos.dialogoFinal}>
          <Text style={estilos.tituloFinal}>¡Viaje completado!</Text>
          <Text style={estilos.labelFinal}>Total pagado</Text>
          <Text style={estilos.montoFinal}>{formatSoles(viajeActivo.tarifaFinal)}</Text>
          <Text style={estilos.descripcionFinal}>
            {formatSoles(viajeActivo.tarifa.minimo)} mín. · {formatSoles(viajeActivo.tarifa.maximo)} máx.
          </Text>
          <BotonNeon titulo="Volver al inicio" onPress={() => { reset(); navigation.navigate('PassengerMap'); }} />
        </TarjetaDialogo>
      </View>
    );
  }

  return (
    <View style={estilos.contenedor}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.background} />

      {/* ⭐ VISUALIZACIÓN ASIMÉTRICA: Solo muestra el techo al pasajero */}
      <TarjetaBase estilo={estilos.techo}>
        <Text style={estilos.techoLabel}>Tu precio máximo garantizado</Text>
        <Text style={estilos.techoMonto}>
          {viajeActivo ? formatSoles(viajeActivo.tarifa.maximo) : '—'}
        </Text>
        <Text style={estilos.techoPista}>Los conductores te enviarán sus ofertas</Text>
      </TarjetaBase>

      {/* Lista de ofertas recibidas */}
      <View style={estilos.listaContenedor}>
        <Text style={estilos.tituloLista}>
          {ofertas.length === 0 ? 'Buscando conductores...' : `${ofertas.length} oferta(s) recibida(s)`}
        </Text>

        {ofertas.length === 0 ? (
          <ActivityIndicator color={theme.colors.primary} style={{ marginTop: 32 }} />
        ) : (
          <FlatList
            data={ofertas}
            keyExtractor={(item) => String(item.offerId)}
            renderItem={({ item }) => (
              <TarjetaBase estilo={estilos.tarjetaOferta}>
                <View style={estilos.filaOferta}>
                  <View>
                    <Text style={estilos.nombreConductor}>{item.conductorNombre}</Text>
                    <Text style={estilos.vehiculo}>{item.vehiculoModelo} · {item.vehiculoPlaca}</Text>
                  </View>
                  <Text style={estilos.montoOferta}>{formatSoles(item.montoPropuesto)}</Text>
                </View>
                <BotonNeon titulo="Aceptar esta oferta" onPress={() => aceptarOferta(item)} />
              </TarjetaBase>
            )}
            ItemSeparatorComponent={() => <View style={{ height: theme.spacing.md }} />}
          />
        )}
      </View>

      <View style={estilos.botonCancelar}>
        <BotonNeon
          titulo="Cancelar búsqueda"
          onPress={cancelarViaje}
          estilo={{ backgroundColor: theme.colors.surfaceSecondary }}
        />
      </View>
    </View>
  );
};

const estilos = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: theme.colors.background },
  techo: {
    margin: theme.spacing.xl,
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  techoLabel: { ...theme.typography.bodyMd, color: theme.colors.textSecondary },
  techoMonto: { ...theme.typography.h1, color: theme.colors.primary },
  techoPista: { ...theme.typography.caption, color: theme.colors.textMuted },
  listaContenedor: { flex: 1, paddingHorizontal: theme.spacing.xl },
  tituloLista: { ...theme.typography.bodyLg, color: theme.colors.textPrimary, marginBottom: theme.spacing.md, fontFamily: 'Inter-Bold' },
  tarjetaOferta: { gap: theme.spacing.md },
  filaOferta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  nombreConductor: { ...theme.typography.bodyLg, color: theme.colors.textPrimary, fontFamily: 'Inter-Bold' },
  vehiculo: { ...theme.typography.caption, color: theme.colors.textSecondary },
  montoOferta: { ...theme.typography.h2, color: theme.colors.primary },
  botonCancelar: { padding: theme.spacing.xl },
  // Pantalla final
  dialogoFinal: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: theme.spacing.lg },
  tituloFinal: { ...theme.typography.h1, color: theme.colors.textPrimary },
  labelFinal: { ...theme.typography.bodyMd, color: theme.colors.textSecondary },
  montoFinal: { ...theme.typography.h1, color: theme.colors.primary, fontSize: 48 },
  descripcionFinal: { ...theme.typography.caption, color: theme.colors.textMuted },
});
