import { useCallback, useMemo, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAppSelector, useAppDispatch } from '../../../../store/hooks';
import {
  selectNovedades,
  selectNovedadesConVisitas,
  selectNovedadesSeleccionadas,
  selectTotalNovedadesSeleccionadas,
  selectNovedadesConEstadosError,
} from '../../store/selector/novedad.selector';
import { limpiarSeleccionNovedades } from '../../store/slice/novedad.slice';
import { Novedad } from '../../interfaces/novedad.interface';
import { MainStackParamList } from '../../../../navigation/types';
import { useRetryNovedades } from '../../hooks/use-retry-novedades.hook';
import { useRetrySoluciones } from '../../hooks/use-retry-soluciones.hook';

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
  const { reintentarNovedadesConError, isRetryLoading } = useRetryNovedades();
  const {
    reintentarSolucionesConError,
    isRetryLoading: isRetrySolucionesLoading,
  } = useRetrySoluciones();

  // === ESTADO LOCAL ===
  const [refreshing, setRefreshing] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [activeFilter, setActiveFilter] = useState<NovedadFilterType>('all');

  // === SELECTORES DE REDUX ===
  const novedades = useAppSelector(selectNovedades);
  const novedadesConVisitas = useAppSelector(selectNovedadesConVisitas);
  const novedadesSeleccionadas = useAppSelector(selectNovedadesSeleccionadas);
  const totalSeleccionadas = useAppSelector(selectTotalNovedadesSeleccionadas);
  const novedadesConError = useAppSelector(selectNovedadesConEstadosError);

  // === ESTADO COMPUTADO ===
  const hasNovedades = novedades.length > 0;
  const totalCount = novedades.length;
  const errorCount = novedadesConError.length;

  // === FILTRADO Y BÚSQUEDA ===
  const novedadesFiltradas = useMemo(() => {
    // Primero filtrar por categoría usando datos combinados
    let filteredByCategory = novedadesConVisitas.filter(item => {
      switch (activeFilter) {
        case 'error':
          return (
            item.novedad.estado === 'error' ||
            item.novedad.estado_solucion === 'error'
          );
        case 'all':
        default:
          return true;
      }
    });

    console.log('Novedades filtradas', filteredByCategory);

    // Luego filtrar por búsqueda
    if (!searchValue.trim()) {
      return filteredByCategory.map(item => item.novedad);
    }

    const searchQuery = searchValue.toLowerCase();
    const filtered = filteredByCategory.filter(item => {
      const { novedad, visita } = item;

      // Buscar en datos de la novedad
      const matchesNovedad = novedad.visita_id.toString().includes(searchQuery);

      // Buscar en datos de la visita si existe
      const matchesVisita = visita
        ? visita.numero.toString().toLowerCase().includes(searchQuery) ||
          visita.documento.toLowerCase().includes(searchQuery)
        : false;

      return matchesNovedad || matchesVisita;
    });

    return filtered.map(item => item.novedad);
  }, [novedadesConVisitas, activeFilter, searchValue]);

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
    if (novedadesSeleccionadas.length > 0) {
      await reintentarNovedadesConError(novedadesSeleccionadas);
      await reintentarSolucionesConError(novedadesSeleccionadas);
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

    // Estado
    refreshing,
    isLoading: false, // Por ahora no hay loading async
    isRetryLoading: isRetryLoading || isRetrySolucionesLoading,
    hasNovedades,
    activeFilter,
    errorCount,
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

    // Floating Actions
    onClearSelection,
    onSolucionarNovedades,
    onRetryNovedades,
  };
};
