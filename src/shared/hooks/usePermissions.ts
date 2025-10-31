import { useEffect, useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { PermissionsService } from '../services/permissions.service';

/**
 * Hook personalizado para manejar permisos de la aplicación
 * Solicita permisos automáticamente al montar el componente
 */
export const usePermissions = () => {
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const [permissionsChecked, setPermissionsChecked] = useState(false);
  const [isRequestingPermissions, setIsRequestingPermissions] = useState(false);

  // Verificar permisos existentes
  const checkPermissions = useCallback(async () => {
    try {
      const hasStoragePermission = await PermissionsService.checkStoragePermission();
      setPermissionsGranted(hasStoragePermission);
      setPermissionsChecked(true);
      return hasStoragePermission;
    } catch (error) {
      console.warn('Error checking permissions:', error);
      setPermissionsGranted(false);
      setPermissionsChecked(true);
      return false;
    }
  }, []);

  // Solicitar permisos
  const requestPermissions = useCallback(async () => {
    if (isRequestingPermissions) return false;

    setIsRequestingPermissions(true);
    
    try {
      const result = await PermissionsService.requestStoragePermission();
      
      if (result.granted) {
        setPermissionsGranted(true);
        return true;
      } else {
        // Mostrar diálogo explicativo si los permisos fueron denegados
        PermissionsService.showPermissionRationale(
          () => {
            // Reintentar solicitud de permisos
            setTimeout(() => requestPermissions(), 500);
          },
          () => {
            // Usuario canceló, mostrar advertencia
            Alert.alert(
              'Permisos Requeridos',
              'Algunas funcionalidades como guardar firmas digitales no estarán disponibles sin estos permisos.',
              [{ text: 'Entendido' }]
            );
          }
        );
        return false;
      }
    } catch (error) {
      console.error('Error requesting permissions:', error);
      Alert.alert(
        'Error',
        'Hubo un problema al solicitar los permisos. Algunas funcionalidades pueden no estar disponibles.',
        [{ text: 'OK' }]
      );
      return false;
    } finally {
      setIsRequestingPermissions(false);
    }
  }, [isRequestingPermissions]);

  // Inicializar permisos automáticamente
  const initializePermissions = useCallback(async () => {
    // Primero verificar si ya tenemos permisos
    const hasPermissions = await checkPermissions();
    
    if (!hasPermissions) {
      // Si no tenemos permisos, solicitarlos después de un pequeño delay
      // para que la UI se haya cargado completamente
      setTimeout(() => {
        requestPermissions();
      }, 1000);
    }
  }, [checkPermissions, requestPermissions]);

  // Ejecutar al montar el componente
  useEffect(() => {
    initializePermissions();
  }, [initializePermissions]);

  return {
    permissionsGranted,
    permissionsChecked,
    isRequestingPermissions,
    checkPermissions,
    requestPermissions,
    initializePermissions,
  };
};

export type PermissionsHook = ReturnType<typeof usePermissions>;
