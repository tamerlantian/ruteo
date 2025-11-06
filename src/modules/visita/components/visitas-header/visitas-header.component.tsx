import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { visitasStyles } from '../../screen/visitas/visitas.style';
import { FilterBadges, FilterType } from '../filter-badges/filter-badges.component';

interface VisitasHeaderProps {
  hasVisitas: boolean;
  onOpenDevModeSheet: () => void;
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  pendingCount: number;
  errorCount: number;
  deliveredCount: number;
  totalCount: number;
}

export const VisitasHeader: React.FC<VisitasHeaderProps> = ({
  hasVisitas,
  onOpenDevModeSheet,
  activeFilter,
  onFilterChange,
  pendingCount,
  errorCount,
  deliveredCount,
  totalCount,
}) => {
  return (
    <View style={visitasStyles.header}>
      <View style={visitasStyles.titleRow}>
        <Text style={visitasStyles.title}>Visitas</Text>
        {hasVisitas && totalCount > 0 && (
          <View style={visitasStyles.summaryContainer}>
            <Ionicons 
              name="checkmark-circle" 
              size={16} 
              color="#34c759" 
              style={visitasStyles.summaryIcon}
            />
            <Text style={visitasStyles.summaryText}>
              {deliveredCount} de {totalCount}
            </Text>
          </View>
        )}
      </View>

      {/* Filter Badges - Only show when there are visitas */}
      {hasVisitas && (
        <FilterBadges
          activeFilter={activeFilter}
          onFilterChange={onFilterChange}
          pendingCount={pendingCount}
          errorCount={errorCount}
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
