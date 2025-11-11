import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { visitasStyles } from '../../../visita/screen/visitas/visitas.style';
import { SimpleSearch } from '../../../../shared/components/simple-search/simple-search.component';

// Crear un componente de filtros específico para novedades
interface NovedadFilterBadgeProps {
  activeFilter: 'all' | 'error';
  onFilterChange: (filter: 'all' | 'error') => void;
  totalCount: number;
  errorCount: number;
}

const NovedadFilterBadges: React.FC<NovedadFilterBadgeProps> = ({
  activeFilter,
  onFilterChange,
  totalCount,
  errorCount,
}) => {
  const filters = [
    { key: 'all' as const, label: 'Todas', count: totalCount },
    { key: 'error' as const, label: 'Error', count: errorCount },
  ];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={filterStyles.scrollContainer}
      style={filterStyles.container}
    >
      {filters.map((filter) => (
        <TouchableOpacity
          key={filter.key}
          style={[
            filterStyles.badge,
            activeFilter === filter.key && filterStyles.activeBadge,
          ]}
          onPress={() => onFilterChange(filter.key)}
          activeOpacity={0.7}
        >
          <Text
            style={[
              filterStyles.badgeText,
              activeFilter === filter.key && filterStyles.activeBadgeText,
            ]}
          >
            {filter.label}
          </Text>
          {filter.count > 0 && (
            <View
              style={[
                filterStyles.countBadge,
                activeFilter === filter.key && filterStyles.activeCountBadge,
              ]}
            >
              <Text
                style={[
                  filterStyles.countText,
                  activeFilter === filter.key && filterStyles.activeCountText,
                ]}
              >
                {filter.count}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

interface NovedadesHeaderProps {
  hasNovedades: boolean;
  activeFilter: 'all' | 'error';
  onFilterChange: (filter: 'all' | 'error') => void;
  errorCount: number;
  totalCount: number;
  searchValue: string;
  onSearchChange: (text: string) => void;
  onClearFilters: () => void;
}

export const NovedadesHeader: React.FC<NovedadesHeaderProps> = ({
  hasNovedades,
  activeFilter,
  onFilterChange,
  errorCount,
  totalCount,
  searchValue,
  onSearchChange,
  onClearFilters,
}) => {
  const handleClear = () => {
    onSearchChange('');
    onClearFilters();
  };

  return (
    <View style={visitasStyles.header}>
      <Text style={visitasStyles.title}>Novedades</Text>

      {hasNovedades && (
        <>
          <SimpleSearch
            searchValue={searchValue}
            onSearchChange={onSearchChange}
            placeholder="Buscar por número o documento..."
            onClear={handleClear}
          />
          <NovedadFilterBadges
            activeFilter={activeFilter}
            onFilterChange={onFilterChange}
            totalCount={totalCount}
            errorCount={errorCount}
          />
        </>
      )}
            
      {!hasNovedades && (
        <View style={visitasStyles.emptyState}>
          <Text style={visitasStyles.emptyTitle}>No tienes novedades</Text>
          <Text style={visitasStyles.emptySubtitle}>
            Las novedades aparecerán aquí cuando sean reportadas
          </Text>
        </View>
      )}
    </View>
  );
};

const filterStyles = StyleSheet.create({
  container: {
    paddingTop: 12,
  },
  scrollContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    gap: 6,
  },
  activeBadge: {
    backgroundColor: '#0066CC',
    borderColor: '#0066CC',
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  activeBadgeText: {
    color: '#FFFFFF',
  },
  countBadge: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  activeCountBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  countText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0066CC',
  },
  activeCountText: {
    color: '#FFFFFF',
  },
});
