import { useCallback, useMemo, useState } from 'react';
import { useAppSelector } from '../../../../store/hooks';
import { selectNovedades, selectNovedadesConVisitas } from '../../store/selector/novedad.selector';
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
  const novedadesConVisitas = useAppSelector(selectNovedadesConVisitas);

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
    // Primero filtrar por categoría usando datos combinados
    let filteredByCategory = novedadesConVisitas.filter(item => {
      switch (activeFilter) {
        case 'error':
          return item.novedad.estado_error;
        case 'all':
        default:
          return true;
      }
    });

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
      const matchesVisita = visita ? (
        visita.numero.toString().toLowerCase().includes(searchQuery) ||
        visita.documento.toLowerCase().includes(searchQuery)
      ) : false;
      
      return matchesNovedad || matchesVisita;
    });

    return filtered.map(item => item.novedad);
  }, [novedadesConVisitas, activeFilter, searchValue]);


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
