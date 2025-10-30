import { AxiosError } from 'axios';
import { ApiErrorResponse } from '../interfaces/api.interface';

/**
 * Maneja los errores de respuesta HTTP y devuelve un objeto de error estandarizado
 */
export const handleErrorResponse = (error: AxiosError<ApiErrorResponse>): ApiErrorResponse => {
  let _errores = new Map<number, (error: AxiosError<ApiErrorResponse>) => ApiErrorResponse>();
  _errores.set(400, error => error400(error));
  _errores.set(401, error => error401(error));
  _errores.set(404, error => error404(error));
  _errores.set(405, error => error405(error));
  _errores.set(500, error => error500(error));

  // Obtener el código de error de la respuesta
  const statusCode = error.response?.status || 500;

  // Obtener la función del Map usando el código de error
  const handler = _errores.get(statusCode);

  // Si la función existe, ejecutarla, sino manejar como error por defecto
  if (handler) {
    return handler(error);
  } else {
    return {
      titulo: 'Error',
      mensaje: 'Error al procesar la solicitud',
      codigo: statusCode,
    };
  }
};

const error400 = (error: AxiosError<ApiErrorResponse>): ApiErrorResponse => {
  const mensaje = procesarErroresValidacion(error);

  return {
    titulo: 'Error',
    mensaje,
    codigo: 400,
  };
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const error401 = (error: AxiosError): ApiErrorResponse => {
  return {
    titulo: 'Error',
    mensaje: 'Token inválido o expirado, por favor intente de nuevo',
    codigo: 401,
  };
};

const error404 = (error: AxiosError): ApiErrorResponse => {
  const mensaje = procesarErroresValidacion(error);

  return {
    titulo: 'Error',
    mensaje,
    codigo: 404,
  };
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const error405 = (error: AxiosError): ApiErrorResponse => {
  return {
    titulo: 'Error',
    mensaje: 'Servidor fuera de línea, intente más tarde',
    codigo: 405,
  };
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const error500 = (error: AxiosError): ApiErrorResponse => {
  return {
    titulo: 'Error',
    mensaje: 'Servidor fuera de línea, intente más tarde',
    codigo: 500,
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
