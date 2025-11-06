import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { selectSubdominio } from '../../settings';
import { selectVisitas } from '../store/selector/visita.selector';
import {
  marcarVisitaComoEntregada,
  marcarVisitaConError,
  limpiarDatosFormularioDeVisita,
  limpiarSeleccionVisitas,
  desmarcarVisitaConError,
} from '../store/slice/visita.slice';
import { useToast } from '../../../shared/hooks/use-toast.hook';
import { EntregaFormData } from '../interfaces/visita.interface';
import {
  VisitaProcessingService,
  VisitaProcessingConfig,
  BatchProcessingResult,
} from '../services/visita-processing.service';

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
  const toast = useToast();

  /**
   * Procesa una visita individual y actualiza el estado de Redux
   */
  const procesarVisitaIndividual = useCallback(
    async (
      visitaId: number,
      config: UseVisitaProcessingConfig = {},
    ): Promise<boolean> => {
      if (!subdominio) {
        toast.error('No se proporcionó un subdominio');
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
          dispatch(marcarVisitaConError(visitaId));
        }

        // Mostrar toast de error
        const errorMessage = `Error al procesar la visita ${visitaId}: ${result.error}`;
        toast.error(errorMessage);
      }

      return result.success;
    },
    [visitas, subdominio, dispatch, toast],
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
        toast.warning(`No hay visitas para ${messagePrefix}`);
        return { successCount: 0, errorCount: 0, results: [] };
      }

      if (!subdominio) {
        toast.error('No se proporcionó un subdominio');
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
        batchResult.results.forEach(result => {
          if (result.success) {
            dispatch(marcarVisitaComoEntregada(result.visitaId));
            dispatch(desmarcarVisitaConError(result.visitaId));
            dispatch(limpiarDatosFormularioDeVisita(result.visitaId));
          } else if (config.markErrorOnFailure) {
            dispatch(marcarVisitaConError(result.visitaId));
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
              toast.success(messageResult.message);
              break;
            case 'warning':
              toast.warning(messageResult.message);
              break;
            case 'error':
              toast.error(messageResult.message);
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
        toast.error('Error al procesar las visitas');
        return { successCount: 0, errorCount: visitaIds.length, results: [] };
      }
    },
    [subdominio, dispatch, toast, visitas],
  );

  return {
    procesarVisitaIndividual,
    procesarVisitasEnLote,
  };
};
