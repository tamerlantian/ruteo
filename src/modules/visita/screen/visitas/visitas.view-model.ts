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
  selectVisitasConError,
  selectVisitasEntregadas,
} from '../../store/selector/visita.selector';
import {
  removerVisitas,
  limpiarSeleccionVisitas,
} from '../../store/slice/visita.slice';
import { VisitaResponse } from '../../interfaces/visita.interface';
import { MainStackParamList } from '../../../../navigation/types';
import { LIST_OPTIMIZATION_CONFIG } from '../../constants/visita.constant';
import { FilterType } from '../../components/filter-badges/filter-badges.component';
import { useRetryVisitas } from '../../hooks/use-retry-visitas.hook';
import { resetSettings } from '../../../settings';

/**
 * ViewModel para la pantalla de Visitas
 * Maneja toda la lógica de negocio y estado de la pantalla
 */
type NavigationProp = NativeStackNavigationProp<MainStackParamList>;

export const useVisitasViewModel = () => {
  const dispatch = useAppDispatch();
  const { reintentarVisitasConError, isRetryLoading } = useRetryVisitas();
  const navigation = useNavigation<NavigationProp>();

  // Estados del store
  const visitas = useAppSelector(selectVisitas);
  const isLoading = useAppSelector(selectIsLoading);
  const isSuccess = useAppSelector(selectIsSucceeded);
  const totalSeleccionadas = useAppSelector(selectTotalVisitasSeleccionadas);
  const visitasSeleccionadas = useAppSelector(selectVisitasSeleccionadas);
  const visitasSeleccionadasConDatosGuardados = useAppSelector(
    selectVisitasSeleccionadasConDatosGuardados,
  );
  const visitasPendientes = useAppSelector(selectVisitasPendientes);
  const visitasConError = useAppSelector(selectVisitasConError);
  const visitasEntregadas = useAppSelector(selectVisitasEntregadas);

  // Estados locales
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterType>('pending');
  const [searchValue, setSearchValue] = useState('');

  // Referencias
  const bottomSheetRef = useRef<BottomSheet>(null);
  const optionsBottomSheetRef = useRef<BottomSheet>(null);
  const confirmacionBottomSheetRef = useRef<BottomSheet>(null);

  const retirarOrden = () => {
    dispatch(removerVisitas());
    dispatch(limpiarSeleccionVisitas());
  };

  // === ACCIONES DE BOTTOM SHEET ===
  const openDevModeSheet = useCallback(() => {
    bottomSheetRef.current?.expand();
  }, []);

  const closeDevModeSheet = useCallback(() => {
    bottomSheetRef.current?.close();
  }, []);

  const openOptionsSheet = useCallback(() => {
    optionsBottomSheetRef.current?.expand();
  }, []);

  const closeOptionsSheet = useCallback(() => {
    optionsBottomSheetRef.current?.close();
  }, []);

  const openConfirmacionSheet = useCallback(() => {
    confirmacionBottomSheetRef.current?.expand();
  }, []);

  const closeConfirmacionSheet = useCallback(() => {
    confirmacionBottomSheetRef.current?.close();
  }, []);

  // === ACCIONES DE DESVINCULACIÓN ===
  const handleDesvincular = useCallback(() => {
    // Cerrar el sheet de opciones y abrir el de confirmación
    optionsBottomSheetRef.current?.close();
    setTimeout(() => {
      openConfirmacionSheet();
    }, 300); // Delay para que se cierre suavemente el anterior
  }, [openConfirmacionSheet]);

  const confirmarDesvinculacion = useCallback(() => {
    // Limpiar todas las visitas y selecciones
    dispatch(removerVisitas());
    dispatch(limpiarSeleccionVisitas());
    dispatch(resetSettings());

    // Resetear filtro a pending
    setActiveFilter('pending');

    // Cerrar el sheet de confirmación
    closeConfirmacionSheet();
  }, [dispatch, closeConfirmacionSheet]);

  const cancelarDesvinculacion = useCallback(() => {
    closeConfirmacionSheet();
  }, [closeConfirmacionSheet]);

  // === ACCIONES DE SELECCIÓN ===
  const clearSelection = useCallback(() => {
    dispatch(limpiarSeleccionVisitas());
  }, [dispatch]);

  const deliverSelectedVisitas = useCallback(() => {
    if (visitasSeleccionadas.length === 0) {
      console.warn('No hay visitas seleccionadas para entregar');
      return;
    }

    navigation.navigate('EntregaForm', {
      visitasSeleccionadas: visitasSeleccionadas.map(id => id.toString()),
    });
  }, [navigation, visitasSeleccionadas]);

  const retrySelectedVisitas = useCallback(() => {
    if (visitasSeleccionadasConDatosGuardados.length === 0) {
      console.warn(
        'No hay visitas con error y datos guardados para reintentar',
      );
      return;
    }

    const visitasConErrorIds = visitasSeleccionadasConDatosGuardados.map(
      visita => visita.id,
    );
    reintentarVisitasConError(visitasConErrorIds);
  }, [visitasSeleccionadasConDatosGuardados, reintentarVisitasConError]);

  // === ACCIONES DE LISTA ===
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // TODO: Implementar lógica de recarga de datos
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  // === OPTIMIZACIONES DE FLATLIST ===
  // getItemLayout removed since cards now have dynamic height
  // const getItemLayout = useCallback(
  //   (data: ArrayLike<VisitaResponse> | null | undefined, index: number) => ({
  //     length: LIST_OPTIMIZATION_CONFIG.ITEM_HEIGHT,
  //     offset: LIST_OPTIMIZATION_CONFIG.ITEM_HEIGHT * index,
  //     index,
  //   }),
  //   [],
  // );

  const keyExtractor = useCallback(
    (item: VisitaResponse) => `visita-${item.id}`,
    [],
  );

  // === ACCIONES DE FILTRO ===
  const handleFilterChange = useCallback(
    (filter: FilterType) => {
      dispatch(limpiarSeleccionVisitas());
      setActiveFilter(filter);
    },
    [dispatch],
  );

  // === ACCIONES DE BÚSQUEDA ===
  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchValue(value);
      dispatch(limpiarSeleccionVisitas());
    },
    [dispatch],
  );

  const clearFilters = useCallback(() => {
    setSearchValue('');
    setActiveFilter('pending');
    dispatch(limpiarSeleccionVisitas());
  }, [dispatch]);

  // === ESTADOS COMPUTADOS ===
  const visitasFiltradas = useMemo(() => {
    // Primero filtrar por categoría
    let filteredByCategory: VisitaResponse[];
    switch (activeFilter) {
      case 'pending':
        filteredByCategory = visitasPendientes;
        break;
      case 'error':
        filteredByCategory = visitasConError;
        break;
      default:
        filteredByCategory = visitasPendientes;
    }

    // Luego aplicar búsqueda por número si hay texto de búsqueda
    if (searchValue.trim()) {
      const searchQuery = searchValue.toLowerCase().trim();
      return filteredByCategory.filter(visita =>
        visita.numero.toString().includes(searchQuery) || visita.documento.includes(searchQuery),
      );
    }

    return filteredByCategory;
  }, [activeFilter, visitasPendientes, visitasConError, searchValue]);

  const hasVisitas = useMemo(() => visitas.length > 0, [visitas.length]);
  const hasSelectedVisitas = useMemo(
    () => totalSeleccionadas > 0,
    [totalSeleccionadas],
  );

  // Usar el selector para obtener el conteo de visitas con error seleccionadas
  const totalConErrorSeleccionadas =
    visitasSeleccionadasConDatosGuardados.length;

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
    isRetryLoading,

    // Filter states
    activeFilter,
    pendingCount: visitasPendientes.length,
    errorCount: visitasConError.length,
    deliveredCount: visitasEntregadas.length,
    totalCount: visitas.length,

    // Search states
    searchValue,
    onSearchChange: handleSearchChange,
    onClearFilters: clearFilters,

    // Referencias
    bottomSheetRef,
    optionsBottomSheetRef,
    confirmacionBottomSheetRef,

    // Acciones de Bottom Sheet
    openDevModeSheet,
    closeDevModeSheet,
    openOptionsSheet,
    closeOptionsSheet,
    openConfirmacionSheet,
    closeConfirmacionSheet,

    // Acciones de Desvinculación
    handleDesvincular,
    confirmarDesvinculacion,
    cancelarDesvinculacion,

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
    keyExtractor,

    // Configuración
    listConfig: LIST_OPTIMIZATION_CONFIG,
  };
};

export type VisitasViewModel = ReturnType<typeof useVisitasViewModel>;
