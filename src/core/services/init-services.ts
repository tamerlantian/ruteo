import { AuthRepository } from "../../modules/auth/repositories/auth.repository";
import { backgroundGeolocationService } from "../../shared/services/background-geolocation.service";
import tokenService from "./token.service";
import { Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Muestra el aviso destacado (Prominent Disclosure) para acceso a ubicación en segundo plano
 * REQUERIDO por Google Play Console para cumplir con la política de Datos de Usuario
 *
 * Este diálogo se muestra UNA SOLA VEZ en la primera instalación, antes de solicitar
 * permisos de ubicación en segundo plano.
 */
async function showBackgroundLocationDisclosure(): Promise<void> {
  const DISCLOSURE_KEY = 'background_location_disclosure_shown';

  try {
    // Verificar si ya se mostró el aviso
    const hasShown = await AsyncStorage.getItem(DISCLOSURE_KEY);

    if (hasShown === 'true') {
      console.log('📍 [Disclosure] Ya se mostró anteriormente, omitiendo...');
      return;
    }

    console.log('📍 [Disclosure] Mostrando aviso destacado por primera vez');

    // Mostrar el diálogo y esperar a que el usuario lo cierre
    await new Promise<void>((resolve) => {
      Alert.alert(
        'Acceso a Ubicación en Segundo Plano',
        'Ruteo recopila datos de ubicación para permitir el seguimiento de tus viajes de trabajo ' +
        'y calcular la distancia recorrida incluso cuando la aplicación está cerrada o no está en uso.\n\n' +
        'Estos datos se cargarán en nuestros servidores donde podrás ver y/o eliminar tu historial de ubicación.',
        [
          {
            text: 'Cerrar',
            onPress: async () => {
              // Guardar el flag para no mostrar de nuevo
              try {
                await AsyncStorage.setItem(DISCLOSURE_KEY, 'true');
                console.log('📍 [Disclosure] Flag guardado correctamente');
              } catch (error) {
                console.error('📍 [Disclosure] Error guardando flag:', error);
              }
              resolve();
            },
          },
        ],
        { cancelable: false }
      );
    });

  } catch (error) {
    console.error('📍 [Disclosure] Error mostrando aviso:', error);
    // No lanzar error - continuar con la inicialización
  }
}

/**
 * Inicializa los servicios de la aplicación
 * Configura las dependencias entre servicios para evitar ciclos de importación
 */
export async function initializeServices(): Promise<void> {
  // Configurar el servicio de token con la implementación de autenticación
  const authService = AuthRepository.getInstance();
  tokenService.setAuthService(authService);

  // CRÍTICO: Mostrar aviso destacado ANTES de inicializar BackgroundGeolocation
  // REQUERIDO por Google Play Console para cumplir con políticas de privacidad
  await showBackgroundLocationDisclosure();

  // CRÍTICO: Inicializar BackgroundGeolocation UNA SOLA VEZ por launch
  // Según documentación oficial: "You must call .ready() once and only once, each time your app is launched"
  try {
    console.log('🚀 [InitServices] Inicializando BackgroundGeolocation...');
    await backgroundGeolocationService.ready();
    console.log('🚀 [InitServices] BackgroundGeolocation listo');
  } catch (error) {
    console.error('🚀 [InitServices] Error inicializando BackgroundGeolocation:', error);
    // No lanzar error - la app puede continuar sin geolocation
  }
}
