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
import { reportBatchProcessingError } from '../../../shared/utils/sentry-helpers';
import { deleteFotos } from '../../../shared/utils/photo-storage.util';
import { networkService } from '../../../shared/services';

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
        // Borrar las fotos persistidas (ya se subieron OK) antes de limpiar
        // los datos guardados. Best-effort, no bloquea.
        const visitaOk = visitas.find(v => v.id === visitaId);
        const fotosOk = visitaOk?.datos_formulario_guardados?.fotos;
        if (fotosOk?.length) {
          deleteFotos(fotosOk.map(f => f.uri));
        }
        // Marcar como entregada y limpiar datos guardados
        dispatch(marcarVisitaComoEntregada(visitaId));
        dispatch(limpiarDatosFormularioDeVisita(visitaId));
      } else {
        // Marcar con error si está configurado
        if (config.markErrorOnFailure) {
          // Extraer mensaje de error como string
          let errorMensaje = 'Error desconocido al procesar la entrega';
          let esErrorRetryable = true; // Default a retryable por seguridad

          if (result.error) {
            if (typeof result.error === 'string') {
              errorMensaje = result.error;
            } else if (typeof result.error === 'object') {
              // Si el error es un objeto, intentar extraer el mensaje
              errorMensaje =
                result.error.mensaje ||
                result.error.message ||
                result.error.titulo ||
                JSON.stringify(result.error);
            }
          }

          // Extraer clasificación del apiError si existe
          if (result.apiError) {
            esErrorRetryable = result.apiError.isRetryable ?? true;
          }

          dispatch(
            cambiarEstadoVisita({
              visitaId,
              estado: 'error',
              errorMensaje,
              esErrorRetryable,
            }),
          );
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
        // const messagePrefix = config.messagePrefix || 'operación';
        // Toast.show({
        //   type: 'info',
        //   text1: `No hay visitas para ${messagePrefix}`,
        //   text1Style: toastTextOneStyle,
        // });
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
        batchResult.results.forEach(result => {
          const { visitaId, success } = result;
          if (success) {
            // Borrar fotos persistidas (ya subidas) — best-effort.
            const visitaOk = visitas.find(v => v.id === visitaId);
            const fotosOk = visitaOk?.datos_formulario_guardados?.fotos;
            if (fotosOk?.length) {
              deleteFotos(fotosOk.map(f => f.uri));
            }
            dispatch(marcarVisitaComoEntregada(visitaId));
            dispatch(limpiarDatosFormularioDeVisita(visitaId));
          } else if (config.markErrorOnFailure) {
            // Extracción null-safe del mensaje + clasificación retryable.
            const { mensaje, esRetryable } =
              VisitaProcessingService.extraerErrorVisita(result);

            dispatch(
              cambiarEstadoVisita({
                visitaId,
                estado: 'error',
                errorMensaje: mensaje,
                esErrorRetryable: esRetryable,
              }),
            );
          }
        });

        // Feedback ÚNICO y honesto (mismo copy para entrega inicial, reintento
        // manual y auto-sync). Offline-aware: un fallo recuperable se comunica
        // como "guardada, se sincroniza" (info), no como error rojo.
        const online = await networkService.isConnected();
        const mensaje = VisitaProcessingService.generarMensajeEntrega(
          batchResult,
          online,
        );
        if (mensaje) {
          Toast.show({
            type: mensaje.type,
            text1: mensaje.text1,
            text2: mensaje.text2,
            text1Style: toastTextOneStyle,
          });
        }

        // Limpiar selecciones si todas fueron exitosas y está configurado
        if (config.clearSelectionsOnSuccess && batchResult.errorCount === 0) {
          dispatch(limpiarSeleccionVisitas());
        }

        return batchResult;
      } catch (error) {
        console.error('Error general al procesar las visitas:', error);

        // Report catastrophic batch processing errors (not individual item failures)
        reportBatchProcessingError('entrega', error, {
          totalCount: visitaIds.length,
          visitaIds: visitaIds.join(','),
          hasSubdominio: !!subdominio,
          messagePrefix: config.messagePrefix || 'operación',
        });

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
