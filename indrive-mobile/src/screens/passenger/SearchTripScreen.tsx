import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Platform,
  ScrollView,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { theme } from '../../theme/theme';
import { CampoEntrada } from '../../components/CampoEntrada';
import { BotonNeon } from '../../components/BotonNeon';
import { TarjetaBase } from '../../components/TarjetaBase';
import { api } from '../../services/api';
import { useTripStore } from '../../store/useTripStore';
import { PassengerStackParamList } from '../../navigation/PassengerNavigator';
import {
  GOOGLE_MAPS_API_KEY,
  LIMA_CENTRO,
  LIMA_RADIO_BUSQUEDA,
} from '../../services/config';
import { decodePolyline } from '../../utils/polyline';
import { formatSoles, formatDistancia, formatDuracion } from '../../utils/format';
import * as Location from 'expo-location';

type Props = {
  navigation: NativeStackNavigationProp<PassengerStackParamList, 'SearchTrip'>;
};

interface PlaceSuggestion {
  placeId: string;
  descripcion: string;
  principal: string;
}

interface PricingFactors {
  distanceKm: number;
  fuelPricePerGallon: number;
  vehicleCapacity: number;
  trafficMultiplier: number;
  hourMultiplier: number;
  durationMin: number;
  historicAveragePrice: number;
}

interface TripPreview {
  distanciaKm: number;
  duracionMin: number;
  tarifaMax: number;
  pricingFactors: PricingFactors | null;
}

interface Coords {
  latitude: number;
  longitude: number;
}

