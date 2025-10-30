import { useToastContext, ToastType, ToastPlacement } from '../context/toast/ToastContext';

/**
 * Hook para mostrar mensajes toast en la aplicación
 * @returns Funciones para mostrar diferentes tipos de toast
 */
export const useToast = () => {
  const { showToast, defaultPlacement, setDefaultPlacement } = useToastContext();

  /**
   * Muestra un mensaje de éxito
   * @param message Mensaje a mostrar
   * @param duration Duración en milisegundos (por defecto 3000ms)
   * @param placement Posición del toast ('top' o 'bottom')
   */
  const success = (message: string, duration?: number, placement?: ToastPlacement) => {
    showToast('success', message, duration, placement);
  };

  /**
   * Muestra un mensaje de error
   * @param message Mensaje a mostrar
   * @param duration Duración en milisegundos (por defecto 3000ms)
   * @param placement Posición del toast ('top' o 'bottom')
   */
  const error = (message: string, duration?: number, placement?: ToastPlacement) => {
    showToast('error', message, duration, placement);
  };

  /**
   * Muestra un mensaje informativo
   * @param message Mensaje a mostrar
   * @param duration Duración en milisegundos (por defecto 3000ms)
   * @param placement Posición del toast ('top' o 'bottom')
   */
  const info = (message: string, duration?: number, placement?: ToastPlacement) => {
    showToast('info', message, duration, placement);
  };

  /**
   * Muestra un mensaje de advertencia
   * @param message Mensaje a mostrar
   * @param duration Duración en milisegundos (por defecto 3000ms)
   * @param placement Posición del toast ('top' o 'bottom')
   */
  const warning = (message: string, duration?: number, placement?: ToastPlacement) => {
    showToast('warning', message, duration, placement);
  };

  /**
   * Muestra un mensaje toast personalizado
   * @param type Tipo de toast ('success', 'error', 'info', 'warning')
   * @param message Mensaje a mostrar
   * @param duration Duración en milisegundos (por defecto 3000ms)
   * @param placement Posición del toast ('top' o 'bottom')
   */
  const show = (
    type: ToastType,
    message: string,
    duration?: number,
    placement?: ToastPlacement,
  ) => {
    showToast(type, message, duration, placement);
  };

  return {
    success,
    error,
    info,
    warning,
    show,
    defaultPlacement,
    setDefaultPlacement,
  };
};
