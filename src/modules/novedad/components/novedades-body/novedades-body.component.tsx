import React, { useCallback, useMemo } from 'react';
import { View, FlatList, ListRenderItem, StyleSheet } from 'react-native';

import { Novedad } from '../../interfaces/novedad.interface';
import { NovedadesHeader } from '../novedades-header/novedades-header.component';
import { NovedadCardComponent } from '../novedad-card/novedad-card.component';
import { NovedadFloatingActions } from '../novedad-floating-actions/novedad-floating-actions.component';
import { useNovedadesViewModel } from '../../screen/novedades/novedades.view-model';
import { visitasStyles } from '../../../visita/screen/visitas/visitas.style';

/**
 * Cuerpo reutilizable de la gestión de novedades (header de filtros + lista de
 * cards + acciones flotantes Solucionar/Reintentar), manejado por
 * `useNovedadesViewModel` (opera sobre las novedades de la orden abierta).
 *
 * Se usa en DOS lugares para no duplicar el flujo:
 *  - La pestaña inferior `NovedadesScreen` (con su propio AppBar).
 *  - El detalle de la orden, bajo el filtro "Novedades" (embebido, sin AppBar),
 *    para que el conductor resuelva/reintente sin salir de la orden.
 */
export const NovedadesBody = () => {
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
    ({ item }) => <NovedadCardComponent novedad={item} />,
    [],
  );

  const contentContainerStyle = useMemo(
    () => ({
      flexGrow: 1,
      paddingBottom: totalSeleccionadas > 0 ? 120 : 0,
    }),
    [totalSeleccionadas],
  );

  return (
    <View style={styles.fill}>
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
      <FlatList
        data={novedades}
        renderItem={renderNovedadItem}
        keyExtractor={keyExtractor}
        removeClippedSubviews={true}
        maxToRenderPerBatch={listConfig.MAX_TO_RENDER_PER_BATCH}
        initialNumToRender={listConfig.INITIAL_NUM_TO_RENDER}
        windowSize={listConfig.WINDOW_SIZE}
        updateCellsBatchingPeriod={listConfig.UPDATE_CELLS_BATCHING_PERIOD}
        refreshing={refreshing}
        onRefresh={onRefresh}
        style={visitasStyles.flatList}
        contentContainerStyle={contentContainerStyle}
        showsVerticalScrollIndicator={false}
        legacyImplementation={false}
      />
      <NovedadFloatingActions
        totalSeleccionadas={totalSeleccionadas}
        totalConError={errorCount}
        activeFilter={activeFilter}
        onClearSelection={onClearSelection}
        onSolucionarNovedades={onSolucionarNovedades}
        onRetryNovedades={onRetryNovedades}
        isRetryLoading={isRetryLoading}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  fill: { flex: 1 },
});
