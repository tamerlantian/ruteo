import { useQueryClient } from '@tanstack/react-query';
import { useAppDispatch } from '../../../store/hooks';
import { clearSettingsThunk, resetSettings } from '../../settings';
import { removerVisitas, limpiarSeleccionVisitas } from '../../visita/store/slice/visita.slice';
import { limpiarNovedades, limpiarSeleccionNovedades } from '../../novedad/store/slice/novedad.slice';
import { persistor } from '../../../store';
import { backgroundGeolocationService } from '../../../shared/services';

/**
 * Hook para manejar acciones relacionadas con autenticación
 * que requieren integración con Redux
 */
export const useAuthActions = () => {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  const clearAppData = async () => {
    try {
      // 1. Detener y limpiar background geolocation
      try {
        await backgroundGeolocationService.cleanup();
        console.log('📍 Background geolocation limpiado correctamente');
      } catch (geoError) {
        console.warn('Error limpiando background geolocation:', geoError);
        // No bloquear el logout si falla la limpieza del geolocation
      }
      
      // 2. Limpiar settings del storage y Redux
      await dispatch(clearSettingsThunk());
      dispatch(resetSettings());
      
      // 3. Limpiar datos de visitas
      dispatch(removerVisitas());
      dispatch(limpiarSeleccionVisitas());
      
      // 4. Limpiar datos de novedades
      dispatch(limpiarNovedades());
      dispatch(limpiarSeleccionNovedades());
      
      // 5. Limpiar React Query cache
      queryClient.clear();
      
      // 6. Purgar Redux Persist
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
