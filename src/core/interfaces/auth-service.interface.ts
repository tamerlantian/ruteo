import { RefreshTokenResponse } from '../../modules/auth/interfaces/auth.interface';

/**
 * Interfaz para servicios de autenticación
 * Define las operaciones relacionadas con la autenticación que pueden ser implementadas
 * por diferentes proveedores
 */
export interface IAuthService {
  /**
   * Renueva el token de acceso usando un refresh token
   * @param refreshToken Token de renovación
   * @returns Respuesta con el nuevo token
   */
  refreshToken(_refreshToken: string): Promise<RefreshTokenResponse>;
}
