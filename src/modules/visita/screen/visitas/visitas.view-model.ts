import { useCallback, useState, useRef, useMemo } from 'react';
import BottomSheet from '@gorhom/bottom-sheet';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAppSelector, useAppDispatch } from '../../../../store/hooks';
import { selectVisitas, selectIsLoading, selectIsSucceeded, selectTotalVisitasSeleccionadas, selectVisitasSeleccionadas } from '../../store/selector/visita.selector';
import { limpiarSeleccionVisitas } from '../../store/slice/visita.slice';
import { VisitaResponse } from '../../interfaces/visita.interface';
import { MainStackParamList } from '../../../../navigation/types';
import { LIST_OPTIMIZATION_CONFIG } from '../../constants/visita.constant';

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
    if (visitasSeleccionadas.length === 0) {
      console.warn('No hay visitas seleccionadas para entregar');
      return;
    }

    // Navegar al formulario de entrega con las visitas seleccionadas
    // Convertir los IDs de number a string para la navegación
    navigation.navigate('EntregaForm', {
      visitasSeleccionadas: visitasSeleccionadas.map(id => id.toString()),
    });
  }, [navigation, visitasSeleccionadas]);

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
