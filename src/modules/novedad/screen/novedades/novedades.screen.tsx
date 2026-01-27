import React, { useCallback, useMemo } from 'react';
import { FlatList, ListRenderItem } from 'react-native';
import { visitasStyles } from '../../../visita/screen/visitas/visitas.style';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Novedad } from '../../interfaces/novedad.interface';
import { NovedadesHeader } from '../../components/novedades-header/novedades-header.component';
import { NovedadCardComponent } from '../../components/novedad-card/novedad-card.component';
import { NovedadFloatingActions } from '../../components/novedad-floating-actions/novedad-floating-actions.component';
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
    allCount,
    searchValue,
    onSearchChange,
    onClearFilters,
    onFilterChange,
    handleScanResult,
    listConfig,
    totalSeleccionadas,
    onClearSelection,
    onSolucionarNovedades,
    onRetryNovedades,
    isRetryLoading,
  } = useNovedadesViewModel();

  const renderNovedadItem: ListRenderItem<Novedad> = useCallback(
    ({ item }) => (
      <NovedadCardComponent novedad={item} />
    ),
    [],
  );

  // Padding dinámico para evitar que el floating action bar tape la última card
  const contentContainerStyle = useMemo(() => ({
    flexGrow: 1,
    paddingBottom: totalSeleccionadas > 0 ? 120 : 0,
  }), [totalSeleccionadas]);

  return (
    <SafeAreaView style={visitasStyles.container}>
      {/* Header fijo - no se mueve con el scroll */}
      <NovedadesHeader
        hasNovedades={hasNovedades}
        activeFilter={activeFilter}
        onFilterChange={onFilterChange}
        errorCount={errorCount}
        allCount={allCount}
        searchValue={searchValue}
        onSearchChange={onSearchChange}
        onScanResult={handleScanResult}
        onClearFilters={onClearFilters}
      />
      {/* Lista de novedades - solo las cards hacen scroll */}
      <FlatList
        data={novedades}
        renderItem={renderNovedadItem}
        keyExtractor={keyExtractor}
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
        contentContainerStyle={contentContainerStyle}
        showsVerticalScrollIndicator={false}
        // Optimización adicional para listas grandes
        legacyImplementation={false}
      />

      {/* Floating Actions */}
      <NovedadFloatingActions
        totalSeleccionadas={totalSeleccionadas}
        totalConError={errorCount}
        activeFilter={activeFilter}
        onClearSelection={onClearSelection}
        onSolucionarNovedades={onSolucionarNovedades}
        onRetryNovedades={onRetryNovedades}
        isRetryLoading={isRetryLoading}
      />
    </SafeAreaView>
  );
};
