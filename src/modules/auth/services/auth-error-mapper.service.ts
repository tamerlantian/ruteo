
import { ApiErrorResponse } from '../../../core/interfaces/api.interface';

/**
 * Tipos de errores de autenticación
 */
export enum AuthErrorType {
  USER_ALREADY_EXISTS = 'USER_ALREADY_EXISTS',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  WEAK_PASSWORD = 'WEAK_PASSWORD',
  INVALID_EMAIL = 'INVALID_EMAIL',
  NETWORK_ERROR = 'NETWORK_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

/**
 * Interfaz para mensajes de error mapeados
 */
export interface MappedError {
  title: string;
  message: string;
  type: AuthErrorType;
}

/**
 * Servicio simple para mapear errores de autenticación
 */
export class AuthErrorMapperService {
  /**
   * Mapea errores basándose en la estructura ApiErrorResponse
   */
  static mapError(error: any, context: 'login' | 'register' = 'register'): MappedError {
    console.log(' Error recibido:', error);
    
    // Extraer datos del error según la estructura de tu API
    let apiError: ApiErrorResponse | undefined;
    let statusCode: number | undefined;
    
    if (error?.response?.data) {
      // Estructura típica de axios: error.response.data contiene ApiErrorResponse
      apiError = error.response.data as ApiErrorResponse;
      statusCode = apiError.codigo || error.response.status;
    } else if (error?.codigo) {
      // Error directo con estructura ApiErrorResponse
      apiError = error as ApiErrorResponse;
      statusCode = apiError.codigo;
    } else {
      // Fallback para otros tipos de error
      statusCode = error?.status || error?.response?.status;
    }
    
    console.log(' API Error:', apiError);
    console.log(' Status code extraído:', statusCode);
    
    // Mapeo basado en código de estado, usando mensaje del servidor cuando sea apropiado
    switch (statusCode) {
      case 400:
        if (context === 'register') {
          return {
            title: 'Usuario ya existe',
            message: 'Ya existe una cuenta registrada con este correo electrónico',
            type: AuthErrorType.USER_ALREADY_EXISTS,
          };
        } else {
          return {
            title: 'Credenciales incorrectas',
            message: 'El correo o la contraseña son incorrectos. Verifica tus datos e intenta nuevamente.',
            type: AuthErrorType.INVALID_CREDENTIALS,
          };
        }

      case 401:
        return {
          title: 'Credenciales incorrectas',
          message: 'El correo o la contraseña son incorrectos. Verifica tus datos e intenta nuevamente.',
          type: AuthErrorType.INVALID_CREDENTIALS,
        };

      case 409:
        return {
          title: 'Usuario ya existe',
          message: 'Ya existe una cuenta registrada con este correo electrónico. Intenta iniciar sesión.',
          type: AuthErrorType.USER_ALREADY_EXISTS,
        };

      case 422:
        return {
          title: 'Datos inválidos',
          message: 'Los datos ingresados no son válidos. Verifica el formato del correo y la contraseña.',
          type: AuthErrorType.INVALID_EMAIL,
        };

      case 500:
      case 502:
      case 503:
        return {
          title: 'Error del servidor',
          message: 'Estamos experimentando problemas técnicos. Por favor intenta nuevamente en unos minutos.',
          type: AuthErrorType.SERVER_ERROR,
        };

      default:
        // Si no hay conexión
        if (!error.response && error.request) {
          return {
            title: 'Sin conexión',
            message: 'No hay conexión a internet. Verifica tu conexión e intenta nuevamente.',
            type: AuthErrorType.NETWORK_ERROR,
          };
        }
        
        // Error genérico
        return {
          title: context === 'register' ? 'Error de registro' : 'Error de inicio de sesión',
          message: 'Ocurrió un error. Por favor verifica tus datos e intenta nuevamente.',
          type: AuthErrorType.UNKNOWN_ERROR,
        };
    }
  }
}
