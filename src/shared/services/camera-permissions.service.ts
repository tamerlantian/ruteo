import { Alert, Linking, Platform } from 'react-native';
import { useCameraPermission } from 'react-native-vision-camera';
import { useCallback } from 'react';

export interface CameraPermissionResult {
  granted: boolean;
  canAskAgain: boolean;
  shouldShowSettings: boolean;
}

/**
 * Utilidades estáticas para manejar permisos de cámara
 */
export class CameraPermissionsService {

  /**
   * Muestra un alert apropiado según el estado de los permisos
   */
  static showPermissionAlert(result: CameraPermissionResult): void {
    if (result.granted) {
      return; // No mostrar nada si los permisos están concedidos
    }

    if (result.shouldShowSettings) {
      // Permisos denegados permanentemente - dirigir a configuración
      Alert.alert(
        'Permisos de Cámara Requeridos',
        'Para usar la cámara, necesitas habilitar los permisos en la configuración de tu dispositivo.',
        [
          {
            text: 'Cancelar',
            style: 'cancel',
          },
          {
            text: 'Ir a Configuración',
            onPress: () => this.openAppSettings(),
          },
        ]
      );
    } else if (result.canAskAgain) {
      // Primera vez que se deniegan - explicar por qué necesitamos permisos
      Alert.alert(
        'Permisos de Cámara',
        'Esta aplicación necesita acceso a la cámara para tomar fotos y escanear códigos QR.',
        [{ text: 'Entendido' }]
      );
    } else {
      // Caso genérico
      Alert.alert(
        'Permisos Denegados',
        'No se puede acceder a la cámara sin los permisos necesarios.',
        [{ text: 'OK' }]
      );
    }
  }

  /**
   * Abre la configuración de la aplicación en el dispositivo
   */
  static openAppSettings(): void {
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:');
    } else {
      Linking.openSettings();
    }
  }
}

/**
 * Hook personalizado que maneja permisos de cámara con mejor UX
 * Detecta si los permisos fueron denegados permanentemente
 */
export const useCameraPermissionsService = () => {
  const { hasPermission, requestPermission } = useCameraPermission();

  const checkAndRequest = useCallback(async (): Promise<boolean> => {
    try {
      // Si ya tenemos permisos, retornar éxito
      if (hasPermission) {
        return true;
      }

      // Intentar solicitar permisos
      const permissionResult = await requestPermission();
      
      if (permissionResult) {
        return true;
      }

      // Si llegamos aquí, los permisos fueron denegados
      // Mostrar alert dirigiendo a configuración
      const result: CameraPermissionResult = {
        granted: false,
        canAskAgain: false,
        shouldShowSettings: true,
      };
      
      CameraPermissionsService.showPermissionAlert(result);
      return false;

    } catch (error) {
      console.error('Error checking camera permissions:', error);
      
      const result: CameraPermissionResult = {
        granted: false,
        canAskAgain: false,
        shouldShowSettings: true,
      };
      
      CameraPermissionsService.showPermissionAlert(result);
      return false;
    }
  }, [hasPermission, requestPermission]);

  const openSettings = useCallback(() => {
    CameraPermissionsService.openAppSettings();
  }, []);

  return {
    hasPermission,
    checkAndRequest,
    openSettings,
  };
};
