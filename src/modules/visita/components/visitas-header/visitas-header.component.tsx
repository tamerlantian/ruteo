import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { visitasStyles } from '../../screen/visitas/visitas.style';
import { FilterType } from '../filter-badges/filter-badges.component';
import { FilterBadges } from '../filter-badges/filter-badges.component';
import { SimpleSearch } from '../../../../shared/components/simple-search/simple-search.component';

interface VisitasHeaderProps {
  hasVisitas: boolean;
  onOpenDevModeSheet: () => void;
  onOpenOptionsSheet: () => void;
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  pendingCount: number;
  errorCount: number;
  deliveredCount: number;
  totalCount: number;
  // Search props
  searchValue: string;
  onSearchChange: (value: string) => void;
  onClearFilters: () => void;
}

export const VisitasHeader: React.FC<VisitasHeaderProps> = ({
  hasVisitas,
  onOpenDevModeSheet,
  onOpenOptionsSheet,
  activeFilter,
  onFilterChange,
  pendingCount,
  errorCount,
  deliveredCount,
  totalCount,
  searchValue,
  onSearchChange,
  onClearFilters,
}) => {
  // Función para manejar el clear
  const handleClear = () => {
    onClearFilters();
  };
  return (
    <View style={visitasStyles.header}>
      <View style={visitasStyles.titleRow}>
        <Text style={visitasStyles.title}>Entregas</Text>
        <View style={visitasStyles.headerActions}>
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
          {hasVisitas && (
            <TouchableOpacity 
              style={visitasStyles.optionsButton}
              onPress={onOpenOptionsSheet}
            >
              <Ionicons 
                name="ellipsis-horizontal" 
                size={20} 
                color="#8e8e93" 
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Search and Filter - Only show when there are visitas */}
      {hasVisitas && (
        <>
          <SimpleSearch
            searchValue={searchValue}
            onSearchChange={onSearchChange}
            placeholder="Buscar por número o documento..."
            onClear={handleClear}
          />
          <FilterBadges
            activeFilter={activeFilter}
            onFilterChange={onFilterChange}
            pendingCount={pendingCount}
            errorCount={errorCount}
          />
        </>
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
