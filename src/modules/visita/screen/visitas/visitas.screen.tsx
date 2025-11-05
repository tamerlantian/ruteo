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
  // Usar el ViewModel para toda la lógica de negocio
  const viewModel = useVisitasViewModel();

  // Componente de renderizado de items memoizado
  const renderVisitaItem: ListRenderItem<VisitaResponse> = useCallback(({ item, index }) => (
    <VisitaCardComponent 
      visita={item} 
      index={index}
    />
  ), []);

  return (
    <SafeAreaView style={visitasStyles.container}>
      <FormButton title="Limpiar" onPress={viewModel.retirarOrden} />
      <FlatList
        data={viewModel.visitas}
        renderItem={renderVisitaItem}
        keyExtractor={viewModel.keyExtractor}
        getItemLayout={viewModel.getItemLayout}
        ListHeaderComponent={
          <VisitasHeader
            hasVisitas={viewModel.hasVisitas}
            onOpenDevModeSheet={viewModel.openDevModeSheet}
            activeFilter={viewModel.activeFilter}
            onFilterChange={viewModel.onFilterChange}
            pendingCount={viewModel.pendingCount}
            errorCount={viewModel.errorCount}
          />
        }
        ListFooterComponent={
          <VisitasLoadingFooter isLoading={viewModel.isLoading} />
        }
        
        // Optimizaciones de rendimiento críticas
        removeClippedSubviews={true}
        maxToRenderPerBatch={viewModel.listConfig.MAX_TO_RENDER_PER_BATCH}
        initialNumToRender={viewModel.listConfig.INITIAL_NUM_TO_RENDER}
        windowSize={viewModel.listConfig.WINDOW_SIZE}
        updateCellsBatchingPeriod={viewModel.listConfig.UPDATE_CELLS_BATCHING_PERIOD}
        
        // Pull to refresh
        refreshing={viewModel.refreshing}
        onRefresh={viewModel.onRefresh}
        
        // Estilos
        style={visitasStyles.flatList}
        contentContainerStyle={visitasStyles.contentContainer}
        showsVerticalScrollIndicator={false}
        
        // Optimización adicional para listas grandes
        legacyImplementation={false}
      />

      {/* Floating Action Bar */}
      <VisitasFloatingActions
        totalSeleccionadas={viewModel.totalSeleccionadas}
        onClearSelection={viewModel.clearSelection}
        onDeliverVisitas={viewModel.deliverSelectedVisitas}
      />

      {/* Bottom Sheet para el selector de modo desarrollador */}
      <CustomBottomSheet ref={viewModel.bottomSheetRef} initialSnapPoints={['30%']}>
        <CargarOrdenComponent />
      </CustomBottomSheet>
    </SafeAreaView>
  );
};
