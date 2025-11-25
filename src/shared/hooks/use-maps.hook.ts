import { useCallback } from 'react';
import { mapsService, MapCoordinates } from '../services/maps.service';
import Toast from 'react-native-toast-message';
import { toastTextOneStyle } from '../styles/global.style';

export interface UseMapsReturn {
  openLocationInMaps: (coordinates: MapCoordinates) => Promise<void>;
  openInGoogleMaps: (coordinates: MapCoordinates) => Promise<void>;
  openInWaze: (coordinates: MapCoordinates) => Promise<void>;
}

/**
 * Hook para manejar la apertura de ubicaciones en aplicaciones de mapas
 */
export const useMaps = (): UseMapsReturn => {
  
  const openLocationInMaps = useCallback(async (coordinates: MapCoordinates) => {
    try {
      // Validar coordenadas
      if (!mapsService.validateCoordinates(coordinates)) {
        Toast.show({
          type: 'error',
          text1: 'Coordenadas inválidas',
          text2: 'No se puede abrir la ubicación',
          text1Style: toastTextOneStyle,
        });
        return;
      }

      // Mostrar selector de aplicaciones
      await mapsService.showMapAppSelector(coordinates);
    } catch (error) {
      console.error('Error opening location in maps:', error);
      Toast.show({
        type: 'error',
        text1: 'Error al abrir mapas',
        text2: 'No se pudo abrir la aplicación de mapas',
        text1Style: toastTextOneStyle,
      });
    }
  }, []);

  const openInGoogleMaps = useCallback(async (coordinates: MapCoordinates) => {
    try {
      if (!mapsService.validateCoordinates(coordinates)) {
        Toast.show({
          type: 'error',
          text1: 'Coordenadas inválidas',
          text2: 'No se puede abrir la ubicación',
          text1Style: toastTextOneStyle,
        });
        return;
      }

      const success = await mapsService.openInMapApp('google', coordinates);
      if (!success) {
        Toast.show({
          type: 'error',
          text1: 'Error al abrir Google Maps',
          text2: 'Verifica que Google Maps esté instalado',
          text1Style: toastTextOneStyle,
        });
      }
    } catch (error) {
      console.error('Error opening Google Maps:', error);
      Toast.show({
        type: 'error',
        text1: 'Error al abrir Google Maps',
        text2: 'No se pudo abrir la aplicación',
        text1Style: toastTextOneStyle,
      });
    }
  }, []);

  const openInWaze = useCallback(async (coordinates: MapCoordinates) => {
    try {
      if (!mapsService.validateCoordinates(coordinates)) {
        Toast.show({
          type: 'error',
          text1: 'Coordenadas inválidas',
          text2: 'No se puede abrir la ubicación',
          text1Style: toastTextOneStyle,
        });
        return;
      }

      const success = await mapsService.openInMapApp('waze', coordinates);
      if (!success) {
        Toast.show({
          type: 'error',
          text1: 'Error al abrir Waze',
          text2: 'Verifica que Waze esté instalado',
          text1Style: toastTextOneStyle,
        });
      }
    } catch (error) {
      console.error('Error opening Waze:', error);
      Toast.show({
        type: 'error',
        text1: 'Error al abrir Waze',
        text2: 'No se pudo abrir la aplicación',
        text1Style: toastTextOneStyle,
      });
    }
  }, []);

  return {
    openLocationInMaps,
    openInGoogleMaps,
    openInWaze,
  };
};
