import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { visitasStyles } from '../../screen/visitas/visitas.style';
import { FilterType } from '../filter-badges/filter-badges.component';
import { FilterBadges } from '../filter-badges/filter-badges.component';
import { SimpleSearchWithScanner } from '../../../../shared/components/simple-search-with-scanner';
import { ScanResult } from '../../../../shared/components/scanner';

interface VisitasHeaderProps {
  hasVisitas: boolean;
  hasOrdenCargada: boolean;
  onOpenDevModeSheet: () => void;
  onOpenOptionsSheet: () => void;
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  pendingCount: number;
  errorCount: number;
  erroresCount: number;
  novedadesCount: number;
  deliveredCount: number;
  totalCount: number;
  // Search props
  searchValue: string;
  onSearchChange: (value: string) => void;
  onScanResult: (result: ScanResult) => void;
  onClearFilters: () => void;
}

export const VisitasHeader: React.FC<VisitasHeaderProps> = ({
  hasOrdenCargada,
  onOpenDevModeSheet,
  onOpenOptionsSheet,
  activeFilter,
  onFilterChange,
  pendingCount,
  errorCount,
  erroresCount,
  novedadesCount,
  deliveredCount,
  totalCount,
  searchValue,
  onSearchChange,
  onScanResult,
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
          {hasOrdenCargada && (
            <View style={visitasStyles.summaryRow}>
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
            <View style={visitasStyles.summaryContainer}>
              <Ionicons 
                name="alert-circle" 
                size={16} 
                color="#ffbd30ff" 
                style={visitasStyles.summaryIcon}
              />
              <Text style={visitasStyles.summaryText}>
               {novedadesCount}
              </Text>
            </View>
            </View>
          )}
          {hasOrdenCargada && (
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
      {hasOrdenCargada && (
        <>
          <SimpleSearchWithScanner
            searchValue={searchValue}
            onSearchChange={onSearchChange}
            placeholder="Buscar # o documento"
            onClear={handleClear}
            onScanResult={onScanResult}
          />
          <FilterBadges
            activeFilter={activeFilter}
            onFilterChange={onFilterChange}
            pendingCount={pendingCount}
            errorCount={errorCount}
            erroresCount={erroresCount}
            novedadesCount={novedadesCount}
          />
        </>
      )}
            
      {!hasOrdenCargada && (
        <View style={visitasStyles.emptyState}>
          <Text style={visitasStyles.emptyTitle}>No tienes una orden cargada</Text>
          <Text style={visitasStyles.emptySubtitle}>
            Carga una orden de entrega para comenzar
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