export const SearchTripScreen: React.FC<Props> = ({ navigation }) => {
  const [destino, setDestino] = useState('');
  const [sugerencias, setSugerencias] = useState<PlaceSuggestion[]>([]);
  const [lugarSeleccionado, setLugarSeleccionado] = useState<PlaceSuggestion | null>(null);
  const [preview, setPreview] = useState<TripPreview | null>(null);
  const [destinoCoords, setDestinoCoords] = useState<Coords | null>(null);
  const [buscando, setBuscando] = useState(false);
  const [solicitando, setSolicitando] = useState(false);
  const [ofertaInicial, setOfertaInicial] = useState('');

  const [origenCoords, setOrigenCoords] = useState<Coords>(LIMA_CENTRO);
  const [origenDireccion, setOrigenDireccion] = useState('Obteniendo ubicación...');

  const { setViajeActivo, setRutaCoords } = useTripStore();

  React.useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setOrigenDireccion('Lima Centro, Perú');
          return;
        }
        const location = await Location.getCurrentPositionAsync({});
        const coords = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        };
        setOrigenCoords(coords);
        
        const address = await Location.reverseGeocodeAsync(coords);
        if (address && address.length > 0) {
          const item = address[0];
          const parts = [];
          if (item.street) {
            parts.push(item.street + (item.streetNumber ? ` ${item.streetNumber}` : ''));
          }
          if (item.district) {
            parts.push(item.district);
          }
          const formatted = parts.join(', ') || 'Ubicación actual';
          setOrigenDireccion(formatted);
        } else {
          setOrigenDireccion('Ubicación actual');
        }
      } catch (e) {
        console.error('Error obteniendo ubicación GPS:', e);
        setOrigenDireccion('Ubicación actual');
      }
    })();
  }, []);

  const buscarLugares = async (texto: string) => {
    setDestino(texto);
    if (texto.length < 3) {
      setSugerencias([]);
      return;
    }
    if (Platform.OS === 'web') {
      const mockPlaces = [
        { placeId: 'san_isidro', descripcion: 'San Isidro, Lima, Perú', principal: 'San Isidro' },
        { placeId: 'miraflores', descripcion: 'Miraflores, Lima, Perú', principal: 'Miraflores' },
        { placeId: 'surco', descripcion: 'Santiago de Surco, Lima, Perú', principal: 'Santiago de Surco' },
        { placeId: 'san_miguel', descripcion: 'San Miguel, Lima, Perú', principal: 'San Miguel' },
      ];
      setSugerencias(
        mockPlaces.filter((p) => p.descripcion.toLowerCase().includes(texto.toLowerCase()))
      );
      return;
    }
    setBuscando(true);
    try {
      const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(texto)}&location=${LIMA_CENTRO.latitude},${LIMA_CENTRO.longitude}&radius=${LIMA_RADIO_BUSQUEDA}&components=country:pe&key=${GOOGLE_MAPS_API_KEY}`;
      // Llamada directa a Google (sin pasar por el backend)
      const resp = await fetch(url);
      const json = await resp.json();
      if (json.predictions) {
        setSugerencias(
          json.predictions.map((p: { place_id: string; description: string; structured_formatting: { main_text: string } }) => ({
            placeId: p.place_id,
            descripcion: p.description,
            principal: p.structured_formatting.main_text,
          }))
        );
      }
    } catch (e) {
      console.error('Error buscando lugares:', e);
    } finally {
      setBuscando(false);
    }
  };

  const seleccionarLugar = async (lugar: PlaceSuggestion) => {
    setLugarSeleccionado(lugar);
    setSugerencias([]);
    setDestino(lugar.principal);

    // Obtener detalles y calcular ruta
    try {
      let coords = { lat: LIMA_CENTRO.latitude, lng: LIMA_CENTRO.longitude };

      if (Platform.OS === 'web') {
        if (lugar.placeId === 'san_isidro') {
          coords = { lat: -12.0913, lng: -77.0378 };
        } else if (lugar.placeId === 'miraflores') {
          coords = { lat: -12.1221, lng: -77.0298 };
        } else if (lugar.placeId === 'surco') {
          coords = { lat: -12.1256, lng: -76.9854 };
        }
      } else {
        const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${lugar.placeId}&fields=geometry&key=${GOOGLE_MAPS_API_KEY}`;
        const detailsResp = await fetch(detailsUrl);
        const detailsJson = await detailsResp.json();
        const detailsCoords = detailsJson.result.geometry.location;
        coords = { lat: detailsCoords.lat, lng: detailsCoords.lng };
      }

      setDestinoCoords({ latitude: coords.lat, longitude: coords.lng });

      // Cotización pre-viaje: el backend (Integración + Motor) devuelve
      // distancia, duración, polyline y el TECHO (visualización asimétrica).
      const { data: tripData } = await api.post('/trips/quote', {
        origin: origenDireccion,
        destination: lugar.descripcion,
      });

      setPreview({
        distanciaKm: tripData.distanceKm,
        duracionMin: tripData.durationMin,
        tarifaMax: tripData.maximumPrice,
        pricingFactors: tripData.pricingFactors || null,
      });

      if (tripData.polyline) {
        setRutaCoords(decodePolyline(tripData.polyline));
      }

      setOfertaInicial(String(tripData.maximumPrice));
    } catch (e) {
      console.error('Error calculando ruta:', e);
    }
  };

  const solicitarViaje = async () => {
    if (!lugarSeleccionado || !preview) return;
    setSolicitando(true);
    try {
      const { data } = await api.post('/trips', {
        origin: origenDireccion,
        destination: lugarSeleccionado.descripcion,
      });
      const origen: Coords = origenCoords;
      setViajeActivo({
        id: String(data.id),
        status: data.status,
        origen,
        destino: destinoCoords ?? origen,
        origenDireccion: origenDireccion,
        destinoDireccion: lugarSeleccionado.descripcion,
        distanciaKm: preview.distanciaKm,
        duracionMin: preview.duracionMin,
        tarifa: { minimo: 0, maximo: preview.tarifaMax },
      });
      navigation.navigate('Negotiation', { tripId: String(data.id) });
    } catch (e) {
      console.error('Error solicitando viaje:', e);
    } finally {
      setSolicitando(false);
    }
  };

  return (
    <View style={estilos.contenedor}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.background} />

      <View style={estilos.encabezado}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={estilos.botonVolver}>
          <Text style={estilos.textoVolver}>← Volver</Text>
        </TouchableOpacity>
        <Text style={estilos.titulo}>¿A dónde vas?</Text>
      </View>

      <View style={estilos.cuerpo}>
        <CampoEntrada
          placeholder="Busca tu destino en Lima..."
          value={destino}
          onChangeText={buscarLugares}
          autoFocus
        />

        {buscando && <ActivityIndicator color={theme.colors.primary} style={{ marginTop: 12 }} />}

        <FlatList
          data={sugerencias}
          keyExtractor={(item) => item.placeId}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={estilos.sugerencia}
              onPress={() => seleccionarLugar(item)}
            >
              <Text style={estilos.sugerenciaPrincipal}>{item.principal}</Text>
              <Text style={estilos.sugerenciaDescripcion} numberOfLines={1}>
                {item.descripcion}
              </Text>
            </TouchableOpacity>
          )}
          ItemSeparatorComponent={() => <View style={estilos.separador} />}
        />

        {/* Preview de tarifa — muestra las 7 métricas del motor tarifario */}
        {preview && (
          <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          <TarjetaBase estilo={estilos.preview}>
            <Text style={estilos.previewTitulo}>Detalles del viaje</Text>
            <View style={estilos.previewFila}>
              <Text style={estilos.previewLabel}>Distancia</Text>
              <Text style={estilos.previewValor}>{formatDistancia(preview.distanciaKm)}</Text>
            </View>
            <View style={estilos.previewFila}>
              <Text style={estilos.previewLabel}>Tiempo estimado</Text>
              <Text style={estilos.previewValor}>{formatDuracion(preview.duracionMin)}</Text>
            </View>

            {/* ⭐ DESGLOSE DEL MOTOR TARIFARIO — 7 métricas */}
            {preview.pricingFactors && (
              <View style={estilos.desgloseContainer}>
                <View style={estilos.desgloseTituloFila}>
                  <Text style={estilos.desgloseTitulo}>Motor Tarifario Inteligente</Text>
                  <View style={estilos.badgeMotor}>
                    <Text style={estilos.badgeMotorTexto}>7 factores</Text>
                  </View>
                </View>
                <Text style={estilos.desgloseSubtitulo}>
                  Factores que determinan tu tarifa
                </Text>

                {/* 1. Distancia */}
                <View style={estilos.factorFila}>
                  <View style={estilos.factorIconContainer}>
                    <Text style={estilos.factorIcon}>📏</Text>
                  </View>
                  <View style={estilos.factorInfo}>
                    <Text style={estilos.factorNombre}>Distancia</Text>
                    <Text style={estilos.factorOrigen}>Google Maps API</Text>
                  </View>
                  <Text style={estilos.factorValor}>{formatDistancia(preview.pricingFactors.distanceKm)}</Text>
                </View>

                {/* 2. Precio de combustible */}
                <View style={estilos.factorFila}>
                  <View style={estilos.factorIconContainer}>
                    <Text style={estilos.factorIcon}>⛽</Text>
                  </View>
                  <View style={estilos.factorInfo}>
                    <Text style={estilos.factorNombre}>Precio de combustible</Text>
                    <Text style={estilos.factorOrigen}>OSINERGMIN API</Text>
                  </View>
                  <Text style={estilos.factorValor}>S/ {preview.pricingFactors.fuelPricePerGallon.toFixed(2)}/gal</Text>
                </View>

                {/* 3. Capacidad del vehículo */}
                <View style={estilos.factorFila}>
                  <View style={estilos.factorIconContainer}>
                    <Text style={estilos.factorIcon}>🚗</Text>
                  </View>
                  <View style={estilos.factorInfo}>
                    <Text style={estilos.factorNombre}>Capacidad del vehículo</Text>
                    <Text style={estilos.factorOrigen}>Base de datos</Text>
                  </View>
                  <Text style={estilos.factorValor}>{preview.pricingFactors.vehicleCapacity} pas.</Text>
                </View>

                {/* 4. Multiplicador de tráfico */}
                <View style={estilos.factorFila}>
                  <View style={[estilos.factorIconContainer, preview.pricingFactors.trafficMultiplier > 1.3 && estilos.factorAlto]}>
                    <Text style={estilos.factorIcon}>🚦</Text>
                  </View>
                  <View style={estilos.factorInfo}>
                    <Text style={estilos.factorNombre}>Multiplicador de tráfico</Text>
                    <Text style={estilos.factorOrigen}>Traffic API (tiempo real)</Text>
                  </View>
                  <Text style={[
                    estilos.factorValor,
                    preview.pricingFactors.trafficMultiplier > 1.3 && estilos.factorValorAlto,
                  ]}>×{preview.pricingFactors.trafficMultiplier.toFixed(2)}</Text>
                </View>

                {/* 5. Factor hora/demanda zonal */}
                <View style={estilos.factorFila}>
                  <View style={[estilos.factorIconContainer, preview.pricingFactors.hourMultiplier > 1.2 && estilos.factorAlto]}>
                    <Text style={estilos.factorIcon}>🕐</Text>
                  </View>
                  <View style={estilos.factorInfo}>
                    <Text style={estilos.factorNombre}>Factor hora/demanda</Text>
                    <Text style={estilos.factorOrigen}>Redis caché (TTL 1h)</Text>
                  </View>
                  <Text style={[
                    estilos.factorValor,
                    preview.pricingFactors.hourMultiplier > 1.2 && estilos.factorValorAlto,
                  ]}>×{preview.pricingFactors.hourMultiplier.toFixed(2)}</Text>
                </View>

                {/* 6. Tiempo estimado de viaje */}
                <View style={estilos.factorFila}>
                  <View style={estilos.factorIconContainer}>
                    <Text style={estilos.factorIcon}>⏱️</Text>
                  </View>
                  <View style={estilos.factorInfo}>
                    <Text style={estilos.factorNombre}>Tiempo estimado de viaje</Text>
                    <Text style={estilos.factorOrigen}>Google Directions API</Text>
                  </View>
                  <Text style={estilos.factorValor}>{formatDuracion(preview.pricingFactors.durationMin)}</Text>
                </View>

                {/* 7. Factor histórico de precios */}
                <View style={[estilos.factorFila, { borderBottomWidth: 0 }]}>
                  <View style={estilos.factorIconContainer}>
                    <Text style={estilos.factorIcon}>📊</Text>
                  </View>
                  <View style={estilos.factorInfo}>
                    <Text style={estilos.factorNombre}>Factor histórico</Text>
                    <Text style={estilos.factorOrigen}>MongoDB (franja horaria)</Text>
                  </View>
                  <Text style={estilos.factorValor}>
                    {preview.pricingFactors.historicAveragePrice > 0
                      ? formatSoles(preview.pricingFactors.historicAveragePrice)
                      : 'N/A'}
                  </Text>
                </View>
              </View>
            )}

            {/* ⭐ VISUALIZACIÓN ASIMÉTRICA: Pasajero solo ve el techo tarifario */}
            <View style={[estilos.previewFila, estilos.tarifaDestacada]}>
              <Text style={estilos.tarifaLabel}>Tu precio máximo garantizado</Text>
              <Text style={estilos.tarifaValor}>{formatSoles(preview.tarifaMax)}</Text>
            </View>

            <CampoEntrada
              etiqueta="Tu oferta inicial (en soles)"
              placeholder={formatSoles(preview.tarifaMax)}
              value={ofertaInicial}
              onChangeText={setOfertaInicial}
              keyboardType="numeric"
            />

            <BotonNeon
              titulo="Buscar conductores"
              onPress={solicitarViaje}
              cargando={solicitando}
            />
          </TarjetaBase>
          </ScrollView>
        )}
      </View>
    </View>
  );
};

