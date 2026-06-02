import { useCallback, useState, useRef, useMemo } from 'react';
import { Keyboard } from 'react-native';
import BottomSheet from '@gorhom/bottom-sheet';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
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
  selectVisitasConNovedades,
  selectVisitasSeleccionadasNoRetryables,
  selectHayVisitasSeleccionadasNoRetryables,
  selectVisitasConErrorRetryables,
  selectVisitasConErrorNoRetryables,
} from '../../store/selector/visita.selector';
import {
  removerVisitas,
  limpiarSeleccionVisitas,
  seleccionarMultiplesVisitas,
  anularVisitasNoRetryables,
  reordenarVisitasPendientes,
} from '../../store/slice/visita.slice';
import { VisitaResponse } from '../../interfaces/visita.interface';
import { MainStackParamList } from '../../../../navigation/types';
import { LIST_OPTIMIZATION_CONFIG } from '../../constants/visita.constant';
import { FilterType } from '../../components/filter-badges/filter-badges.component';
import { useRetryVisitas } from '../../hooks/use-retry-visitas.hook';
import { resetSettings, selectOrdenEntrega } from '../../../settings';
import {
  limpiarNovedades,
  limpiarSeleccionNovedades,
} from '../../../novedad/store/slice/novedad.slice';
import { backgroundGeolocationService } from '../../../../shared/services';

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
  const ordenEntrega = useAppSelector(selectOrdenEntrega);
  const visitasConError = useAppSelector(selectVisitasConError);
  const visitasConNovedades = useAppSelector(selectVisitasConNovedades);
  const visitasSeleccionadasConDatosGuardados = useAppSelector(
    selectVisitasSeleccionadasConDatosGuardados,
  );
  const visitasPendientes = useAppSelector(selectVisitasPendientes);
  const visitasEntregadas = useAppSelector(selectVisitasEntregadas);
  const visitasSeleccionadasNoRetryables = useAppSelector(selectVisitasSeleccionadasNoRetryables);
  const hayVisitasSeleccionadasNoRetryables = useAppSelector(selectHayVisitasSeleccionadasNoRetryables);
  
  // Nuevos selectores para separar errores retryables de no-retryables
  const visitasConErrorRetryables = useAppSelector(selectVisitasConErrorRetryables);
  const visitasConErrorNoRetryables = useAppSelector(selectVisitasConErrorNoRetryables);

  // Estados locales
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterType>('pending');
  const [searchValue, setSearchValue] = useState('');
  const [shouldClearSearchOnFocus, setShouldClearSearchOnFocus] =
    useState(false);

  // Referencias
  const bottomSheetRef = useRef<BottomSheet>(null);
  const optionsBottomSheetRef = useRef<BottomSheet>(null);
  const confirmacionBottomSheetRef = useRef<BottomSheet>(null);
  const cambiarOrdenSheetRef = useRef<BottomSheet>(null);

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

  const handleCargarOrdenDismiss = useCallback(() => {
    // Cerrar teclado cuando se cierra el bottom sheet de cargar orden
    Keyboard.dismiss();
  }, []);

  const openOptionsSheet = useCallback(() => {
    optionsBottomSheetRef.current?.expand();
  }, []);

  const closeOptionsSheet = useCallback(() => {
    optionsBottomSheetRef.current?.close();
  }, []);

  const openCambiarOrdenSheet = useCallback(() => {
    cambiarOrdenSheetRef.current?.expand();
  }, []);

  const closeCambiarOrdenSheet = useCallback(() => {
    cambiarOrdenSheetRef.current?.close();
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

  const confirmarDesvinculacion = useCallback(async () => {
    try {
      // 1. Detener background geolocation tracking
      console.log('📍 Deteniendo background geolocation por desvinculación...');
      await backgroundGeolocationService.cleanup();
      console.log('📍 Background geolocation detenido correctamente');
    } catch (geoError) {
      console.warn('Error deteniendo background geolocation:', geoError);
      // No bloquear la desvinculación si falla la limpieza del geolocation
    }

    // 2. Limpiar todas las visitas y selecciones
    dispatch(removerVisitas());
    dispatch(limpiarNovedades());
    dispatch(limpiarSeleccionVisitas());
    dispatch(limpiarSeleccionNovedades());
    dispatch(resetSettings());

    // 3. Resetear filtro a pending
    setActiveFilter('pending');

    // 4. Cerrar el sheet de confirmación
    closeConfirmacionSheet();
  }, [dispatch, closeConfirmacionSheet]);

  const cancelarDesvinculacion = useCallback(() => {
    closeConfirmacionSheet();
  }, [closeConfirmacionSheet]);

  // === ACCIONES DE SELECCIÓN ===
  const clearSelection = useCallback(() => {
    dispatch(limpiarSeleccionVisitas());
  }, [dispatch]);

  const selectAllErrors = useCallback(() => {
    // El filtro "Sincronizar" muestra solo retryables; "Seleccionar todos"
    // debe seleccionar exactamente esos, no `visitasConError` (que incluye
    // no-retryables que viven en el filtro "Errores").
    if (activeFilter === 'error' && visitasConErrorRetryables.length > 0) {
      const errorIds = visitasConErrorRetryables.map(visita => visita.id);
      dispatch(seleccionarMultiplesVisitas(errorIds));
    }
  }, [dispatch, activeFilter, visitasConErrorRetryables]);

  const deliverSelectedVisitas = useCallback(() => {
    if (visitasSeleccionadas.length === 0) {
      console.warn('No hay visitas seleccionadas para entregar');
      return;
    }

    // Activar flag para limpiar search al regresar
    setShouldClearSearchOnFocus(true);

    navigation.navigate('EntregaForm', {
      visitasSeleccionadas: visitasSeleccionadas.map(id => id.toString()),
    });
  }, [navigation, visitasSeleccionadas]);

  const reportNovedadSelectedVisitas = useCallback(() => {
    if (visitasSeleccionadas.length === 0) {
      console.warn('No hay visitas seleccionadas para reportar novedad');
      return;
    }

    // Activar flag para limpiar search al regresar
    setShouldClearSearchOnFocus(true);

    navigation.navigate('NovedadForm', {
      visitasSeleccionadas: visitasSeleccionadas.map(id => id.toString()),
    });
  }, [navigation, visitasSeleccionadas]);

  const retrySelectedVisitas = useCallback(async () => {
    if (visitasSeleccionadasConDatosGuardados.length === 0) {
      console.warn(
        'No hay visitas con error y datos guardados para reintentar',
      );
      return;
    }

    const visitasConErrorIds = visitasSeleccionadasConDatosGuardados.map(
      visita => visita.id,
    );

    try {
      await reintentarVisitasConError(visitasConErrorIds);
    } catch (error) {
      console.error('Error al reintentar visitas:', error);
    }
  }, [visitasSeleccionadasConDatosGuardados, reintentarVisitasConError]);

  // Sincroniza TODAS las entregas pendientes de envío (retryables con datos
  // guardados) sin que el conductor tenga que seleccionarlas una por una.
  // Lo usa el banner de "pendientes por sincronizar" y el auto-sync.
  const sincronizarTodo = useCallback(async () => {
    const ids = visitasConErrorRetryables
      .filter(visita => !!visita.datos_formulario_guardados)
      .map(visita => visita.id);
    if (ids.length === 0) {
      return;
    }
    try {
      await reintentarVisitasConError(ids);
    } catch (error) {
      console.error('Error al sincronizar todo:', error);
    }
  }, [visitasConErrorRetryables, reintentarVisitasConError]);

  const anularSelectedVisitas = useCallback(() => {
    if (visitasSeleccionadasNoRetryables.length === 0) {
      console.warn('No hay visitas no-retryables seleccionadas para anular');
      return;
    }

    const visitaIds = visitasSeleccionadasNoRetryables.map(visita => visita.id);

    // Dispatch de la acción para resetear las visitas a estado pending
    dispatch(anularVisitasNoRetryables(visitaIds));

    // Mostrar toast de confirmación
    Toast.show({
      type: 'success',
      text1: 'Visitas anuladas',
      text2: `Se anularon ${visitaIds.length} visita(s) y volvieron a pendientes`,
    });
  }, [visitasSeleccionadasNoRetryables, dispatch]);

  // === ACCIONES DE LISTA ===
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // TODO: Implementar lógica de recarga de datos
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const keyExtractor = useCallback(
    (item: VisitaResponse) => `visita-${item.id}`,
    [],
  );

  // === ACCIONES DE REORDENAMIENTO (drag & drop) ===
  // Recibe la nueva secuencia de visitas pendientes (tal como las entrega
  // DraggableFlatList en onDragEnd) y persiste el orden manual del conductor.
  const reordenarPendientes = useCallback(
    (visitasOrdenadas: VisitaResponse[]) => {
      dispatch(
        reordenarVisitasPendientes(visitasOrdenadas.map(visita => visita.id)),
      );
    },
    [dispatch],
  );

  // El drag solo tiene sentido en el filtro "Pendientes" y sin busqueda activa
  // (con busqueda la lista es un subset y reordenar corromperia el orden global).
  const canReorder = activeFilter === 'pending' && !searchValue.trim();

  // === ACCIONES DE FILTRO ===
  const handleFilterChange = useCallback(
    (filter: FilterType) => {
      dispatch(limpiarSeleccionVisitas());
      setActiveFilter(filter);
    },
    [dispatch],
  );

  // === ACCIONES DE BÚSQUEDA ===
  const handleSearchChange = useCallback((value: string) => {
    setSearchValue(value);
  }, []);

  const handleScanResult = useCallback((result: any) => {
    // Actualizar el valor de búsqueda con el código escaneado
    setSearchValue(result.value);
  }, []);

  const clearFilters = useCallback(() => {
    setSearchValue('');
    setActiveFilter('pending');
  }, []);

  // === ESTADOS COMPUTADOS ===
  const visitasFiltradas = useMemo(() => {
    // Primero filtrar por categoría
    let filteredByCategory: VisitaResponse[];
    switch (activeFilter) {
      case 'pending':
        filteredByCategory = visitasPendientes;
        break;
      case 'error':
        // Filtro "Sincronizar" - solo errores retryables
        filteredByCategory = visitasConErrorRetryables;
        break;
      case 'errores':
        // Nuevo filtro "Errores" - solo errores no-retryables
        filteredByCategory = visitasConErrorNoRetryables;
        break;
      case 'novedades':
        filteredByCategory = visitasConNovedades;
        break;
      case 'entregadas':
        filteredByCategory = visitasEntregadas;
        break;
      default:
        filteredByCategory = visitasPendientes;
    }

    // Luego aplicar búsqueda por número si hay texto de búsqueda
    if (searchValue.trim()) {
      const searchQuery = searchValue.toLowerCase().trim();
      return filteredByCategory.filter(visita => {
        const numeroMatch = visita.numero
          ? visita.numero.toString().toLowerCase().includes(searchQuery)
          : false;
        const documentoMatch = visita.documento
          ? visita.documento.toLowerCase().includes(searchQuery)
          : false;

        return numeroMatch || documentoMatch;
      });
    }

    return filteredByCategory;
  }, [
    activeFilter,
    visitasPendientes,
    visitasConErrorRetryables,
    visitasConErrorNoRetryables,
    visitasConNovedades,
    searchValue,
  ]);

  const hasVisitas = useMemo(() => visitas.length > 0, [visitas.length]);
  const hasOrdenCargada = useMemo(() => !!ordenEntrega, [ordenEntrega]);
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

  // Limpiar search cuando la pantalla recibe el foco (al volver de otras pantallas)
  useFocusEffect(
    useCallback(() => {
      // Solo limpiar si el flag está activado y hay texto de búsqueda
      if (shouldClearSearchOnFocus && searchValue.trim()) {
        setSearchValue('');
        setShouldClearSearchOnFocus(false); // Resetear el flag
      }
    }, [shouldClearSearchOnFocus, searchValue]),
  );

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
    hasOrdenCargada,
    hasSelectedVisitas,
    isRetryLoading,

    // Filter states
    activeFilter,
    pendingCount: visitasPendientes.length,
    errorCount: visitasConErrorRetryables.length,
    erroresCount: visitasConErrorNoRetryables.length,
    novedadesCount: visitasConNovedades.length,
    deliveredCount: visitasEntregadas.length,
    totalCount: visitas.length,

    // Search states
    searchValue,
    onSearchChange: handleSearchChange,
    onScanResult: handleScanResult,
    onClearFilters: clearFilters,

    // Referencias
    bottomSheetRef,
    optionsBottomSheetRef,
    confirmacionBottomSheetRef,
    cambiarOrdenSheetRef,

    // Estado de orden cargada
    ordenEntrega,

    // Acciones de Bottom Sheet
    openDevModeSheet,
    closeDevModeSheet,
    openOptionsSheet,
    closeOptionsSheet,
    openConfirmacionSheet,
    closeConfirmacionSheet,
    openCambiarOrdenSheet,
    closeCambiarOrdenSheet,
    handleCargarOrdenDismiss,

    // Acciones de Desvinculación
    handleDesvincular,
    confirmarDesvinculacion,
    cancelarDesvinculacion,

    retirarOrden,

    // Acciones de Selección
    clearSelection,
    selectAllErrors,
    deliverSelectedVisitas,
    retrySelectedVisitas,
    reportNovedadSelectedVisitas,
    anularSelectedVisitas,
    sincronizarTodo,

    // Estados de visitas no-retryables
    hasNonRetryableSelected: hayVisitasSeleccionadasNoRetryables,
    totalNonRetryableSelected: visitasSeleccionadasNoRetryables.length,

    // Acciones de Lista
    onRefresh,

    // Acciones de Filtro
    onFilterChange: handleFilterChange,

    // Reordenamiento (drag & drop)
    reordenarPendientes,
    canReorder,

    // Optimizaciones de FlatList
    keyExtractor,

    // Configuración
    listConfig: LIST_OPTIMIZATION_CONFIG,
  };
};

export type VisitasViewModel = ReturnType<typeof useVisitasViewModel>;

