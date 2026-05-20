import React, { useCallback, useMemo } from 'react';
import { FlatList, ListRenderItem } from 'react-native';
import { visitasStyles } from './visitas.style';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import CustomBottomSheet from '../../../../shared/components/bottom-sheet/bottom-sheet';
import { AppBar, AppBarAction } from '../../../../shared/components/ui/app-bar/app-bar.component';
import CargarOrdenComponent from '../../components/cargar-orden/cargar-orden.component';
import { MisOrdenesComponent } from '../../components/mis-ordenes/mis-ordenes.component';
import VisitaCardComponent from '../../components/visita-card/visita-card.component';
import { VisitaResponse } from '../../interfaces/visita.interface';
import { useVisitasViewModel } from './visitas.view-model';
import { VisitasHeader } from '../../components/visitas-header/visitas-header.component';
import { VisitasFloatingActions } from '../../components/visita-floating-actions/visitas-floating-actions.component';
import { VisitasLoadingFooter } from '../../components/visitas-loading-footer/visitas-loading-footer.component';
import { VisitasOptionsComponent } from '../../components/visitas-options/visitas-options.component';
import { ConfirmacionDesvincularComponent } from '../../components/confirmacion-desvincular/confirmacion-desvincular.component';
import { selectConteoVisitasQueImpidenDesvinculacion, selectPuedeDesvincular } from '../../store/selector/visita.selector';
import { useAppSelector } from '../../../../store/hooks';

export const VisitasScreen = () => {
  const {
    openDevModeSheet,
    openOptionsSheet,
    visitas,
    keyExtractor,
    onRefresh,
    refreshing,
    isLoading,
    hasVisitas,
    hasOrdenCargada,
    activeFilter,
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
    listConfig,
    bottomSheetRef,
    optionsBottomSheetRef,
    confirmacionBottomSheetRef,
    cambiarOrdenSheetRef,
    ordenEntrega,
    handleDesvincular,
    confirmarDesvinculacion,
    cancelarDesvinculacion,
    clearSelection,
    deliverSelectedVisitas,
    retrySelectedVisitas,
    reportNovedadSelectedVisitas,
    onFilterChange,
    isRetryLoading,
    totalSeleccionadas,
    totalConErrorSeleccionadas,
    selectAllErrors,
    handleCargarOrdenDismiss,
    openCambiarOrdenSheet,
    closeCambiarOrdenSheet,
    anularSelectedVisitas,
  } = useVisitasViewModel();
  const ordenActualId = ordenEntrega ? parseInt(ordenEntrega, 10) : null;
  const puedeDesvincular = useAppSelector(selectPuedeDesvincular);
  const conteoVisitas = useAppSelector(selectConteoVisitasQueImpidenDesvinculacion);

  const insets = useSafeAreaInsets();
  const renderVisitaItem: ListRenderItem<VisitaResponse> = useCallback(
    ({ item, index }) => <VisitaCardComponent visita={item} index={index} />,
    [],
  );

  // Padding dinámico para evitar que el floating action bar tape la última card
  const contentContainerStyle = useMemo(() => ({
    flexGrow: 1,
    paddingBottom: totalSeleccionadas > 0 && activeFilter !== 'novedades' ? 120 : 0,
  }), [totalSeleccionadas, activeFilter]);

  return (
    <SafeAreaView style={visitasStyles.container}>
      {/* Header fijo - no se mueve con el scroll */}
      <AppBar
        title="Entregas"
        subtitle={
          hasOrdenCargada
            ? `${deliveredCount} de ${totalCount} entregadas${
                novedadesCount > 0
                  ? ` · ${novedadesCount} novedad${
                      novedadesCount === 1 ? '' : 'es'
                    }`
                  : ''
              }`
            : undefined
        }
        actions={
          hasOrdenCargada ? (
            <>
              <AppBarAction
                icon="swap-horizontal-outline"
                label="Cambiar de orden"
                onPress={openCambiarOrdenSheet}
              />
              <AppBarAction
                icon="ellipsis-horizontal"
                label="Más opciones"
                onPress={openOptionsSheet}
              />
            </>
          ) : undefined
        }
      />
      {hasOrdenCargada && (
        <VisitasHeader
          activeFilter={activeFilter}
          onFilterChange={onFilterChange}
          pendingCount={pendingCount}
          errorCount={errorCount}
          erroresCount={erroresCount}
          novedadesCount={novedadesCount}
          searchValue={searchValue}
          onSearchChange={onSearchChange}
          onScanResult={onScanResult}
          onClearFilters={onClearFilters}
        />
      )}
      {/* Si hay orden cargada, mostrar las visitas; si no, las ordenes asignadas */}
      {hasOrdenCargada ? (
        <FlatList
          data={visitas}
          renderItem={renderVisitaItem}
          keyExtractor={keyExtractor}
          ListFooterComponent={<VisitasLoadingFooter isLoading={isLoading} />}
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
      ) : (
        <MisOrdenesComponent onCargarPorCodigo={openDevModeSheet} />
      )}
      {/* Floating Action Bar */}
      {hasOrdenCargada && activeFilter !== 'novedades' && (
        <VisitasFloatingActions
          totalSeleccionadas={totalSeleccionadas}
          totalConError={totalConErrorSeleccionadas}
          activeFilter={activeFilter}
          isRetryLoading={isRetryLoading}
          onClearSelection={clearSelection}
          onDeliverVisitas={deliverSelectedVisitas}
          onRetryVisitas={retrySelectedVisitas}
          onNovedadVisitas={reportNovedadSelectedVisitas}
          onAnularVisitas={anularSelectedVisitas}
          onSelectAllErrors={selectAllErrors}
          totalErrorsInFilter={errorCount}
        />
      )}
      <CustomBottomSheet
        ref={bottomSheetRef}
        enableDynamicSizing={false}
        initialSnapPoints={['45%']}
        onDismiss={handleCargarOrdenDismiss}
      >
        <CargarOrdenComponent />
      </CustomBottomSheet>
      <CustomBottomSheet
        ref={cambiarOrdenSheetRef}
        enableDynamicSizing={false}
        initialSnapPoints={['75%']}
        useScrollView={false}
      >
        <MisOrdenesComponent
          onCargarPorCodigo={() => {
            closeCambiarOrdenSheet();
            openDevModeSheet();
          }}
          ordenActualId={ordenActualId}
          onSeleccionExitosa={closeCambiarOrdenSheet}
        />
      </CustomBottomSheet>
      <CustomBottomSheet
        ref={optionsBottomSheetRef}
        enableDynamicSizing={false}
        initialSnapPoints={['25%']}
      >
        <VisitasOptionsComponent onDesvincular={handleDesvincular} />
      </CustomBottomSheet>
      <CustomBottomSheet
        ref={confirmacionBottomSheetRef}
        enableDynamicSizing={true}
        initialSnapPoints={['40%']}
      >
        <ConfirmacionDesvincularComponent
          onConfirmar={confirmarDesvinculacion}
          onCancelar={cancelarDesvinculacion}
          puedeDesvincular={puedeDesvincular}
          conteoVisitas={conteoVisitas}
        />
      </CustomBottomSheet>
    </SafeAreaView>
  );
};
