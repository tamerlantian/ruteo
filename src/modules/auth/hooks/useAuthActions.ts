import { useQueryClient } from '@tanstack/react-query';
import { useAppDispatch } from '../../../store/hooks';
import { clearSettingsThunk, resetSettings } from '../../settings';
import { removerVisitas, limpiarSeleccionVisitas } from '../../visita/store/slice/visita.slice';
import { limpiarNovedades, limpiarSeleccionNovedades } from '../../novedad/store/slice/novedad.slice';
import { persistor } from '../../../store';

/**
 * Hook para manejar acciones relacionadas con autenticación
 * que requieren integración con Redux
 */
export const useAuthActions = () => {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  const clearAppData = async () => {
    try {
      // 1. Limpiar settings del storage y Redux
      await dispatch(clearSettingsThunk());
      dispatch(resetSettings());
      
      // 2. Limpiar datos de visitas
      dispatch(removerVisitas());
      dispatch(limpiarSeleccionVisitas());
      
      // 3. Limpiar datos de novedades
      dispatch(limpiarNovedades());
      dispatch(limpiarSeleccionNovedades());
      
      // 4. Limpiar React Query cache
      queryClient.clear();
      
      // 5. Purgar Redux Persist
      await persistor.purge();
      
      return true;
    } catch (error) {
      console.error('Error clearing app data:', error);
      return false;
    }
  };

  return {
    clearAppData,
  };
};
