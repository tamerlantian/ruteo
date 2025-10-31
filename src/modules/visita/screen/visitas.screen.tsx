import React, { useRef, useMemo, useCallback, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ListRenderItem } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomSheet from '@gorhom/bottom-sheet';
import CustomBottomSheet from '../../../shared/components/bottom-sheet/bottom-sheet';
import CargarOrdenComponent from '../components/cargar-orden/cargar-orden.component';
import { useAppSelector } from '../../../store/hooks';
import { selectVisitas } from '../store/selector/visita.selector';
import { selectIsLoading, selectIsSucceeded } from '../store/selector/visita.selector';
import VisitaCardComponent from '../components/visita-card/visita-card.component';
import { VisitaResponse } from '../interfaces/visita.interface';

// Constantes para optimización
const ITEM_HEIGHT = 120; // Altura estimada de cada card
const INITIAL_NUM_TO_RENDER = 10;
const MAX_TO_RENDER_PER_BATCH = 5;
const WINDOW_SIZE = 10;

export const VisitasScreen = () => {
  const visitas = useAppSelector(selectVisitas);
  const isLoading = useAppSelector(selectIsLoading);
  const isSuccess = useAppSelector(selectIsSucceeded);
  
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

  // Componente de header memoizado
  const ListHeaderComponent = useMemo(() => (
    <View style={styles.header}>
      <Text style={styles.title}>Visitas</Text>
      {visitas.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No tienes visitas cargadas</Text>
          <Text style={styles.emptySubtitle}>
            Las visitas aparecerán aquí cuando estén disponibles
          </Text>
          <TouchableOpacity style={styles.emptyButtonContainer} onPress={handleOpenDevModeSheet}>
            <Text style={styles.emptyButton}>Cargar orden</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  ), [visitas.length, handleOpenDevModeSheet]);

  // Componente de footer para loading
  const ListFooterComponent = useMemo(() => (
    isLoading ? (
      <View style={styles.loadingFooter}>
        <Text style={styles.loadingText}>Cargando más visitas...</Text>
      </View>
    ) : null
  ), [isLoading]);

  if(isSuccess) {
    handleCloseDevModeSheet();
  }

  return (
    <SafeAreaView style={styles.container}>
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
        style={styles.flatList}
        contentContainerStyle={styles.contentContainer}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  flatList: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1c1c1e',
    marginBottom: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1c1c1e',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#8e8e93',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  emptyButtonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyButton: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007aff',
    marginTop: 20,
  },
  loadingFooter: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#8e8e93',
  },
});
