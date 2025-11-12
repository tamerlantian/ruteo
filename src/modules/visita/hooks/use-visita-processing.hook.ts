import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { selectSubdominio } from '../../settings';
import { selectVisitas } from '../store/selector/visita.selector';
import {
  marcarVisitaComoEntregada,
  limpiarDatosFormularioDeVisita,
  limpiarSeleccionVisitas,
  cambiarEstadoVisita,
} from '../store/slice/visita.slice';
import { EntregaFormData } from '../interfaces/visita.interface';
import {
  VisitaProcessingService,
  VisitaProcessingConfig,
  BatchProcessingResult,
} from '../services/visita-processing.service';
import Toast from 'react-native-toast-message';
import { toastTextOneStyle } from '../../../shared/styles/global.style';

/**
 * Configuración para el hook de procesamiento de visitas
 */
export interface UseVisitaProcessingConfig extends VisitaProcessingConfig {
  /** Limpiar selecciones al finalizar exitosamente */
  clearSelectionsOnSuccess?: boolean;
}

/**
 * Hook para manejar el procesamiento de visitas (entrega inicial y reintentos)
 * Centraliza la lógica común y maneja las acciones de Redux
 */
export const useVisitaProcessing = () => {
  const dispatch = useAppDispatch();
  const subdominio = useAppSelector(selectSubdominio);
  const visitas = useAppSelector(selectVisitas);

  /**
   * Procesa una visita individual y actualiza el estado de Redux
   */
  const procesarVisitaIndividual = useCallback(
    async (
      visitaId: number,
      config: UseVisitaProcessingConfig = {},
    ): Promise<boolean> => {
      if (!subdominio) {
        Toast.show({
          type: 'error',
          text1: 'No se proporcionó un subdominio',
          text1Style: toastTextOneStyle,
        });
        return false;
      }

      const result = await VisitaProcessingService.procesarVisitaIndividual(
        visitaId,
        visitas,
        subdominio,
        config,
      );

      if (result.success) {
        // Marcar como entregada y limpiar datos guardados
        dispatch(marcarVisitaComoEntregada(visitaId));
        dispatch(limpiarDatosFormularioDeVisita(visitaId));
      } else {
        // Marcar con error si está configurado
        if (config.markErrorOnFailure) {
          dispatch(cambiarEstadoVisita({ visitaId, estado: 'error' }));
        }

        // Mostrar toast de error
        const errorMessage = `Error al procesar la visita ${visitaId}: ${result.error}`;
        Toast.show({
          type: 'error',
          text1: errorMessage,
          text1Style: toastTextOneStyle,
        });
      }

      return result.success;
    },
    [visitas, subdominio, dispatch],
  );

  /**
   * Procesa múltiples visitas y actualiza el estado de Redux
   */
  const procesarVisitasEnLote = useCallback(
    async (
      visitaIds: number[],
      config: UseVisitaProcessingConfig = {},
      datosFormulario?: EntregaFormData,
    ): Promise<BatchProcessingResult> => {
      if (visitaIds.length === 0) {
        const messagePrefix = config.messagePrefix || 'operación';
        Toast.show({
          type: 'warning',
          text1: `No hay visitas para ${messagePrefix}`,
          text1Style: toastTextOneStyle,
        });
        return { successCount: 0, errorCount: 0, results: [] };
      }

      if (!subdominio) {
        Toast.show({
          type: 'error',
          text1: 'No se proporcionó un subdominio',
          text1Style: toastTextOneStyle,
        });
        return { successCount: 0, errorCount: 0, results: [] };
      }

      try {
        const batchResult = await VisitaProcessingService.procesarVisitasEnLote(
          visitaIds,
          visitas,
          subdominio,
          config,
          datosFormulario,
        );

        // Actualizar Redux para cada resultado
        batchResult.results.forEach(({ visitaId, success }) => {
          if (success) {
            dispatch(marcarVisitaComoEntregada(visitaId));
            dispatch(limpiarDatosFormularioDeVisita(visitaId));
          } else if (config.markErrorOnFailure) {
            dispatch(cambiarEstadoVisita({ visitaId, estado: 'error' }));
          }
        });

        // Mostrar mensajes de resultado
        const messageResult =
          VisitaProcessingService.generarMensajesDeResultado(
            batchResult.successCount,
            batchResult.errorCount,
            config.messagePrefix || 'operación',
          );

        if (messageResult) {
          switch (messageResult.type) {
            case 'success':
              Toast.show({
                type: 'success',
                text1: messageResult.message,
                text1Style: toastTextOneStyle,
              });
              break;
            case 'warning':
              Toast.show({
                type: 'warning',
                text1: messageResult.message,
                text1Style: toastTextOneStyle,
              });
              break;
            case 'error':
              Toast.show({
                type: 'error',
                text1: messageResult.message,
                text1Style: toastTextOneStyle,
              });
              break;
          }
        }

        // Limpiar selecciones si todas fueron exitosas y está configurado
        if (config.clearSelectionsOnSuccess && batchResult.errorCount === 0) {
          dispatch(limpiarSeleccionVisitas());
        }

        return batchResult;
      } catch (error) {
        console.error('Error general al procesar las visitas:', error);
        Toast.show({
          type: 'error',
          text1: 'Error al procesar las visitas',
          text1Style: toastTextOneStyle,
        });
        return { successCount: 0, errorCount: visitaIds.length, results: [] };
      }
    },
    [subdominio, dispatch, visitas],
  );

  return {
    procesarVisitaIndividual,
    procesarVisitasEnLote,
  };
};
