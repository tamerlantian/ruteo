import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import Toast from 'react-native-toast-message';

import { authColors } from '../../../auth/styles/auth.theme';
import { verticalRepository } from '../../../vertical/repositories/vertical.repository';
import { Entrega } from '../../../vertical/interfaces/entrega.interface';
import { useCambiarOrden } from '../../hooks/use-cambiar-orden.hook';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import { descartarSnapshotsVisitasExcepto } from '../../store/slice/visita.slice';
import { descartarSnapshotsNovedadesExcepto } from '../../../novedad/store/slice/novedad.slice';
import { toastTextOneStyle } from '../../../../shared/styles/global.style';

interface MisOrdenesComponentProps {
  onCargarPorCodigo: () => void;
  ordenActualId?: number | null;
  onSeleccionExitosa?: () => void;
}

const formatearFecha = (iso: string) => {
  if (!iso) {
    return '';
  }
  try {
    return new Date(iso).toLocaleDateString('es', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  } catch {
    return '';
  }
};

export const MisOrdenesComponent: React.FC<MisOrdenesComponentProps> = ({
  onCargarPorCodigo,
  ordenActualId = null,
  onSeleccionExitosa,
}) => {
  const dispatch = useAppDispatch();
  const cambiarOrden = useCambiarOrden();
  /** Mapa de snapshots locales — permite mostrar "Pausada · X/Y" en cada card. */
  const snapshots = useAppSelector(
    state => state.visita.snapshotsByDespacho,
  );
  const [ordenes, setOrdenes] = useState<Entrega[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [cargandoId, setCargandoId] = useState<number | null>(null);

  const obtenerOrdenes = useCallback(async () => {
    try {
      const data = await verticalRepository.getMisDespachos();
      setOrdenes(data);
      // Limpia snapshots de ordenes que el server ya no asigna.
      // Mantenemos la activa por seguridad (re-asignaciones mid-route).
      const idsAMantener: number[] = data.map(e => e.id);
      if (ordenActualId !== null && !idsAMantener.includes(ordenActualId)) {
        idsAMantener.push(ordenActualId);
      }
      dispatch(descartarSnapshotsVisitasExcepto(idsAMantener));
      dispatch(descartarSnapshotsNovedadesExcepto(idsAMantener));
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: error?.titulo || 'No pudimos cargar tus órdenes',
        text2: error?.mensaje || 'Inténtalo nuevamente.',
        text1Style: toastTextOneStyle,
      });
    }
  }, [dispatch, ordenActualId]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await obtenerOrdenes();
      setLoading(false);
    })();
  }, [obtenerOrdenes]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await obtenerOrdenes();
    setRefreshing(false);
  }, [obtenerOrdenes]);

  const onSelectOrden = useCallback(
    async (entrega: Entrega) => {
      setCargandoId(entrega.id);
      try {
        const exito = await cambiarOrden(entrega, ordenActualId);
        if (exito) {
          onSeleccionExitosa?.();
        }
      } finally {
        setCargandoId(null);
      }
    },
    [cambiarOrden, ordenActualId, onSeleccionExitosa],
  );

  const renderItem = ({ item }: { item: Entrega }) => {
    const isLoading = cargandoId === item.id;
    const esActual = ordenActualId !== null && ordenActualId === item.id;
    const peso = Math.round(item.peso || 0);

    // Si hay snapshot local del despacho, mostramos el progreso DEL CONDUCTOR
    // (no el del server) — refleja lo que realmente lleva entregado en su
    // sesion local. La orden activa no se trata como "pausada".
    const snapshot = !esActual ? snapshots[item.id] : undefined;
    const localEntregadas = snapshot
      ? snapshot.visitas.filter(v => v.estado_entregado).length
      : 0;
    const localTotal = snapshot ? snapshot.visitas.length : 0;
    const tienePausa = !!snapshot && localTotal > 0;

    // Si no hay snapshot pero el server reporta progreso parcial (otra sesion,
    // otro dispositivo, etc.) mantenemos el indicador anterior.
    const serverEntregadas = Math.round(item.visitas_entregadas || 0);
    const tieneProgresoServer =
      !tienePausa &&
      !esActual &&
      serverEntregadas > 0 &&
      serverEntregadas < item.visitas;

    return (
      <TouchableOpacity
        style={[styles.card, esActual && styles.cardActual]}
        onPress={() => onSelectOrden(item)}
        disabled={cargandoId !== null}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel={`Orden ${item.id}, ${item.visitas} visitas`}
      >
        {/* La franja izquierda colorea solo la orden actual: comunica
            "esta es la cargada" sin tener que sumar un chip. */}
        {esActual && <View style={styles.cardActualAccent} />}

        <View style={styles.cardIcon}>
          <Ionicons name="cube-outline" size={22} color={authColors.brandInk} />
        </View>
        <View style={styles.cardBody}>
          {/* Linea principal: la carga de trabajo, que es lo que el
              conductor escanea para decidir. */}
          <Text style={styles.cardHeadline}>
            {item.visitas} visita{item.visitas === 1 ? '' : 's'}
            {peso > 0 ? ` · ${peso.toLocaleString('es')} kg` : ''}
          </Text>
          {/* Linea de contexto: fecha + id como referencia. "Actual" o
              "Pausada" se insertan inline solo cuando aplica. */}
          <Text style={styles.cardMeta}>
            {esActual && (
              <Text style={styles.metaActual}>Actual · </Text>
            )}
            {tienePausa && (
              <Text style={styles.metaPausada}>Pausada · </Text>
            )}
            {formatearFecha(item.fecha)}
            {item.fecha ? ' · ' : ''}
            <Text style={styles.metaId}>#{item.id}</Text>
          </Text>
          {tienePausa && (
            <View style={styles.progresoLinea}>
              <Ionicons
                name="checkmark-circle-outline"
                size={13}
                color={authColors.inkSoft}
              />
              <Text style={styles.progresoTexto}>
                {localEntregadas} de {localTotal} entregadas en tu sesión
              </Text>
            </View>
          )}
          {tieneProgresoServer && (
            <View style={styles.progresoLinea}>
              <Ionicons
                name="checkmark-circle-outline"
                size={13}
                color={authColors.inkSoft}
              />
              <Text style={styles.progresoTexto}>
                {serverEntregadas} de {item.visitas} entregadas
              </Text>
            </View>
          )}
        </View>
        {isLoading ? (
          <ActivityIndicator size="small" color={authColors.brandInk} />
        ) : (
          <Ionicons
            name="chevron-forward"
            size={20}
            color={authColors.inkMuted}
          />
        )}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={[styles.flex, styles.list]}>
        {[1, 2, 3].map(i => (
          <View key={i} style={styles.skeletonCard}>
            <View style={styles.skeletonIcon} />
            <View style={styles.skeletonBody}>
              <View style={[styles.skeletonLine, { width: '55%' }]} />
              <View
                style={[styles.skeletonLine, { width: '40%', marginTop: 8 }]}
              />
            </View>
          </View>
        ))}
      </View>
    );
  }

  if (ordenes.length === 0) {
    return (
      <View style={styles.empty}>
        <View style={styles.emptyIcon}>
          <Ionicons name="cube-outline" size={32} color={authColors.brandInk} />
        </View>
        <Text style={styles.emptyTitle}>No tienes órdenes asignadas</Text>
        <Text style={styles.emptySubtitle}>
          Cuando te asignen una orden aparecerá aquí. Desliza hacia abajo para
          volver a comprobar.
        </Text>
        {/* CTA outlined: el camino del codigo manual es secundario, no la
            accion principal del conductor. */}
        <TouchableOpacity
          style={styles.ctaOutline}
          onPress={onCargarPorCodigo}
          activeOpacity={0.7}
          accessibilityRole="button"
        >
          <Ionicons
            name="keypad-outline"
            size={16}
            color={authColors.brandInk}
          />
          <Text style={styles.ctaOutlineText}>Cargar por código</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <FlatList
      data={ordenes}
      renderItem={renderItem}
      keyExtractor={(item) => `${item.id}`}
      contentContainerStyle={styles.list}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={authColors.brandInk}
          colors={[authColors.brandInk]}
        />
      }
      ListFooterComponent={
        <TouchableOpacity
          style={styles.footerCta}
          onPress={onCargarPorCodigo}
          activeOpacity={0.7}
          accessibilityRole="button"
        >
          <Ionicons
            name="keypad-outline"
            size={16}
            color={authColors.brandInk}
          />
          <Text style={styles.footerCtaText}>Cargar por código</Text>
        </TouchableOpacity>
      }
      style={styles.flex}
    />
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  list: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
  },
  // ----- Card -----
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 14,
    paddingLeft: 14,
    paddingRight: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: authColors.border,
    gap: 12,
    overflow: 'hidden',
  },
  cardActual: {
    borderColor: authColors.brandInk,
    backgroundColor: 'rgba(27, 155, 215, 0.04)',
    paddingLeft: 18, // compensa la franja izquierda
  },
  cardActualAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: authColors.brandInk,
  },
  cardIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(27, 155, 215, 0.10)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardBody: {
    flex: 1,
  },
  cardHeadline: {
    fontSize: 15.5,
    fontWeight: '700',
    color: authColors.ink,
    letterSpacing: -0.1,
  },
  cardMeta: {
    fontSize: 12.5,
    color: authColors.inkSoft,
    marginTop: 3,
  },
  metaActual: {
    color: authColors.brandInk,
    fontWeight: '700',
  },
  metaPausada: {
    color: authColors.inkSoft,
    fontWeight: '700',
  },
  metaId: {
    color: authColors.inkMuted,
  },
  progresoLinea: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  progresoTexto: {
    fontSize: 12,
    color: authColors.inkSoft,
    fontWeight: '500',
  },
  // ----- Skeleton -----
  skeletonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: authColors.border,
    gap: 12,
  },
  skeletonIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#EEF2F5',
  },
  skeletonBody: {
    flex: 1,
  },
  skeletonLine: {
    height: 11,
    borderRadius: 6,
    backgroundColor: '#EEF2F5',
  },
  // ----- Empty -----
  empty: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 24,
    alignItems: 'center',
  },
  emptyIcon: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: 'rgba(27, 155, 215, 0.10)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: authColors.ink,
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  emptySubtitle: {
    fontSize: 14,
    color: authColors.inkSoft,
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 8,
    marginBottom: 22,
  },
  ctaOutline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 44,
    paddingHorizontal: 18,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: authColors.border,
    backgroundColor: 'transparent',
    justifyContent: 'center',
  },
  ctaOutlineText: {
    fontSize: 14,
    fontWeight: '600',
    color: authColors.brandInk,
  },
  // ----- Footer -----
  footerCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
  },
  footerCtaText: {
    fontSize: 13,
    fontWeight: '600',
    color: authColors.brandInk,
  },
});
