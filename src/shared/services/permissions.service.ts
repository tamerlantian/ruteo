import { Platform, PermissionsAndroid, Alert } from 'react-native';
import { 
  check, 
  request, 
  PERMISSIONS, 
  RESULTS
} from 'react-native-permissions';

export interface PermissionResult {
  granted: boolean;
  message?: string;
}

/**
 * Servicio para manejar permisos de la aplicación
 */
export class PermissionsService {
  
  /**
   * Solicita permisos para guardar firmas (multiplataforma)
   */
  static async requestStoragePermission(): Promise<PermissionResult> {
    if (Platform.OS === 'ios') {
      return this.requestIOSPhotoLibraryPermission();
    } else {
      return this.requestAndroidStoragePermission();
    }
  }

  /**
   * Solicita permisos para escribir en almacenamiento externo (Android)
   */
  private static async requestAndroidStoragePermission(): Promise<PermissionResult> {

    try {
      // Para Android 13+ (API 33+), no necesitamos WRITE_EXTERNAL_STORAGE
      if (typeof Platform.Version === 'number' && Platform.Version >= 33) {
        return { granted: true };
      }

      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        {
          title: 'Permiso de Almacenamiento',
          message: 'La aplicación necesita acceso al almacenamiento para guardar las firmas.',
          buttonNeutral: 'Preguntar después',
          buttonNegative: 'Cancelar',
          buttonPositive: 'Aceptar',
        }
      );

      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        return { granted: true };
      } else {
        return { 
          granted: false, 
          message: 'Permiso de almacenamiento denegado' 
        };
      }
    } catch (error) {
      console.warn('Error requesting storage permission:', error);
      return { 
        granted: false, 
        message: 'Error al solicitar permisos' 
      };
    }
  }

  /**
   * Solicita permisos para acceder a la galería de fotos (iOS)
   */
  private static async requestIOSPhotoLibraryPermission(): Promise<PermissionResult> {
    try {
      // Verificar estado actual del permiso
      const checkResult = await check(PERMISSIONS.IOS.PHOTO_LIBRARY_ADD_ONLY);
      
      if (checkResult === RESULTS.GRANTED) {
        return { granted: true };
      }

      if (checkResult === RESULTS.DENIED) {
        // Solicitar el permiso
        const requestResult = await request(PERMISSIONS.IOS.PHOTO_LIBRARY_ADD_ONLY);
        
        if (requestResult === RESULTS.GRANTED) {
          return { granted: true };
        } else if (requestResult === RESULTS.BLOCKED) {
          return {
            granted: false,
            message: 'Permiso bloqueado. Ve a Configuración > Privacidad > Fotos para habilitarlo.'
          };
        } else {
          return {
            granted: false,
            message: 'Permiso de galería denegado'
          };
        }
      }

      if (checkResult === RESULTS.BLOCKED) {
        return {
          granted: false,
          message: 'Permiso bloqueado. Ve a Configuración > Privacidad > Fotos para habilitarlo.'
        };
      }

      // RESULTS.UNAVAILABLE
      return {
        granted: false,
        message: 'Permiso de galería no disponible en este dispositivo'
      };

    } catch (error) {
      console.warn('Error requesting iOS photo library permission:', error);
      return {
        granted: false,
        message: 'Error al solicitar permisos de galería'
      };
    }
  }

  /**
   * Verifica si los permisos de almacenamiento están concedidos (multiplataforma)
   */
  static async checkStoragePermission(): Promise<boolean> {
    if (Platform.OS === 'ios') {
      return this.checkIOSPhotoLibraryPermission();
    } else {
      return this.checkAndroidStoragePermission();
    }
  }

  /**
   * Verifica permisos de almacenamiento en Android
   */
  private static async checkAndroidStoragePermission(): Promise<boolean> {

    try {
      // Para Android 13+, no necesitamos verificar este permiso
      if (typeof Platform.Version === 'number' && Platform.Version >= 33) {
        return true;
      }

      const granted = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
      );
      return granted;
    } catch (error) {
      console.warn('Error checking storage permission:', error);
      return false;
    }
  }

  /**
   * Verifica permisos de galería en iOS
   */
  private static async checkIOSPhotoLibraryPermission(): Promise<boolean> {
    try {
      const result = await check(PERMISSIONS.IOS.PHOTO_LIBRARY_ADD_ONLY);
      return result === RESULTS.GRANTED;
    } catch (error) {
      console.warn('Error checking iOS photo library permission:', error);
      return false;
    }
  }

  /**
   * Muestra un diálogo explicando por qué se necesitan los permisos
   */
  static showPermissionRationale(onRetry: () => void, onCancel: () => void) {
    Alert.alert(
      'Permisos Necesarios',
      'Para guardar las firmas digitales, necesitamos acceso al almacenamiento de tu dispositivo. Esto nos permite guardar las firmas de forma segura.',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
          onPress: onCancel,
        },
        {
          text: 'Configurar',
          onPress: onRetry,
        },
      ]
    );
  }
}
