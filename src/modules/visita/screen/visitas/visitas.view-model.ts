import { useCallback, useState, useRef, useMemo } from 'react';
import BottomSheet from '@gorhom/bottom-sheet';
import { useAppSelector, useAppDispatch } from '../../../../store/hooks';
import { selectVisitas, selectIsLoading, selectIsSucceeded, selectTotalVisitasSeleccionadas } from '../../store/selector/visita.selector';
import { limpiarSeleccionVisitas } from '../../store/slice/visita.slice';
import { VisitaResponse } from '../../interfaces/visita.interface';

// Constantes para optimización de FlatList
export const LIST_OPTIMIZATION_CONFIG = {
  ITEM_HEIGHT: 120,
  INITIAL_NUM_TO_RENDER: 10,
  MAX_TO_RENDER_PER_BATCH: 5,
  WINDOW_SIZE: 10,
  UPDATE_CELLS_BATCHING_PERIOD: 50,
} as const;

/**
 * ViewModel para la pantalla de Visitas
 * Maneja toda la lógica de negocio y estado de la pantalla
 */
export const useVisitasViewModel = () => {
  const dispatch = useAppDispatch();
  
  // Estados del store
  const visitas = useAppSelector(selectVisitas);
  const isLoading = useAppSelector(selectIsLoading);
  const isSuccess = useAppSelector(selectIsSucceeded);
  const totalSeleccionadas = useAppSelector(selectTotalVisitasSeleccionadas);
  
  // Estados locales
  const [refreshing, setRefreshing] = useState(false);
  
  // Referencias
  const bottomSheetRef = useRef<BottomSheet>(null);

  // === ACCIONES DE BOTTOM SHEET ===
  const openDevModeSheet = useCallback(() => {
    bottomSheetRef.current?.expand();
  }, []);

  const closeDevModeSheet = useCallback(() => {
    bottomSheetRef.current?.close();
  }, []);

  // === ACCIONES DE SELECCIÓN ===
  const clearSelection = useCallback(() => {
    dispatch(limpiarSeleccionVisitas());
  }, [dispatch]);

  const deliverSelectedVisitas = useCallback(() => {
    // TODO: Implementar lógica de entrega real
    console.log(`Entregando ${totalSeleccionadas} visitas`);
    
    // Por ahora solo limpiamos la selección
    dispatch(limpiarSeleccionVisitas());
  }, [dispatch, totalSeleccionadas]);

  // === ACCIONES DE LISTA ===
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // TODO: Implementar lógica de recarga de datos
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  // === OPTIMIZACIONES DE FLATLIST ===
  const getItemLayout = useCallback((data: ArrayLike<VisitaResponse> | null | undefined, index: number) => ({
    length: LIST_OPTIMIZATION_CONFIG.ITEM_HEIGHT,
    offset: LIST_OPTIMIZATION_CONFIG.ITEM_HEIGHT * index,
    index,
  }), []);

  const keyExtractor = useCallback((item: VisitaResponse) => `visita-${item.id}`, []);

  // === ESTADOS COMPUTADOS ===
  const hasVisitas = useMemo(() => visitas.length > 0, [visitas.length]);
  const hasSelectedVisitas = useMemo(() => totalSeleccionadas > 0, [totalSeleccionadas]);
  const selectionCounterText = useMemo(() => 
    `${totalSeleccionadas} seleccionada${totalSeleccionadas !== 1 ? 's' : ''}`,
    [totalSeleccionadas]
  );

  // === EFECTOS SECUNDARIOS ===
  // Cerrar bottom sheet cuando la operación sea exitosa
  if (isSuccess) {
    closeDevModeSheet();
  }

  return {
    // Estados
    visitas,
    isLoading,
    isSuccess,
    totalSeleccionadas,
    refreshing,
    hasVisitas,
    hasSelectedVisitas,
    selectionCounterText,
    
    // Referencias
    bottomSheetRef,
    
    // Acciones de Bottom Sheet
    openDevModeSheet,
    closeDevModeSheet,
    
    // Acciones de Selección
    clearSelection,
    deliverSelectedVisitas,
    
    // Acciones de Lista
    onRefresh,
    
    // Optimizaciones de FlatList
    getItemLayout,
    keyExtractor,
    
    // Configuración
    listConfig: LIST_OPTIMIZATION_CONFIG,
  };
};

export type VisitasViewModel = ReturnType<typeof useVisitasViewModel>;