const estilos = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: theme.colors.background },
  encabezado: {
    paddingTop: 48,
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing.lg,
    backgroundColor: theme.colors.background,
  },
  botonVolver: { marginBottom: theme.spacing.sm },
  textoVolver: { ...theme.typography.bodyMd, color: theme.colors.primary },
  titulo: { ...theme.typography.h2, color: theme.colors.textPrimary },
  cuerpo: { flex: 1, paddingHorizontal: theme.spacing.xl, gap: theme.spacing.lg },
  sugerencia: { paddingVertical: theme.spacing.md },
  sugerenciaPrincipal: { ...theme.typography.bodyLg, color: theme.colors.textPrimary },
  sugerenciaDescripcion: { ...theme.typography.caption, color: theme.colors.textSecondary, marginTop: 2 },
  separador: { height: 1, backgroundColor: theme.colors.borderSubtle },
  preview: { gap: theme.spacing.md },
  previewTitulo: { ...theme.typography.bodyLg, color: theme.colors.textPrimary, fontFamily: 'Inter-Bold' },
  previewFila: { flexDirection: 'row', justifyContent: 'space-between' },
  previewLabel: { ...theme.typography.bodyMd, color: theme.colors.textSecondary },
  previewValor: { ...theme.typography.bodyMd, color: theme.colors.textPrimary },
  tarifaDestacada: {
    backgroundColor: theme.colors.surfaceTertiary,
    borderRadius: theme.rounded.md,
    padding: theme.spacing.md,
    marginVertical: theme.spacing.sm,
  },
  tarifaLabel: { ...theme.typography.bodyMd, color: theme.colors.textSecondary },
  tarifaValor: { ...theme.typography.h2, color: theme.colors.primary },
  // Desglose del motor tarifario
  desgloseContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.rounded.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(198, 247, 10, 0.15)',
    gap: theme.spacing.sm,
  },
  desgloseTituloFila: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  desgloseTitulo: {
    ...theme.typography.bodyLg,
    color: theme.colors.primary,
    fontFamily: 'Inter-Bold',
  },
  badgeMotor: {
    backgroundColor: 'rgba(198, 247, 10, 0.12)',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.rounded.full,
  },
  badgeMotorTexto: {
    ...theme.typography.caption,
    color: theme.colors.primary,
    fontSize: 11,
    fontFamily: 'Inter-Bold',
  },
  desgloseSubtitulo: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
    marginBottom: theme.spacing.xs,
  },
  factorFila: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderSubtle,
    gap: theme.spacing.md,
  },
  factorIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: theme.colors.surfaceSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  factorAlto: {
    backgroundColor: 'rgba(255, 107, 107, 0.15)',
  },
  factorIcon: {
    fontSize: 18,
  },
  factorInfo: {
    flex: 1,
  },
  factorNombre: {
    ...theme.typography.bodyMd,
    color: theme.colors.textPrimary,
    fontSize: 14,
  },
  factorOrigen: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
    fontSize: 11,
  },
  factorValor: {
    ...theme.typography.bodyMd,
    color: theme.colors.textPrimary,
    fontFamily: 'Inter-Bold',
    fontSize: 14,
    textAlign: 'right',
  },
  factorValorAlto: {
    color: theme.colors.error,
  },
});
