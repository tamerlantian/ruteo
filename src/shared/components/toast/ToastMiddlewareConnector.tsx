import React, { useEffect } from 'react';
import { useToast } from '../../hooks/use-toast.hook';
import { setToastApi } from '../../middleware/toast.middleware';

/**
 * Componente que conecta el middleware de Redux con el hook useToast
 * Este componente debe montarse en el árbol de componentes para que el middleware
 * de Redux tenga acceso al API de toast
 */
export const ToastMiddlewareConnector: React.FC = () => {
  const toast = useToast();

  useEffect(() => {
    // Establecer la referencia al hook useToast en el middleware
    setToastApi(toast);
  }, [toast]);

  // Este componente no renderiza nada
  return null;
};
