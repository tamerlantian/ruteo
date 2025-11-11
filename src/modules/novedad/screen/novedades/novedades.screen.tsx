import React, { useCallback } from 'react';
import { FlatList, ListRenderItem } from 'react-native';
import { visitasStyles } from '../../../visita/screen/visitas/visitas.style';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Novedad } from '../../interfaces/novedad.interface';
import { NovedadesHeader } from '../../components/novedades-header/novedades-header.component';
import { NovedadCardComponent } from '../../components/novedad-card/novedad-card.component';
import { useNovedadesViewModel } from './novedades.view-model';

export const NovedadesScreen = () => {
  const {
    novedades,
    keyExtractor,
    onRefresh,
    refreshing,
    hasNovedades,
    activeFilter,
    errorCount,
    totalCount,
    searchValue,
    onSearchChange,
    onClearFilters,
    onFilterChange,
    listConfig,
  } = useNovedadesViewModel();

  const renderNovedadItem: ListRenderItem<Novedad> = useCallback(
    ({ item }) => (
      <NovedadCardComponent novedad={item} />
    ),
    [],
  );

  return (
    <SafeAreaView style={visitasStyles.container}>
      <FlatList
        data={novedades}
        renderItem={renderNovedadItem}
        keyExtractor={keyExtractor}
        ListHeaderComponent={
          <NovedadesHeader
            hasNovedades={hasNovedades}
            activeFilter={activeFilter}
            onFilterChange={onFilterChange}
            errorCount={errorCount}
            totalCount={totalCount}
            searchValue={searchValue}
            onSearchChange={onSearchChange}
            onClearFilters={onClearFilters}
          />
        }
        // Optimizaciones de rendimiento críticas
        removeClippedSubviews={true}
        maxToRenderPerBatch={listConfig.MAX_TO_RENDER_PER_BATCH}
        initialNumToRender={listConfig.INITIAL_NUM_TO_RENDER}
        windowSize={listConfig.WINDOW_SIZE}
        updateCellsBatchingPeriod={listConfig.UPDATE_CELLS_BATCHING_PERIOD}
        // Pull to refresh
        refreshing={refreshing}
        onRefresh={onRefresh}
        // Estilos
        style={visitasStyles.flatList}
        contentContainerStyle={visitasStyles.contentContainer}
        showsVerticalScrollIndicator={false}
        // Optimización adicional para listas grandes
        legacyImplementation={false}
      />
    </SafeAreaView>
  );
};
