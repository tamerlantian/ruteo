import { updateApiBaseUrl } from '../../config/environment';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAppDispatch } from '../../store/hooks';
import {
  removerVisitas,
  limpiarSeleccionVisitas,
  descartarSnapshotsVisitasExcepto,
} from '../../modules/visita/store/slice/visita.slice';
import {
  limpiarNovedades,
  limpiarSeleccionNovedades,
  descartarSnapshotsNovedadesExcepto,
} from '../../modules/novedad/store/slice/novedad.slice';
import { resetSettings } from '../../modules/settings';
import { backgroundGeolocationService } from '../services';

// URLs de los endpoints
export const ENDPOINTS = {
  PRODUCTION: 'https://ruteoapi.co/',
  DEVELOPMENT: 'http://ruteoapi.online/',
};

const DEV_MODE_STORAGE_KEY = '@dev_mode_enabled';

interface DevModeContextType {
  isDeveloperMode: boolean;
  toggleDeveloperMode: () => Promise<void>;
  currentEndpoint: string;
  isLoading: boolean;
}

const DevModeContext = createContext<DevModeContextType | undefined>(undefined);

export const DevModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useAppDispatch();
  const [isDeveloperMode, setIsDeveloperMode] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  /**
   * Limpia TODO el estado de sesión/orden al cambiar de entorno. Los datos de
   * pruebas y producción son mundos distintos (otra base, otros despachos,
   * otros tokens): si no se limpia, la orden del entorno anterior queda pegada
   * (persistida en redux-persist) y reaparece tras cambiar de ambiente.
   */
  const limpiarSesionEntorno = () => {
    dispatch(removerVisitas());
    dispatch(limpiarSeleccionVisitas());
    dispatch(descartarSnapshotsVisitasExcepto([]));
    dispatch(limpiarNovedades());
    dispatch(limpiarSeleccionNovedades());
    dispatch(descartarSnapshotsNovedadesExcepto([]));
    dispatch(resetSettings());
    backgroundGeolocationService.cleanup().catch(() => {});
  };

  // Carga el estado guardado al iniciar la aplicación
  useEffect(() => {
    const loadDevModeState = async () => {
      try {
        const savedMode = await AsyncStorage.getItem(DEV_MODE_STORAGE_KEY);
        const devMode = savedMode !== null ? JSON.parse(savedMode) : false;

        setIsDeveloperMode(devMode);
        // Asegurar que la configuración se actualice inmediatamente
        updateApiBaseUrl(devMode);
      } catch (error) {
        console.error('Error loading developer mode state:', error);
        // En caso de error, usar valores por defecto
        setIsDeveloperMode(false);
        updateApiBaseUrl(false);
      } finally {
        setIsLoading(false); // ← Marcar como cargado
      }
    };

    loadDevModeState();
  }, []);

  // Alterna entre modo desarrollador y normal
  const toggleDeveloperMode = async () => {
    try {
      const newMode = !isDeveloperMode;
      await AsyncStorage.setItem(DEV_MODE_STORAGE_KEY, JSON.stringify(newMode));
      setIsDeveloperMode(newMode);
      // Actualizar inmediatamente la configuración
      updateApiBaseUrl(newMode);
      // Cambió el entorno: descartar la orden/sesión del ambiente anterior.
      limpiarSesionEntorno();
    } catch (error) {
      console.error('Error saving developer mode state:', error);
    }
  };

  // URL del endpoint actual basado en el modo seleccionado
  const currentEndpoint = isDeveloperMode ? ENDPOINTS.DEVELOPMENT : ENDPOINTS.PRODUCTION;

  return (
    <DevModeContext.Provider
      value={{ isDeveloperMode, toggleDeveloperMode, currentEndpoint, isLoading }}
    >
      {children}
    </DevModeContext.Provider>
  );
};

// Hook personalizado para usar el contexto
export const useDevMode = (): DevModeContextType => {
  const context = useContext(DevModeContext);
  if (context === undefined) {
    throw new Error('useDevMode must be used within a DevModeProvider');
  }
  return context;
};
