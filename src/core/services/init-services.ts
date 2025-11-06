import { AuthRepository } from "../../modules/auth/repositories/auth.repository";
import tokenService from "./token.service";

/**
 * Inicializa los servicios de la aplicación
 * Configura las dependencias entre servicios para evitar ciclos de importación
 */
export function initializeServices(): void {
  // Configurar el servicio de token con la implementación de autenticación
  const authService = AuthRepository.getInstance();
  tokenService.setAuthService(authService);
}
