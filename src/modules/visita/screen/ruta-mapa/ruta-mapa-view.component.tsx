import React, { useCallback, useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import Ionicons from '@react-native-vector-icons/ionicons';

import { useAppSelector } from '../../../../store/hooks';
import { selectVisitas } from '../../store/selector/visita.selector';
import { useMaps } from '../../../../shared/hooks/use-maps.hook';
import { backgroundGeolocationService } from '../../../../shared/services';
import { VisitaResponse } from '../../interfaces/visita.interface';
import {
  GOOGLE_MAPS_API_KEY,
  GOOGLE_MAPS_REFERER,
} from '../../../../config/environment';
import { buildMapaHtml, ParadaMapa, ConductorMapa } from './ruta-mapa-html.util';

/**
 * Color + etiqueta + si forma parte de la ruta pendiente, por estado de la
 * visita. La ruta (polyline) conecta SOLO las pendientes. Paleta alineada con
 * los chips de filtro.
 */
const estadoVisual = (
  v: VisitaResponse,
): { color: string; label: string; ruta: boolean } => {
  if (v.estado_entregado) {
    return { color: '#1F7A38', label: 'Entregada', ruta: false };
  }
  if (v.estado_novedad) {
    return { color: '#FB923C', label: 'Novedad', ruta: false };
  }
  if (v.estado === 'error' && v.es_error_retryable === false) {
    return { color: '#DC2626', label: 'Error', ruta: false };
  }
  if (v.estado === 'error') {
    return { color: '#F59E0B', label: 'Sin enviar', ruta: false };
  }
  return { color: '#1B9BD7', label: 'Pendiente', ruta: true };
};

const tieneCoords = (v: VisitaResponse): boolean =>
  !!v.latitud && !!v.longitud && v.latitud !== 0 && v.longitud !== 0;

/**
 * Contenido del mapa de ruta (sin AppBar): muestra TODAS las paradas de la
 * orden abierta numeradas por `orden` y coloreadas por estado, con Google Maps
 * dentro de un WebView. Se usa embebido en el detalle (vista "Mapa") y en la
 * pantalla RutaMapa.
 */
export const RutaMapaView = () => {
  const visitas = useAppSelector(selectVisitas);
  const { openLocationInMaps } = useMaps();

  const paradas: ParadaMapa[] = useMemo(
    () =>
      visitas.filter(tieneCoords).map(v => {
        const e = estadoVisual(v);
        return {
          id: v.id,
          lat: v.latitud,
          lng: v.longitud,
          orden: v.orden,
          numero: v.numero,
          destinatario: v.destinatario,
          direccion: v.destinatario_direccion,
          color: e.color,
          estadoLabel: e.label,
          cobro: v.cobro,
          peso: v.peso,
          unidades: v.unidades,
          ruta: e.ruta,
        };
      }),
    [visitas],
  );

  const conductor: ConductorMapa | null = useMemo(() => {
    const last: any = backgroundGeolocationService.getState()?.lastLocation;
    const lat = last?.coords?.latitude;
    const lng = last?.coords?.longitude;
    return typeof lat === 'number' && typeof lng === 'number'
      ? { lat, lng }
      : null;
  }, []);

  const html = useMemo(
    () => buildMapaHtml({ apiKey: GOOGLE_MAPS_API_KEY, paradas, conductor }),
    [paradas, conductor],
  );

  const onMessage = useCallback(
    (event: WebViewMessageEvent) => {
      try {
        const msg = JSON.parse(event.nativeEvent.data);
        if (msg.type === 'navegar') {
          const v = visitas.find(x => x.id === msg.id);
          if (v && tieneCoords(v)) {
            openLocationInMaps({
              latitude: v.latitud,
              longitude: v.longitud,
              address: v.destinatario_direccion,
            });
          }
        }
      } catch {
        // mensaje no parseable — ignorar
      }
    },
    [visitas, openLocationInMaps],
  );

  if (paradas.length === 0) {
    return (
      <View style={styles.empty}>
        <Ionicons name="map-outline" size={44} color="#8e8e93" />
        <Text style={styles.emptyTitle}>Sin ubicaciones para mostrar</Text>
        <Text style={styles.emptySub}>
          Las entregas de esta orden no tienen coordenadas válidas.
        </Text>
      </View>
    );
  }

  return (
    <WebView
      originWhitelist={['*']}
      source={{ html, baseUrl: GOOGLE_MAPS_REFERER }}
      javaScriptEnabled
      domStorageEnabled
      onMessage={onMessage}
      style={styles.web}
    />
  );
};

const styles = StyleSheet.create({
  web: { flex: 1 },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    gap: 6,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1c1c1e',
    marginTop: 6,
  },
  emptySub: {
    fontSize: 13.5,
    color: '#8e8e93',
    textAlign: 'center',
  },
});
