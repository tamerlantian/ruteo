import { useCallback } from 'react';
import { useVisitaProcessing } from './use-visita-processing.hook';

/**
 * Hook para manejar el reintento de visitas con error
 * Utiliza los datos del formulario guardados previamente
 * Refactorizado para usar el hook compartido de procesamiento
 */
export const useRetryVisitas = () => {
  const { procesarVisitasEnLote } = useVisitaProcessing();

  /**
   * Reintenta el envío de visitas con error usando los datos guardados
   * @param visitasConError - Array de IDs de visitas con error
   */
  const reintentarVisitasConError = useCallback(
    async (visitasConError: number[]) => {
      await procesarVisitasEnLote(visitasConError, {
        markErrorOnFailure: true,
        logPrefix: 'Reintento',
        messagePrefix: 'reintento',
        clearSelectionsOnSuccess: true,
      });
    },
    [procesarVisitasEnLote],
  );

  return {
    reintentarVisitasConError,
  };
};
