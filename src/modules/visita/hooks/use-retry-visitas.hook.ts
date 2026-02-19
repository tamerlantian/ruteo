import { useCallback, useState } from 'react';
import { useVisitaProcessing } from './use-visita-processing.hook';
import { useAppSelector } from '../../../store/hooks';
import { selectVisitas, selectIsSyncing } from '../store/selector/visita.selector';
import Toast from 'react-native-toast-message';
import { toastTextOneStyle } from '../../../shared/styles/global.style';

/**
 * Hook para manejar el reintento de visitas con error
 * Utiliza los datos del formulario guardados previamente
 * Refactorizado para usar el hook compartido de procesamiento
 */
export const useRetryVisitas = () => {
  const { procesarVisitasEnLote } = useVisitaProcessing();
  const visitas = useAppSelector(selectVisitas);
  const isSyncingFromDashboard = useAppSelector(selectIsSyncing);
  const [localIsRetryLoading, setIsRetryLoading] = useState(false);

  /**
   * Reintenta el envío de visitas con error usando los datos guardados
   * @param visitasConError - Array de IDs de visitas con error
   */
  const reintentarVisitasConError = useCallback(
    async (visitasConError: number[]) => {
      // Filtrar solo visitas retryables
      const visitasRetryables = visitasConError.filter(visitaId => {
        const visita = visitas.find(v => v.id === visitaId);

        // Si no tiene clasificación, permitir retry por compatibilidad
        if (visita?.es_error_retryable === undefined) {
          return true;
        }

        // Solo permitir si es retryable
        return visita.es_error_retryable === true;
      });

      // Warning si hay visitas no-retryables
      const visitasNoRetryables = visitasConError.filter(
        id => !visitasRetryables.includes(id),
      );

      if (visitasNoRetryables.length > 0) {
        console.warn(
          `⚠️ Se omitieron ${visitasNoRetryables.length} visitas con errores no-retryables:`,
          visitasNoRetryables,
        );

        Toast.show({
          type: 'info',
          text1: 'Algunas entregas no se pueden reintentar',
          text2: 'Corrige los errores de validación manualmente',
          text1Style: toastTextOneStyle,
        });
      }

      // Si no hay visitas retryables, salir
      if (visitasRetryables.length === 0) {
        Toast.show({
          type: 'error',
          text1: 'No hay entregas para reintentar',
          text2: 'Todos los errores requieren corrección manual',
          text1Style: toastTextOneStyle,
        });
        return;
      }

      try {
        setIsRetryLoading(true);
        await procesarVisitasEnLote(visitasRetryables, {
          markErrorOnFailure: true,
          logPrefix: 'Reintento',
          messagePrefix: 'reintento',
          clearSelectionsOnSuccess: true,
        });
      } finally {
        setIsRetryLoading(false);
      }

    },
    [procesarVisitasEnLote, visitas],
  );

  return {
    reintentarVisitasConError,
    isRetryLoading: localIsRetryLoading || isSyncingFromDashboard,
  };
};
