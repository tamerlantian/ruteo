import React, { useCallback } from 'react';
import { FlatList, ListRenderItem } from 'react-native';
import { visitasStyles } from './visitas.style';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomBottomSheet from '../../../../shared/components/bottom-sheet/bottom-sheet';
import CargarOrdenComponent from '../../components/cargar-orden/cargar-orden.component';
import VisitaCardComponent from '../../components/visita-card/visita-card.component';
import { VisitaResponse } from '../../interfaces/visita.interface';
import { useVisitasViewModel } from './visitas.view-model';
import { VisitasHeader } from '../../components/visitas-header/visitas-header.component';
import { VisitasFloatingActions } from '../../components/visita-floating-actions/visitas-floating-actions.component';
import { VisitasLoadingFooter } from '../../components/visitas-loading-footer/visitas-loading-footer.component';
import { FormButton } from '../../../../shared/components/ui/button/FormButton';

export const VisitasScreen = () => {
  const {
    retirarOrden,
    openDevModeSheet,
    visitas,
    keyExtractor,
    getItemLayout,
    onRefresh,
    refreshing,
    isLoading,
    hasVisitas,
    activeFilter,
    pendingCount,
    errorCount,
    listConfig,
    bottomSheetRef,
    clearSelection,
    deliverSelectedVisitas,
    retrySelectedVisitas,
    onFilterChange,
    totalSeleccionadas,
    totalConErrorSeleccionadas,
  } = useVisitasViewModel();

  const renderVisitaItem: ListRenderItem<VisitaResponse> = useCallback(
    ({ item, index }) => <VisitaCardComponent visita={item} index={index} />,
    [],
  );

  return (
    <SafeAreaView style={visitasStyles.container}>
      <FormButton title="Limpiar" onPress={retirarOrden} />
      <FlatList
        data={visitas}
        renderItem={renderVisitaItem}
        keyExtractor={keyExtractor}
        getItemLayout={getItemLayout}
        ListHeaderComponent={
          <VisitasHeader
            hasVisitas={hasVisitas}
            onOpenDevModeSheet={openDevModeSheet}
            activeFilter={activeFilter}
            onFilterChange={onFilterChange}
            pendingCount={pendingCount}
            errorCount={errorCount}
          />
        }
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
        contentContainerStyle={visitasStyles.contentContainer}
        showsVerticalScrollIndicator={false}
        // Optimización adicional para listas grandes
        legacyImplementation={false}
      />

      {/* Floating Action Bar */}
      <VisitasFloatingActions
        totalSeleccionadas={totalSeleccionadas}
        totalConError={totalConErrorSeleccionadas}
        activeFilter={activeFilter}
        onClearSelection={clearSelection}
        onDeliverVisitas={deliverSelectedVisitas}
        onRetryVisitas={retrySelectedVisitas}
      />

      <CustomBottomSheet
        ref={bottomSheetRef}
        initialSnapPoints={['30%']}
      >
        <CargarOrdenComponent />
      </CustomBottomSheet>
    </SafeAreaView>
  );
};
