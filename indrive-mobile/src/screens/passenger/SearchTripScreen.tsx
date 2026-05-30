import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
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

type Props = {
  navigation: NativeStackNavigationProp<PassengerStackParamList, 'SearchTrip'>;
};

interface PlaceSuggestion {
  placeId: string;
  descripcion: string;
  principal: string;
}

interface TripPreview {
  distanciaKm: number;
  duracionMin: number;
  tarifaMax: number;
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

  const { setViajeActivo, setRutaCoords } = useTripStore();

  // El backend usa nombres de lugar (no coordenadas) para el contexto del viaje.
  const ORIGEN_DIRECCION = 'Ubicación actual';

  const buscarLugares = async (texto: string) => {
    setDestino(texto);
    if (texto.length < 3) {
      setSugerencias([]);
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
      const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${lugar.placeId}&fields=geometry&key=${GOOGLE_MAPS_API_KEY}`;
      const detailsResp = await fetch(detailsUrl);
      const detailsJson = await detailsResp.json();
      const coords = detailsJson.result.geometry.location;
      setDestinoCoords({ latitude: coords.lat, longitude: coords.lng });

      // Cotización pre-viaje: el backend (Integración + Motor) devuelve
      // distancia, duración, polyline y el TECHO (visualización asimétrica).
      const { data: tripData } = await api.post('/trips/quote', {
        origin: ORIGEN_DIRECCION,
        destination: lugar.descripcion,
      });

      setPreview({
        distanciaKm: tripData.distanceKm,
        duracionMin: tripData.durationMin,
        tarifaMax: tripData.maximumPrice,
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
        origin: ORIGEN_DIRECCION,
        destination: lugarSeleccionado.descripcion,
      });
      const origen: Coords = {
        latitude: LIMA_CENTRO.latitude,
        longitude: LIMA_CENTRO.longitude,
      };
      setViajeActivo({
        id: String(data.id),
        status: data.status,
        origen,
        destino: destinoCoords ?? origen,
        origenDireccion: ORIGEN_DIRECCION,
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

        {/* Preview de tarifa — muestra solo el TECHO (máximo) al pasajero */}
        {preview && (
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
});
