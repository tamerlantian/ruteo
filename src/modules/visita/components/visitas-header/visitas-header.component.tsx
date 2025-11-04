import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { visitasStyles } from '../../screen/visitas/visitas.style';
import { FilterBadges, FilterType } from '../filter-badges/filter-badges.component';

interface VisitasHeaderProps {
  totalSeleccionadas: number;
  selectionCounterText: string;
  hasVisitas: boolean;
  onOpenDevModeSheet: () => void;
  // Filter props
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  pendingCount: number;
  deliveredCount: number;
  totalCount: number;
}

export const VisitasHeader: React.FC<VisitasHeaderProps> = ({
  totalSeleccionadas,
  selectionCounterText,
  hasVisitas,
  onOpenDevModeSheet,
  activeFilter,
  onFilterChange,
  pendingCount,
  deliveredCount,
  totalCount,
}) => {
  return (
    <View style={visitasStyles.header}>
      <View style={visitasStyles.titleRow}>
        <Text style={visitasStyles.title}>Visitas</Text>
        {totalSeleccionadas > 0 && (
          <Text style={visitasStyles.selectionCounter}>
            {selectionCounterText}
          </Text>
        )}
      </View>

      {/* Filter Badges - Only show when there are visitas */}
      {hasVisitas && (
        <FilterBadges
          activeFilter={activeFilter}
          onFilterChange={onFilterChange}
          pendingCount={pendingCount}
          deliveredCount={deliveredCount}
          totalCount={totalCount}
        />
      )}
            
      {!hasVisitas && (
        <View style={visitasStyles.emptyState}>
          <Text style={visitasStyles.emptyTitle}>No tienes visitas cargadas</Text>
          <Text style={visitasStyles.emptySubtitle}>
            Las visitas aparecerán aquí cuando estén disponibles
          </Text>
          <TouchableOpacity 
            style={visitasStyles.emptyButtonContainer} 
            onPress={onOpenDevModeSheet}
          >
            <Text style={visitasStyles.emptyButton}>Cargar orden</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};
