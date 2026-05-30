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
  tarifaMin: number;
  tarifaMax: number;
}

export const SearchTripScreen: React.FC<Props> = ({ navigation }) => {
  const [destino, setDestino] = useState('');
  const [sugerencias, setSugerencias] = useState<PlaceSuggestion[]>([]);
  const [lugarSeleccionado, setLugarSeleccionado] = useState<PlaceSuggestion | null>(null);
  const [preview, setPreview] = useState<TripPreview | null>(null);
  const [buscando, setBuscando] = useState(false);
  const [solicitando, setSolicitando] = useState(false);
  const [ofertaInicial, setOfertaInicial] = useState('');

  const { setViajeActivo, setRutaCoords } = useTripStore();

  const buscarLugares = async (texto: string) => {
    setDestino(texto);
    if (texto.length < 3) {
      setSugerencias([]);
      return;
    }
    setBuscando(true);
    try {
      const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(texto)}&location=${LIMA_CENTRO.latitude},${LIMA_CENTRO.longitude}&radius=${LIMA_RADIO_BUSQUEDA}&components=country:pe&key=${GOOGLE_MAPS_API_KEY}`;
      const { data } = await api.get(url.replace(api.defaults.baseURL || '', ''));
      // Llamada directa a Google (sin pasar por el baseURL del backend)
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
      const destinoCoords = detailsJson.result.geometry.location;

      // Obtener ruta desde el API Gateway (ms-pricing calculará la tarifa)
      const { data: tripData } = await api.post('/trips/quote', {
        destino: { lat: destinoCoords.lat, lng: destinoCoords.lng },
        destinoDireccion: lugar.descripcion,
      });

      setPreview({
        distanciaKm: tripData.distanciaKm,
        duracionMin: tripData.duracionMin,
        tarifaMin: tripData.tarifa.minimo,
        tarifaMax: tripData.tarifa.maximo,
      });

      if (tripData.polyline) {
        setRutaCoords(decodePolyline(tripData.polyline));
      }

      setOfertaInicial(String(tripData.tarifa.maximo));
    } catch (e) {
      console.error('Error calculando ruta:', e);
    }
  };

  const solicitarViaje = async () => {
    if (!lugarSeleccionado || !preview) return;
    setSolicitando(true);
    try {
      const { data } = await api.post('/trips', {
        destinoDireccion: lugarSeleccionado.descripcion,
        ofertaInicial: parseFloat(ofertaInicial),
      });
      setViajeActivo(data);
      navigation.navigate('Negotiation', { tripId: data.id });
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
