import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

export type FilterType = 'pending' | 'error';

interface FilterBadgesProps {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  pendingCount: number;
  errorCount: number;
}

export const FilterBadges: React.FC<FilterBadgesProps> = ({
  activeFilter,
  onFilterChange,
  pendingCount,
  errorCount,
}) => {
  const filters = [
    { key: 'pending' as FilterType, label: 'Pendientes', count: pendingCount },
    { key: 'error' as FilterType, label: 'Con Error', count: errorCount },
  ];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContainer}
      style={styles.container}
    >
      {filters.map((filter) => (
        <TouchableOpacity
          key={filter.key}
          style={[
            styles.badge,
            activeFilter === filter.key && styles.activeBadge,
          ]}
          onPress={() => onFilterChange(filter.key)}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.badgeText,
              activeFilter === filter.key && styles.activeBadgeText,
            ]}
          >
            {filter.label}
          </Text>
          {filter.count > 0 && (
            <View
              style={[
                styles.countBadge,
                activeFilter === filter.key && styles.activeCountBadge,
              ]}
            >
              <Text
                style={[
                  styles.countText,
                  activeFilter === filter.key && styles.activeCountText,
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

const styles = StyleSheet.create({
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
