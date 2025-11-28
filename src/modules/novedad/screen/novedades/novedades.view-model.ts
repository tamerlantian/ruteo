import { useCallback, useMemo, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAppSelector, useAppDispatch } from '../../../../store/hooks';
import { 
  selectNovedades, 
  selectNovedadesSeleccionadas, 
  selectTotalNovedadesSeleccionadas, 
  selectNovedadesConEstadosError, 
  selectNovedadesPendientesPorSolventar,
  selectNovedadesConErrorYVisitas,
  selectNovedadesPendientesYVisitas
} from '../../store/selector/novedad.selector';
import { limpiarSeleccionNovedades } from '../../store/slice/novedad.slice';
import { Novedad } from '../../interfaces/novedad.interface';
import { MainStackParamList } from '../../../../navigation/types';
import { useRetryNovedades } from '../../hooks/use-retry-novedades.hook';
import { useRetrySoluciones } from '../../hooks/use-retry-soluciones.hook';
import { ScanResult } from '../../../../shared/components/scanner';

type NovedadFilterType = 'all' | 'error';

/**
 * ViewModel para la pantalla de Novedades
 * Maneja la lógica de estado y operaciones de la lista de novedades
 */
type NavigationProp = NativeStackNavigationProp<MainStackParamList>;

export const useNovedadesViewModel = () => {
  // === HOOKS ===
  const navigation = useNavigation<NavigationProp>();
  const dispatch = useAppDispatch();
  const [isRetryLoading, setIsRetryLoading] = useState(false);
  const { reintentarNovedadesConError } = useRetryNovedades();
  const { reintentarSolucionesConError } = useRetrySoluciones();

  // === ESTADO LOCAL ===
  const [refreshing, setRefreshing] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [activeFilter, setActiveFilter] = useState<NovedadFilterType>('all');

  // === SELECTORES DE REDUX ===
  const novedades = useAppSelector(selectNovedades);
  const novedadesConErrorYVisitas = useAppSelector(selectNovedadesConErrorYVisitas);
  const novedadesPendientesYVisitas = useAppSelector(selectNovedadesPendientesYVisitas);
  const novedadesSeleccionadas = useAppSelector(selectNovedadesSeleccionadas);
  const totalSeleccionadas = useAppSelector(selectTotalNovedadesSeleccionadas);
  const novedadesConError = useAppSelector(selectNovedadesConEstadosError);
  const novedadesPendientesPorSolventar = useAppSelector(selectNovedadesPendientesPorSolventar);

  // === ESTADO COMPUTADO ===
  const hasNovedades = novedades.length > 0;
  const totalCount = novedades.length;
  const errorCount = novedadesConError.length;
  const allCount = novedadesPendientesPorSolventar.length;

  // === FILTRADO Y BÚSQUEDA ===
  const novedadesConVisitasFiltradas = useMemo(() => {
    // Seleccionar el conjunto de datos correcto según el filtro activo
    let novedadesConVisitas = activeFilter === 'error' 
      ? novedadesConErrorYVisitas 
      : novedadesPendientesYVisitas;

    // Si no hay término de búsqueda, retornar todas las novedades con visitas
    if (!searchValue.trim()) {
      return novedadesConVisitas;
    }

    // Filtrar por búsqueda con acceso completo a datos de visita
    const searchQuery = searchValue.toLowerCase();
    const filtered = novedadesConVisitas.filter(item => {
      const { visita } = item;
      
      // Buscar en ID de visita
      const matchesVisitaId = visita?.numero.toString().toLowerCase().includes(searchQuery);
      
      const matchesDocumento = visita?.documento?.toLowerCase().includes(searchQuery);

      return matchesVisitaId || matchesDocumento;
    });

    return filtered;
  }, [activeFilter, searchValue, novedadesConErrorYVisitas, novedadesPendientesYVisitas]);

  // Mantener compatibilidad con el componente actual
  const novedadesFiltradas = useMemo(() => {
    return novedadesConVisitasFiltradas.map(item => item.novedad);
  }, [novedadesConVisitasFiltradas]);

  // === FUNCIONES DE CALLBACK ===
  const keyExtractor = useCallback((item: Novedad) => `novedad-${item.id}`, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simular refresh - en el futuro podría recargar datos
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const onSearchChange = useCallback((text: string) => {
    setSearchValue(text);
  }, []);

  const onClearFilters = useCallback(() => {
    setSearchValue('');
  }, []);

  const handleScanResult = useCallback((result: ScanResult) => {
    // Usar el valor escaneado como término de búsqueda
    setSearchValue(result.value);
  }, []);

  const onFilterChange = useCallback(
    (filter: NovedadFilterType) => {
      dispatch(limpiarSeleccionNovedades());
      setActiveFilter(filter);
    },
    [dispatch],
  );

  // === FUNCIONES FLOATING ACTIONS ===
  const onClearSelection = useCallback(() => {
    dispatch(limpiarSeleccionNovedades());
  }, [dispatch]);

  const onSolucionarNovedades = useCallback(() => {
    if (novedadesSeleccionadas.length > 0) {
      navigation.navigate('SolucionForm', {
        novedadesSeleccionadas: novedadesSeleccionadas,
      });
    }
  }, [navigation, novedadesSeleccionadas]);

  const onRetryNovedades = useCallback(async () => {
    setIsRetryLoading(true);
    try {
      if (novedadesSeleccionadas.length > 0) {
        await reintentarNovedadesConError(novedadesSeleccionadas);
        await reintentarSolucionesConError(novedadesSeleccionadas);
      }
    } catch (error) {
      console.error('Error al reintentar novedades:', error);
    } finally {
      setIsRetryLoading(false);
    }
  }, [
    novedadesSeleccionadas,
    reintentarNovedadesConError,
    reintentarSolucionesConError,
  ]);

  // === RETORNO DEL VIEWMODEL ===
  return {
    // Datos
    novedades: novedadesFiltradas,
    novedadesConVisitas: novedadesConVisitasFiltradas, // Para uso futuro

    // Estado
    refreshing,
    isLoading: false, // Por ahora no hay loading async
    isRetryLoading,
    hasNovedades,
    activeFilter,
    errorCount,
    allCount,
    totalCount,
    searchValue,
    totalSeleccionadas,

    // Configuración
    listConfig: {
      MAX_TO_RENDER_PER_BATCH: 10,
      INITIAL_NUM_TO_RENDER: 8,
      WINDOW_SIZE: 10,
      UPDATE_CELLS_BATCHING_PERIOD: 50,
    },

    // Funciones
    keyExtractor,
    onRefresh,
    onSearchChange,
    onClearFilters,
    onFilterChange,
    handleScanResult,

    // Floating Actions
    onClearSelection,
    onSolucionarNovedades,
    onRetryNovedades,
  };
};
