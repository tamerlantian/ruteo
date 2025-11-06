import { useCallback, useState } from 'react';
import { useVisitaProcessing } from './use-visita-processing.hook';

/**
 * Hook para manejar el reintento de visitas con error
 * Utiliza los datos del formulario guardados previamente
 * Refactorizado para usar el hook compartido de procesamiento
 */
export const useRetryVisitas = () => {
  const { procesarVisitasEnLote } = useVisitaProcessing();
  const [isRetryLoading, setIsRetryLoading] = useState(false);

  /**
   * Reintenta el envío de visitas con error usando los datos guardados
   * @param visitasConError - Array de IDs de visitas con error
   */
  const reintentarVisitasConError = useCallback(
    async (visitasConError: number[]) => {
      try {
        setIsRetryLoading(true);
        await procesarVisitasEnLote(visitasConError, {
          markErrorOnFailure: true,
          logPrefix: 'Reintento',
          messagePrefix: 'reintento',
          clearSelectionsOnSuccess: true,
        });
      } finally {
        setIsRetryLoading(false);
      }
    },
    [procesarVisitasEnLote],
  );

  return {
    reintentarVisitasConError,
    isRetryLoading,
  };
};
