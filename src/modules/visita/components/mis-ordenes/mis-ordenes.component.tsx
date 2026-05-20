import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { BottomSheetFlatList } from '@gorhom/bottom-sheet';
import { useFocusEffect } from '@react-navigation/native';
import Ionicons from '@react-native-vector-icons/ionicons';
import Toast from 'react-native-toast-message';

import { authColors } from '../../../auth/styles/auth.theme';
import { verticalRepository } from '../../../vertical/repositories/vertical.repository';
import { Entrega } from '../../../vertical/interfaces/entrega.interface';
import { useAppSelector } from '../../../../store/hooks';
import { toastTextOneStyle } from '../../../../shared/styles/global.style';

interface MisOrdenesComponentProps {
  /** Abre el bottom sheet "Cargar por codigo" (fallback). */
  onCargarPorCodigo: () => void;
  /** Callback al tocar una orden — el parent navega al detalle. */
  onSeleccionOrden: (entrega: Entrega) => void;
  /**
   * `true` cuando el componente se renderiza adentro de un CustomBottomSheet.
   * Usa BottomSheetFlatList para que el gesto del sheet no se coma los taps
   * de las cards. Default false (uso inline en la pantalla).
   */
  enBottomSheet?: boolean;
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
  onSeleccionOrden,
  enBottomSheet = false,
}) => {
  /** Mapa de snapshots locales — permite mostrar "Pausada · X/Y" en cada card.
   *  ?? {} defiende rehidrataciones desde versiones sin snapshotsByDespacho. */
  const snapshots = useAppSelector(
    state => state.visita.snapshotsByDespacho ?? {},
  );
  const [ordenes, setOrdenes] = useState<Entrega[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const obtenerOrdenes = useCallback(async () => {
    try {
      const data = await verticalRepository.getMisDespachos();
      setOrdenes(data);
      // No descartamos snapshots aca: hacerlo cuando el server no las
      // lista borra las ordenes que el conductor cargo por codigo (caso
      // legitimo: admin/coordinador, o re-asignacion mid-ruta). La
      // limpieza la hacemos explicita cuando el conductor desvincule.
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: error?.titulo || 'No pudimos cargar tus órdenes',
        text2: error?.mensaje || 'Inténtalo nuevamente.',
        text1Style: toastTextOneStyle,
      });
    }
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await obtenerOrdenes();
      setLoading(false);
    })();
  }, [obtenerOrdenes]);

  // Refresca al volver al tab (ej. tras hacer back desde el detalle de una
  // orden). Sin esto, la lista mostraria los datos del primer fetch para
  // siempre — el chip "Pausada" recien aparece despues de este refresh.
  useFocusEffect(
    useCallback(() => {
      obtenerOrdenes();
    }, [obtenerOrdenes]),
  );

  // Combina las asignadas del server con las que tenemos localmente
  // snapshotadas pero el server no esta listando (caso comun: orden cargada
  // por codigo por un admin/coordinador que no tiene asignacion server-side).
  const ordenesCombinadas = useMemo(() => {
    const idsServer = new Set(ordenes.map(o => o.id));
    const locales: Entrega[] = Object.values(snapshots)
      .map(s => s.entrega)
      .filter((e): e is Entrega => !!e && !idsServer.has(e.id));
    return [...ordenes, ...locales];
  }, [ordenes, snapshots]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await obtenerOrdenes();
    setRefreshing(false);
  }, [obtenerOrdenes]);

  const renderItem = ({ item }: { item: Entrega }) => {
    const peso = Math.round(item.peso || 0);

    // Si hay snapshot local del despacho, mostramos el progreso DEL CONDUCTOR
    // (no el del server) — refleja lo que realmente lleva entregado en su
    // sesion local.
    const snapshot = snapshots[item.id];
    const localEntregadas = snapshot
      ? snapshot.visitas.filter(v => v.estado_entregado).length
      : 0;
    const localTotal = snapshot ? snapshot.visitas.length : 0;
    const tienePausa = !!snapshot && localTotal > 0;

    // Si no hay snapshot pero el server reporta progreso parcial (otra sesion,
    // otro dispositivo, etc.) mantenemos el indicador anterior.
    const serverEntregadas = Math.round(item.visitas_entregadas || 0);
    const tieneProgresoServer =
      !tienePausa && serverEntregadas > 0 && serverEntregadas < item.visitas;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => onSeleccionOrden(item)}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel={`Orden ${item.id}, ${item.visitas} visitas`}
      >
        <View style={styles.cardIcon}>
          <Ionicons name="cube-outline" size={22} color={authColors.brandInk} />
        </View>
        <View style={styles.cardBody}>
          <Text style={styles.cardHeadline}>
            {item.visitas} visita{item.visitas === 1 ? '' : 's'}
            {peso > 0 ? ` · ${peso.toLocaleString('es')} kg` : ''}
          </Text>
          <Text style={styles.cardMeta}>
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
        <Ionicons
          name="chevron-forward"
          size={20}
          color={authColors.inkMuted}
        />
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

  if (ordenesCombinadas.length === 0) {
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

  // Adentro de un CustomBottomSheet hay que usar BottomSheetFlatList:
  // sino el gesto del sheet (PanGestureHandler) intercepta los taps de las
  // cards y la lista no responde — el conductor termina creyendo que la
  // accion no funciona y forzando un Desvincular para "salir" del sheet.
  const Lista: any = enBottomSheet ? BottomSheetFlatList : FlatList;
  return (
    <Lista
      data={ordenesCombinadas}
      renderItem={renderItem}
      keyExtractor={(item: Entrega) => `${item.id}`}
      contentContainerStyle={styles.list}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={authColors.brandInk}
          colors={[authColors.brandInk]}
        />
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
