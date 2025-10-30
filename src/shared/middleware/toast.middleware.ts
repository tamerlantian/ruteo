import { Middleware } from '@reduxjs/toolkit';
import { useToast } from '../hooks/use-toast.hook';

/**
 * Middleware para mostrar errores de Redux como toasts
 * @param toastApi API de toast para mostrar mensajes
 * @returns Middleware de Redux
 */
export const createToastMiddleware = () => {
  // Referencia al hook useToast
  let toastApi: ReturnType<typeof useToast> | null = null;

  // Función para establecer la referencia al hook useToast
  const setToastApi = (api: ReturnType<typeof useToast>) => {
    toastApi = api;
  };

  // Middleware de Redux
  const middleware: Middleware = () => (next) => (action: unknown) => {
    // Procesar la acción normalmente
    const result = next(action);

    // Si no tenemos acceso al API de toast, no podemos mostrar mensajes
    if (!toastApi) return result;

    // Detectar acciones rechazadas (rejected) que contienen errores
    // @ts-ignore
    if (action.type?.endsWith('/rejected') && action.payload) {
      // Mostrar el error como un toast
    // @ts-ignore
      toastApi.error(action.payload);
    }

    // Detectar acciones completadas (fulfilled) que podrían mostrar mensajes de éxito
    // Esto es opcional y depende de la lógica de negocio
    // @ts-ignore
    if (action.type?.endsWith('/fulfilled') && action.meta?.showSuccessToast) {
      // @ts-ignore
      const message = action.meta.successMessage || 'Operación completada con éxito';
      toastApi.success(message);
    }

    return result;
  };

  return { middleware, setToastApi };
};

// Exportar una instancia del middleware
export const { middleware: toastMiddleware, setToastApi } = createToastMiddleware();
