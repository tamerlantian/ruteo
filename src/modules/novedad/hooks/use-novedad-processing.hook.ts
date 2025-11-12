import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { selectSubdominio } from '../../settings';
import { guardarNovedad } from '../store/slice/novedad.slice';
import { limpiarSeleccionVisitas } from '../../visita/store/slice/visita.slice';
import {
  NovedadProcessingService,
  NovedadProcessingConfig,
  NovedadBatchProcessingResult,
} from '../services/novedad-processing.service';
import { NovedadFormData } from '../interfaces/novedad.interface';
import Toast from 'react-native-toast-message';
import { toastTextOneStyle } from '../../../shared/styles/global.style';

/**
 * Configuration for the useNovedadProcessing hook
 */
export interface UseNovedadProcessingConfig extends NovedadProcessingConfig {
  showToasts?: boolean;
}

/**
 * Hook for processing novedad submissions
 * Provides methods to process individual or batch novedades
 */
export const useNovedadProcessing = () => {
  const subdominio = useAppSelector(selectSubdominio);
  const dispatch = useAppDispatch();

  /**
   * Processes a single novedad
   */
  const procesarNovedadIndividual = useCallback(
    async (
      visitaId: number,
      datosFormulario: NovedadFormData,
      config: UseNovedadProcessingConfig = {},
    ) => {
      if (!subdominio) {
        if (config.showToasts !== false) {
          Toast.show({
            type: 'error',
            text1: 'No se proporcionó un subdominio',
            text1Style: toastTextOneStyle,
          });
        }
        return { success: false, visitaId, error: 'No subdominio provided' };
      }

      const result = await NovedadProcessingService.procesarNovedadIndividual(
        visitaId,
        subdominio,
        datosFormulario,
        config,
      );

      // Show toast for individual processing if enabled
      if (config.showToasts !== false) {
        if (result.success) {
          Toast.show({
            type: 'success',
            text1: 'Novedad enviada exitosamente',
            text1Style: toastTextOneStyle,
          });
        } else {
          Toast.show({
            type: 'error',
            text1: 'Error al enviar novedad',
            text2: result.error,
            text1Style: toastTextOneStyle,
          });
        }
      }

      return result;
    },
    [subdominio],
  );

  /**
   * Processes multiple novedades in batch
   */
  const procesarNovedadesEnLote = useCallback(
    async (
      visitaIds: number[],
      datosFormulario: NovedadFormData,
      config: UseNovedadProcessingConfig = {},
    ): Promise<NovedadBatchProcessingResult> => {
      if (visitaIds.length === 0) {
        const messagePrefix = config.messagePrefix || 'novedad';
        if (config.showToasts !== false) {
          Toast.show({
            type: 'warning',
            text1: `No hay visitas para enviar ${messagePrefix}`,
            text1Style: toastTextOneStyle,
          });
        }
        return { successCount: 0, errorCount: 0, results: [] };
      }

      if (!subdominio) {
        if (config.showToasts !== false) {
          Toast.show({
            type: 'error',
            text1: 'No se proporcionó un subdominio',
            text1Style: toastTextOneStyle,
          });
        }
        return { successCount: 0, errorCount: 0, results: [] };
      }

      try {
        const batchResult =
          await NovedadProcessingService.procesarNovedadesEnLote(
            visitaIds,
            subdominio,
            datosFormulario,
            config,
          );

        // Actualizar Redux para cada resultado
        batchResult.results.forEach(result => {
          if (!result.success) {
            // signfica que la novedad esta repetida y procedemos a no guardarla
            if(result.apiError?.codigo === 400) {
              return; 
            }

            dispatch(
              guardarNovedad({
                visita_id: result.visitaId,
                novedad_tipo_id: parseInt(result.datosFormulario.tipo, 10),
                fecha: new Date().toISOString(),
                descripcion: result.datosFormulario.descripcion,
                imagenes: result.datosFormulario.foto.map(foto => ({
                  uri: foto.uri,
                })),
                estado_error: true,
              }),
            );
          }

          if (result.success) {
            dispatch(
              guardarNovedad({
                visita_id: result.visitaId,
                novedad_tipo_id: parseInt(result.datosFormulario.tipo, 10),
                fecha: new Date().toISOString(),
                descripcion: result.datosFormulario.descripcion,
                imagenes: result.datosFormulario.foto.map(foto => ({
                  uri: foto.uri,
                })),
                estado_error: false,
              }),
            );
          }
        });

        // Mostrar mensajes de resultado
        const messageResult =
          NovedadProcessingService.generarMensajesDeResultado(
            batchResult.successCount,
            batchResult.errorCount,
            config.messagePrefix || 'novedad',
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

        // Limpiar selecciones si todas fueron exitosas
        if (batchResult.errorCount === 0) {
          dispatch(limpiarSeleccionVisitas());
        }

        return batchResult;
      } catch (error) {
        console.error('Error general al procesar novedades en lote:', error);

        if (config.showToasts !== false) {
          Toast.show({
            type: 'error',
            text1: 'Error al procesar las novedades',
            text1Style: toastTextOneStyle,
          });
        }

        return {
          successCount: 0,
          errorCount: visitaIds.length,
          results: visitaIds.map(id => ({
            success: false,
            visitaId: id,
            datosFormulario,
            error: String(error),
          })),
        };
      }
    },
    [subdominio, dispatch],
  );

  return {
    procesarNovedadIndividual,
    procesarNovedadesEnLote,
  };
};
