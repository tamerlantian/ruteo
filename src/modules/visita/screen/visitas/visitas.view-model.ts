import { useCallback, useState, useRef, useMemo } from 'react';
import BottomSheet from '@gorhom/bottom-sheet';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAppSelector, useAppDispatch } from '../../../../store/hooks';
import { 
  selectVisitas, 
  selectIsLoading, 
  selectIsSucceeded, 
  selectTotalVisitasSeleccionadas, 
  selectVisitasSeleccionadas,
  selectVisitasSeleccionadasConDatosGuardados,
  selectVisitasPendientes,
  selectVisitasConError
} from '../../store/selector/visita.selector';
import { removerVisitas, limpiarSeleccionVisitas } from '../../store/slice/visita.slice';
import { VisitaResponse } from '../../interfaces/visita.interface';
import { MainStackParamList } from '../../../../navigation/types';
import { LIST_OPTIMIZATION_CONFIG } from '../../constants/visita.constant';
import { FilterType } from '../../components/filter-badges/filter-badges.component';
import { useRetryVisitas } from '../../hooks/use-retry-visitas.hook';

/**
 * ViewModel para la pantalla de Visitas
 * Maneja toda la lógica de negocio y estado de la pantalla
 */
type NavigationProp = NativeStackNavigationProp<MainStackParamList>;

export const useVisitasViewModel = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation<NavigationProp>();
  
  // Estados del store
  const visitas = useAppSelector(selectVisitas);
  const isLoading = useAppSelector(selectIsLoading);
  const isSuccess = useAppSelector(selectIsSucceeded);
  const totalSeleccionadas = useAppSelector(selectTotalVisitasSeleccionadas);
  const visitasSeleccionadas = useAppSelector(selectVisitasSeleccionadas);
  const visitasSeleccionadasConDatosGuardados = useAppSelector(selectVisitasSeleccionadasConDatosGuardados);
  
  // Usar selectores existentes en lugar de duplicar lógica
  const visitasPendientes = useAppSelector(selectVisitasPendientes);
  const visitasConError = useAppSelector(selectVisitasConError);
  
  // Hook para reintento de visitas
  const { reintentarVisitasConError } = useRetryVisitas();
  
  // Estados locales
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterType>('pending');
  
  // Referencias
  const bottomSheetRef = useRef<BottomSheet>(null);

  const retirarOrden = () => {
    dispatch(removerVisitas());
    dispatch(limpiarSeleccionVisitas());
  }

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
    if (visitasSeleccionadas.length === 0) {
      console.warn('No hay visitas seleccionadas para entregar');
      return;
    }

    // Navegar al formulario de entrega con las visitas seleccionadas
    // Convertir los IDs de number a string para la navegación
    // TODO: rectificar si es la mejor manera o simplemente tomar los ids del slice
    navigation.navigate('EntregaForm', {
      visitasSeleccionadas: visitasSeleccionadas.map(id => id.toString()),
    });
  }, [navigation, visitasSeleccionadas]);

  const retrySelectedVisitas = useCallback(() => {
    if (visitasSeleccionadasConDatosGuardados.length === 0) {
      console.warn('No hay visitas con error y datos guardados para reintentar');
      return;
    }

    // Usar el selector que ya filtra las visitas con error y datos guardados
    const visitasConErrorIds = visitasSeleccionadasConDatosGuardados.map(visita => visita.id);
    reintentarVisitasConError(visitasConErrorIds);
  }, [visitasSeleccionadasConDatosGuardados, reintentarVisitasConError]);

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

  // === ACCIONES DE FILTRO ===
  const handleFilterChange = useCallback((filter: FilterType) => {
    setActiveFilter(filter);
  }, []);

  // === ESTADOS COMPUTADOS ===
  const visitasFiltradas = useMemo(() => {
    switch (activeFilter) {
      case 'pending':
        return visitasPendientes;
      case 'error':
        return visitasConError;
      default:
        return visitasPendientes; // Default to pending
    }
  }, [activeFilter, visitasPendientes, visitasConError]);

  const hasVisitas = useMemo(() => visitas.length > 0, [visitas.length]);
  const hasSelectedVisitas = useMemo(() => totalSeleccionadas > 0, [totalSeleccionadas]);

  // Usar el selector para obtener el conteo de visitas con error seleccionadas
  const totalConErrorSeleccionadas = visitasSeleccionadasConDatosGuardados.length;

  // === EFECTOS SECUNDARIOS ===
  // Cerrar bottom sheet cuando la operación sea exitosa
  if (isSuccess) {
    closeDevModeSheet();
  }

  return {
    // Estados
    visitas: visitasFiltradas,
    allVisitas: visitas,
    isLoading,
    isSuccess,
    totalSeleccionadas,
    totalConErrorSeleccionadas,
    refreshing,
    hasVisitas,
    hasSelectedVisitas,
    
    // Filter states
    activeFilter,
    pendingCount: visitasPendientes.length,
    errorCount: visitasConError.length,
    totalCount: visitas.length,
    
    // Referencias
    bottomSheetRef,
    
    // Acciones de Bottom Sheet
    openDevModeSheet,
    closeDevModeSheet,
    retirarOrden,
    
    // Acciones de Selección
    clearSelection,
    deliverSelectedVisitas,
    retrySelectedVisitas,
    
    // Acciones de Lista
    onRefresh,
    
    // Acciones de Filtro
    onFilterChange: handleFilterChange,
    
    // Optimizaciones de FlatList
    getItemLayout,
    keyExtractor,
    
    // Configuración
    listConfig: LIST_OPTIMIZATION_CONFIG,
  };
};

export type VisitasViewModel = ReturnType<typeof useVisitasViewModel>;
