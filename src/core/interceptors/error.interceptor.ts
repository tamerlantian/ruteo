import { AxiosError } from 'axios';
import { ApiErrorResponse } from '../interfaces/api.interface';
import { reportError } from '../../shared/utils/sentry-helpers';

/**
 * Determina si un error HTTP es retryable basándose en el código de estado y tipo de error
 */
const determineIfRetryable = (error: AxiosError<ApiErrorResponse>): boolean => {
  const statusCode = error.response?.status;

  // Network errors (sin respuesta del servidor)
  if (!error.response && error.request) {
    return true; // Sin conexión, timeout, DNS failure
  }

  // No request/response at all
  if (!error.request && !error.response) {
    return false; // Configuración o setup error
  }

  // Status code based classification
  if (!statusCode) {
    return true; // Sin status code = problema de red
  }

  // Retryable status codes
  if ([408, 429, 500, 502, 503, 504].includes(statusCode)) {
    return true;
  }

  // Non-retryable status codes (client errors)
  if (statusCode >= 400 && statusCode < 500) {
    return false; // 4xx except 408 and 429
  }

  // Unknown status codes - default to retryable
  return true;
};

/**
 * Maneja los errores de respuesta HTTP y devuelve un objeto de error estandarizado
 */
export const handleErrorResponse = (error: AxiosError<ApiErrorResponse>): ApiErrorResponse => {
  let _errores = new Map<number, (error: AxiosError<ApiErrorResponse>) => ApiErrorResponse>();
  _errores.set(400, error => error400(error));
  _errores.set(401, error => error401(error));
  _errores.set(404, error => error404(error));
  _errores.set(405, error => error405(error));
  _errores.set(408, error => error408(error));
  _errores.set(413, error => error413(error));
  _errores.set(500, error => error500(error));
  _errores.set(502, error => error502(error));
  _errores.set(503, error => error503(error));
  _errores.set(504, error => error504(error));

  // Obtener el código de error de la respuesta
  const statusCode = error.response?.status || 500;

  // Obtener la función del Map usando el código de error
  const handler = _errores.get(statusCode);

  // Si la función existe, ejecutarla, sino manejar como error por defecto
  if (handler) {
    return handler(error);
  } else {
    // Si no hay handler específico, determinar retryable
    const isRetryable = determineIfRetryable(error);

    // 🚨 SENTRY: Reportar errores HTTP no mapeados para descubrir códigos nuevos
    reportError(
      'http_unhandled_status_code',
      error,
      {
        module: 'http',
        location: 'error-interceptor',
        statusCode,
        url: error.config?.url,
        method: error.config?.method?.toUpperCase(),
        isRetryable,
        responseData: error.response?.data,
      },
      'warning' // Use warning level - no es crítico pero queremos saberlo
    );

    return {
      titulo: 'Error',
      mensaje: `Error al procesar la solicitud (Código: ${statusCode})`, // Incluir código en mensaje
      codigo: statusCode,
      isRetryable,
    };
  }
};

const error400 = (error: AxiosError<ApiErrorResponse>): ApiErrorResponse => {
  const mensaje = procesarErroresValidacion(error);

  return {
    titulo: 'Error',
    mensaje,
    codigo: 400,
    isRetryable: false, // No retryable - error de validación
  };
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const error401 = (error: AxiosError): ApiErrorResponse => {
  return {
    titulo: 'Error',
    mensaje: 'Token inválido o expirado, por favor intente de nuevo',
    codigo: 401,
    isRetryable: false, // No retryable - se maneja automáticamente con token refresh
  };
};

const error404 = (error: AxiosError): ApiErrorResponse => {
  const mensaje = procesarErroresValidacion(error);

  return {
    titulo: 'Error',
    mensaje,
    codigo: 404,
    isRetryable: false, // No retryable - recurso no encontrado
  };
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const error405 = (error: AxiosError): ApiErrorResponse => {
  return {
    titulo: 'Error',
    mensaje: 'Servidor fuera de línea, intente más tarde',
    codigo: 405,
    isRetryable: false, // No retryable - método no permitido
  };
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const error500 = (error: AxiosError): ApiErrorResponse => {
  return {
    titulo: 'Error',
    mensaje: 'Servidor fuera de línea, intente más tarde',
    codigo: 500,
    isRetryable: true, // Retryable - problema del servidor
  };
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const error408 = (error: AxiosError): ApiErrorResponse => {
  return {
    titulo: 'Tiempo agotado',
    mensaje: 'El servidor tardó mucho en responder. Por favor, intenta de nuevo.',
    codigo: 408,
    isRetryable: true,
  };
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const error413 = (error: AxiosError): ApiErrorResponse => {
  return {
    titulo: 'Archivos muy grandes',
    mensaje: 'Las fotos son muy grandes. Intenta tomar fotos con menor calidad.',
    codigo: 413,
    isRetryable: false, // Usuario debe reducir tamaño
  };
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const error502 = (error: AxiosError): ApiErrorResponse => {
  return {
    titulo: 'Error del servidor',
    mensaje: 'El servidor está experimentando problemas. Por favor, intenta más tarde.',
    codigo: 502,
    isRetryable: true,
  };
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const error503 = (error: AxiosError): ApiErrorResponse => {
  return {
    titulo: 'Servicio no disponible',
    mensaje: 'El servidor está temporalmente fuera de servicio. Por favor, intenta más tarde.',
    codigo: 503,
    isRetryable: true,
  };
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const error504 = (error: AxiosError): ApiErrorResponse => {
  return {
    titulo: 'Tiempo de espera agotado',
    mensaje: 'El servidor tardó demasiado en responder. Por favor, intenta de nuevo.',
    codigo: 504,
    isRetryable: true,
  };
};

/**
 * Procesa los errores de validación y construye un mensaje de error
 * @param error Error de Axios que contiene validaciones
 * @returns Mensaje de error formateado
 */
const procesarErroresValidacion = (error: AxiosError<ApiErrorResponse>): string => {
  let mensaje = error.response?.data?.error || error.response?.data?.mensaje || '';

  if (error.response?.data?.hasOwnProperty('validaciones')) {
    for (const key in error.response?.data?.validaciones) {
      if (error.response?.data?.validaciones.hasOwnProperty(key)) {
        const value = error.response?.data?.validaciones[key];
        mensaje += `${key}: ${value}`;
      }
    }
  }

  return mensaje;
};
