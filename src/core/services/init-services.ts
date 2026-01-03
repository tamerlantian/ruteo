import { AuthRepository } from "../../modules/auth/repositories/auth.repository";
import { backgroundGeolocationService } from "../../shared/services/background-geolocation.service";
import tokenService from "./token.service";

/**
 * Inicializa los servicios de la aplicación
 * Configura las dependencias entre servicios para evitar ciclos de importación
 */
export async function initializeServices(): Promise<void> {
  // Configurar el servicio de token con la implementación de autenticación
  const authService = AuthRepository.getInstance();
  tokenService.setAuthService(authService);
  
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
