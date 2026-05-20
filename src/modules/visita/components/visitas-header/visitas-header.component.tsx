import React from 'react';
import { View } from 'react-native';
import { visitasStyles } from '../../screen/visitas/visitas.style';
import { FilterType } from '../filter-badges/filter-badges.component';
import { FilterBadges } from '../filter-badges/filter-badges.component';
import { SimpleSearchWithScanner } from '../../../../shared/components/simple-search-with-scanner';
import { ScanResult } from '../../../../shared/components/scanner';

interface VisitasHeaderProps {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  pendingCount: number;
  errorCount: number;
  erroresCount: number;
  novedadesCount: number;
  searchValue: string;
  onSearchChange: (value: string) => void;
  onScanResult: (result: ScanResult) => void;
  onClearFilters: () => void;
}

/**
 * Controles de la lista de visitas: busqueda + chips de filtro. El titulo
 * "Entregas", el resumen y las acciones (cambiar orden, opciones) viven
 * arriba en el AppBar; este componente se renderiza solo cuando hay una
 * orden cargada.
 */
export const VisitasHeader: React.FC<VisitasHeaderProps> = ({
  activeFilter,
  onFilterChange,
  pendingCount,
  errorCount,
  erroresCount,
  novedadesCount,
  searchValue,
  onSearchChange,
  onScanResult,
  onClearFilters,
}) => {
  return (
    <View style={visitasStyles.header}>
      <SimpleSearchWithScanner
        searchValue={searchValue}
        onSearchChange={onSearchChange}
        placeholder="Buscar # o documento"
        onClear={onClearFilters}
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
    </View>
  );
};
