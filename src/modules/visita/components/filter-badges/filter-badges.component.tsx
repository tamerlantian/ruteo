import React, { useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';

export type FilterType =
  | 'pending'
  | 'error'
  | 'errores'
  | 'novedades'
  | 'entregadas';

interface FilterBadgesProps {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  pendingCount: number;
  errorCount: number;
  erroresCount: number;
  novedadesCount: number;
  entregadasCount: number;
}

interface FilterMeta {
  key: FilterType;
  label: string;
  icon: string;
  color: string; // color semantico del filtro
  countTint: string; // bg del count pill en estado inactivo
}

/**
 * Cada filtro tiene su "personalidad" cromatica — el conductor barre la fila
 * y reconoce de un vistazo: azul = lo que esta por entregar, ambar = lo que
 * espera reintento, rojo = lo que pidio intervencion, verde = lo cerrado.
 */
const FILTERS: FilterMeta[] = [
  {
    key: 'pending',
    label: 'Pendientes',
    icon: 'time-outline',
    color: '#1B9BD7',
    countTint: 'rgba(27, 155, 215, 0.12)',
  },
  {
    key: 'error',
    label: 'Sincronizar',
    icon: 'sync-outline',
    color: '#F59E0B',
    countTint: 'rgba(245, 158, 11, 0.14)',
  },
  {
    key: 'errores',
    label: 'Errores',
    icon: 'alert-circle-outline',
    color: '#DC2626',
    countTint: 'rgba(220, 38, 38, 0.12)',
  },
  {
    key: 'entregadas',
    label: 'Entregadas',
    icon: 'checkmark-circle-outline',
    color: '#1F7A38',
    countTint: 'rgba(31, 122, 56, 0.12)',
  },
  // Nota: "Novedades" NO es un chip aquí — es una vista del bottom nav de la
  // orden (OrderBottomNav). Los chips quedan solo como sub-filtros de estado.
];

const formatCount = (count: number) => (count > 99 ? '99+' : String(count));

export const FilterBadges: React.FC<FilterBadgesProps> = ({
  activeFilter,
  onFilterChange,
  pendingCount,
  errorCount,
  erroresCount,
  entregadasCount,
  novedadesCount,
}) => {
  // Mapeamos el count vivo por filtro. Definirlo afuera del render evita
  // recalcular en cada re-render.
  const countsByFilter = useMemo<Record<FilterType, number>>(
    () => ({
      pending: pendingCount,
      error: errorCount,
      errores: erroresCount,
      entregadas: entregadasCount,
      novedades: novedadesCount,
    }),
    [pendingCount, errorCount, erroresCount, entregadasCount, novedadesCount],
  );

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContainer}
      style={styles.container}
    >
      {FILTERS.map((filter) => {
        const count = countsByFilter[filter.key];
        const isActive = activeFilter === filter.key;
        const isEmpty = count === 0;

        return (
          <TouchableOpacity
            key={filter.key}
            style={[
              styles.chip,
              isActive && {
                backgroundColor: filter.color,
                borderColor: filter.color,
              },
              !isActive && isEmpty && styles.chipEmpty,
            ]}
            onPress={() => onFilterChange(filter.key)}
            activeOpacity={0.75}
            accessibilityRole="button"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={`${filter.label}, ${count} ${
              count === 1 ? 'visita' : 'visitas'
            }`}
          >
            <Ionicons
              name={filter.icon as any}
              size={15}
              color={
                isActive
                  ? '#FFFFFF'
                  : isEmpty
                    ? '#94A3B8'
                    : filter.color
              }
            />
            <Text
              style={[
                styles.chipLabel,
                isActive && styles.chipLabelActive,
                !isActive && isEmpty && styles.chipLabelEmpty,
              ]}
            >
              {filter.label}
            </Text>
            {count > 0 && (
              <View
                style={[
                  styles.countPill,
                  isActive
                    ? styles.countPillActive
                    : { backgroundColor: filter.countTint },
                ]}
              >
                <Text
                  style={[
                    styles.countText,
                    isActive
                      ? styles.countTextActive
                      : { color: filter.color },
                  ]}
                >
                  {formatCount(count)}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 12,
  },
  scrollContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingRight: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 6,
  },
  chipEmpty: {
    backgroundColor: '#F8FAFC',
    borderColor: '#EEF2F6',
  },
  chipLabel: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#334155',
    letterSpacing: -0.1,
  },
  chipLabelActive: {
    color: '#FFFFFF',
  },
  chipLabelEmpty: {
    color: '#94A3B8',
    fontWeight: '500',
  },
  countPill: {
    minWidth: 22,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 7,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 2,
  },
  countPillActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
  },
  countText: {
    fontSize: 11.5,
    fontWeight: '800',
    letterSpacing: 0.1,
  },
  countTextActive: {
    color: '#FFFFFF',
  },
});
