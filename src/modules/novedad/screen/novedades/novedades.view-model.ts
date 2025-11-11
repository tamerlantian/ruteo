import { useCallback, useMemo, useState } from 'react';
import { useAppSelector } from '../../../../store/hooks';
import { selectNovedades } from '../../store/selector/novedad.selector';
import { Novedad } from '../../interfaces/novedad.interface';

type NovedadFilterType = 'all' | 'error';

/**
 * ViewModel para la pantalla de Novedades
 * Maneja la lógica de estado y operaciones de la lista de novedades
 */
export const useNovedadesViewModel = () => {
  // === ESTADO LOCAL ===
  const [refreshing, setRefreshing] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [activeFilter, setActiveFilter] = useState<NovedadFilterType>('all');

  // === SELECTORES DE REDUX ===
  const novedades = useAppSelector(selectNovedades);

  // === ESTADO COMPUTADO ===
  const hasNovedades = novedades.length > 0;
  const totalCount = novedades.length;
  
  // Novedades con error
  const novedadesConError = useMemo(() => 
    novedades.filter(novedad => novedad.estado_error), 
    [novedades]
  );
  const errorCount = novedadesConError.length;

  // === FILTRADO Y BÚSQUEDA ===
  const novedadesFiltradas = useMemo(() => {
    // Primero filtrar por categoría
    let filteredByCategory: Novedad[];
    switch (activeFilter) {
      case 'error':
        filteredByCategory = novedadesConError;
        break;
      case 'all':
      default:
        filteredByCategory = novedades;
    }

    // Luego filtrar por búsqueda
    if (!searchValue.trim()) {
      return filteredByCategory;
    }

    const searchQuery = searchValue.toLowerCase();
    return filteredByCategory.filter(novedad =>
      novedad.descripcion.toLowerCase().includes(searchQuery) ||
      novedad.visita_id.toString().includes(searchQuery)
    );
  }, [novedades, novedadesConError, activeFilter, searchValue]);


  // === FUNCIONES DE CALLBACK ===
  const keyExtractor = useCallback(
    (item: Novedad) => `novedad-${item.id}`,
    [],
  );

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

  const onFilterChange = useCallback((filter: NovedadFilterType) => {
    setActiveFilter(filter);
  }, []);

  // === RETORNO DEL VIEWMODEL ===
  return {
    // Datos
    novedades: novedadesFiltradas,
    
    // Estado
    refreshing,
    isLoading: false, // Por ahora no hay loading async
    hasNovedades,
    activeFilter,
    errorCount,
    totalCount,
    searchValue,
    
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
  };
};
