import React, { useRef, useMemo, useCallback, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, ListRenderItem } from 'react-native';
import { visitasStyles } from './visitas.style';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomSheet from '@gorhom/bottom-sheet';
import CustomBottomSheet from '../../../../shared/components/bottom-sheet/bottom-sheet';
import CargarOrdenComponent from '../../components/cargar-orden/cargar-orden.component';
import { useAppSelector, useAppDispatch } from '../../../../store/hooks';
import { selectVisitas } from '../../store/selector/visita.selector';
import { selectIsLoading, selectIsSucceeded, selectTotalVisitasSeleccionadas, selectTodasVisitasSeleccionadas } from '../../store/selector/visita.selector';
import { seleccionarTodasVisitas, limpiarSeleccionVisitas } from '../../store/slice/visita.slice';
import VisitaCardComponent from '../../components/visita-card/visita-card.component';
import { VisitaResponse } from '../../interfaces/visita.interface';

// Constantes para optimización
const ITEM_HEIGHT = 120; // Altura estimada de cada card
const INITIAL_NUM_TO_RENDER = 10;
const MAX_TO_RENDER_PER_BATCH = 5;
const WINDOW_SIZE = 10;

export const VisitasScreen = () => {
  const dispatch = useAppDispatch();
  const visitas = useAppSelector(selectVisitas);
  const isLoading = useAppSelector(selectIsLoading);
  const isSuccess = useAppSelector(selectIsSucceeded);
  const totalSeleccionadas = useAppSelector(selectTotalVisitasSeleccionadas);
  const todasSeleccionadas = useAppSelector(selectTodasVisitasSeleccionadas);
  
  // Estados para paginación virtual
  const [refreshing, setRefreshing] = useState(false);

  const bottomSheetRef = useRef<BottomSheet>(null);

  const handleOpenDevModeSheet = useCallback(() => {
    bottomSheetRef.current?.expand();
  }, []);

  const handleCloseDevModeSheet = useCallback(() => {
    bottomSheetRef.current?.close();
  }, []);

  // Optimización: Memoizar el renderItem
  const renderVisitaItem: ListRenderItem<VisitaResponse> = useCallback(({ item, index }) => (
    <VisitaCardComponent 
      visita={item} 
      index={index}
    />
  ), []);

  // Optimización: getItemLayout para mejor rendimiento
  const getItemLayout = useCallback((data: ArrayLike<VisitaResponse> | null | undefined, index: number) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  }), []);

  // Optimización: keyExtractor memoizado
  const keyExtractor = useCallback((item: VisitaResponse) => `visita-${item.id}`, []);

  // Manejar refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Aquí puedes agregar lógica para recargar datos
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  // Funciones para manejar selección múltiple
  const handleSeleccionarTodas = useCallback(() => {
    dispatch(seleccionarTodasVisitas());
  }, [dispatch]);

  const handleLimpiarSeleccion = useCallback(() => {
    dispatch(limpiarSeleccionVisitas());
  }, [dispatch]);

  // Componente de header memoizado
  const ListHeaderComponent = useMemo(() => (
    <View style={visitasStyles.header}>
      <View style={visitasStyles.titleRow}>
        <Text style={visitasStyles.title}>Visitas</Text>
        {totalSeleccionadas > 0 && (
          <Text style={visitasStyles.selectionCounter}>
            {totalSeleccionadas} seleccionada{totalSeleccionadas !== 1 ? 's' : ''}
          </Text>
        )}
      </View>
      
      {/* Controles de selección cuando hay visitas */}
      {visitas.length > 0 && (
        <View style={visitasStyles.selectionControls}>
          <TouchableOpacity 
            style={visitasStyles.selectionButton} 
            onPress={todasSeleccionadas ? handleLimpiarSeleccion : handleSeleccionarTodas}
          >
            <Text style={visitasStyles.selectionButtonText}>
              {todasSeleccionadas ? 'Deseleccionar todas' : 'Seleccionar todas'}
            </Text>
          </TouchableOpacity>
          
          {totalSeleccionadas > 0 && (
            <TouchableOpacity 
              style={[visitasStyles.selectionButton, visitasStyles.clearButton]} 
              onPress={handleLimpiarSeleccion}
            >
              <Text style={[visitasStyles.selectionButtonText, visitasStyles.clearButtonText]}>
                Limpiar
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
      
      {visitas.length === 0 && (
        <View style={visitasStyles.emptyState}>
          <Text style={visitasStyles.emptyTitle}>No tienes visitas cargadas</Text>
          <Text style={visitasStyles.emptySubtitle}>
            Las visitas aparecerán aquí cuando estén disponibles
          </Text>
          <TouchableOpacity style={visitasStyles.emptyButtonContainer} onPress={handleOpenDevModeSheet}>
            <Text style={visitasStyles.emptyButton}>Cargar orden</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  ), [visitas.length, totalSeleccionadas, todasSeleccionadas, handleOpenDevModeSheet, handleSeleccionarTodas, handleLimpiarSeleccion]);

  // Componente de footer para loading
  const ListFooterComponent = useMemo(() => (
    isLoading ? (
      <View style={visitasStyles.loadingFooter}>
        <Text style={visitasStyles.loadingText}>Cargando más visitas...</Text>
      </View>
    ) : null
  ), [isLoading]);

  if(isSuccess) {
    handleCloseDevModeSheet();
  }

  return (
    <SafeAreaView style={visitasStyles.container}>
      <FlatList
        data={visitas}
        renderItem={renderVisitaItem}
        keyExtractor={keyExtractor}
        getItemLayout={getItemLayout}
        ListHeaderComponent={ListHeaderComponent}
        ListFooterComponent={ListFooterComponent}
        
        // Optimizaciones de rendimiento críticas
        removeClippedSubviews={true}
        maxToRenderPerBatch={MAX_TO_RENDER_PER_BATCH}
        initialNumToRender={INITIAL_NUM_TO_RENDER}
        windowSize={WINDOW_SIZE}
        updateCellsBatchingPeriod={50}
        
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

      {/* Bottom Sheet para el selector de modo desarrollador */}
      <CustomBottomSheet ref={bottomSheetRef} initialSnapPoints={['30%']}>
        <CargarOrdenComponent />
      </CustomBottomSheet>
    </SafeAreaView>
  );
};
