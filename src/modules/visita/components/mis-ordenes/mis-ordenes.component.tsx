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
import { toastTextOneStyle } from '../../../../shared/styles/global.style';

interface MisOrdenesComponentProps {
  /** Abre el bottom sheet "Cargar por código" (fallback cuando no hay asignación). */
  onCargarPorCodigo: () => void;
  /** Id de la orden actualmente cargada (null si ninguna). Activa el flujo de "cambiar de orden". */
  ordenActualId?: number | null;
  /** Callback invocado cuando una orden se cargo/cambio con exito (para cerrar el sheet). */
  onSeleccionExitosa?: () => void;
}

const formatearFecha = (iso: string) => {
  if (!iso) {
    return '';
  }
  try {
    return new Date(iso).toLocaleDateString('es', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
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
  const cambiarOrden = useCambiarOrden();
  const [ordenes, setOrdenes] = useState<Entrega[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [cargandoId, setCargandoId] = useState<number | null>(null);

  const obtenerOrdenes = useCallback(async () => {
    try {
      const data = await verticalRepository.getMisDespachos();
      setOrdenes(data);
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
    return (
      <TouchableOpacity
        style={[styles.card, esActual && styles.cardActual]}
        onPress={() => onSelectOrden(item)}
        disabled={cargandoId !== null}
        activeOpacity={0.85}
      >
        <View style={styles.cardIcon}>
          <Ionicons name="cube-outline" size={22} color={authColors.brandInk} />
        </View>
        <View style={styles.cardBody}>
          <View style={styles.cardTitleRow}>
            <Text style={styles.cardCode}>Orden #{item.id}</Text>
            {esActual && (
              <View style={styles.actualChip}>
                <Text style={styles.actualChipText}>Actual</Text>
              </View>
            )}
          </View>
          <Text style={styles.cardMeta}>
            {formatearFecha(item.fecha)}
            {item.fecha ? ' · ' : ''}
            {item.visitas} visita{item.visitas === 1 ? '' : 's'}
          </Text>
        </View>
        {isLoading ? (
          <ActivityIndicator size="small" color={authColors.brandInk} />
        ) : (
          <Ionicons name="chevron-forward" size={20} color={authColors.inkMuted} />
        )}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={authColors.brandInk} />
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
          Cuando te asignen una orden aparecerá aquí. Si conoces el código, puedes
          cargarla manualmente.
        </Text>
        <TouchableOpacity
          style={styles.cta}
          onPress={onCargarPorCodigo}
          activeOpacity={0.85}
        >
          <Ionicons name="keypad-outline" size={18} color="#FFFFFF" />
          <Text style={styles.ctaText}>Cargar por código</Text>
        </TouchableOpacity>
        <Text style={styles.hint}>Desliza hacia abajo para volver a comprobar.</Text>
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
        >
          <Ionicons name="keypad-outline" size={16} color={authColors.brandInk} />
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
    paddingTop: 8,
    paddingBottom: 24,
  },
  card: {
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
  cardActual: {
    borderColor: authColors.brandInk,
    borderWidth: 1.5,
    backgroundColor: 'rgba(27, 155, 215, 0.04)',
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actualChip: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: authColors.brandInk,
  },
  actualChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  cardIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(27, 155, 215, 0.10)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardBody: {
    flex: 1,
  },
  cardCode: {
    fontSize: 15,
    fontWeight: '700',
    color: authColors.ink,
  },
  cardMeta: {
    fontSize: 13,
    color: authColors.inkSoft,
    marginTop: 2,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  empty: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 40,
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
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 50,
    paddingHorizontal: 24,
    borderRadius: 14,
    backgroundColor: authColors.brandInk,
    justifyContent: 'center',
  },
  ctaText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  hint: {
    fontSize: 12,
    color: authColors.inkMuted,
    textAlign: 'center',
    marginTop: 18,
  },
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
