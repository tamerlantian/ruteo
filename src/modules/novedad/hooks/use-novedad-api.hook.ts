import { useCallback } from 'react';
import { useAppSelector } from '../../../store/hooks';
import { selectSubdominio } from '../../settings';
import {
  NovedadProcessingService,
  NovedadProcessingConfig,
  NovedadBatchProcessingResult,
} from '../services/novedad-processing.service';
import { NovedadFormData } from '../interfaces/novedad.interface';
import Toast from 'react-native-toast-message';
import { toastTextOneStyle } from '../../../shared/styles/global.style';

/**
 * Configuration for the useNovedadApi hook
 */
export interface UseNovedadApiConfig extends NovedadProcessingConfig {
  showToasts?: boolean;
}

/**
 * Hook for API communication only
 * Handles only the API calls without Redux state management
 * This is the core processing layer that can be reused by creation and retry hooks
 */
export const useNovedadApi = () => {
  const subdominio = useAppSelector(selectSubdominio);

  /**
   * Processes a single novedad via API
   * Returns only the API result without updating Redux
   */
  const procesarNovedadApi = useCallback(
    async (
      formulario: NovedadFormData,
      config: UseNovedadApiConfig = {},
    ) => {
      if (!subdominio) {
        if (config.showToasts !== false) {
          Toast.show({
            type: 'error',
            text1: 'No se proporcionó un subdominio',
            text1Style: toastTextOneStyle,
          });
        }
        return { success: false, error: 'No subdominio provided' };
      }

      const result = await NovedadProcessingService.procesarNovedadIndividual(
        subdominio,
        formulario,
        config,
      );

      return result;
    },
    [subdominio],
  );

  /**
   * Processes multiple novedades via API in batch
   * Returns only the API results without updating Redux
   */
  const procesarNovedadesApiEnLote = useCallback(
    async (
      formularios: NovedadFormData[],
      config: UseNovedadApiConfig = {},
    ): Promise<NovedadBatchProcessingResult> => {
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
        const batchResult = await NovedadProcessingService.procesarNovedadesEnLote(
          subdominio,
          formularios,
          config,
        );

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
          errorCount: formularios.length,
          results: formularios.map(formulario => ({
            success: false,
            visitaId: formulario.visitaId,
            datosFormulario: formulario,
            error: String(error),
          })),
        };
      }
    },
    [subdominio],
  );

  /**
   * Shows result messages based on batch processing results
   */
  const mostrarMensajesDeResultado = useCallback(
    (
      successCount: number,
      errorCount: number,
      messagePrefix: string = 'novedad',
    ) => {
      const messageResult = NovedadProcessingService.generarMensajesDeResultado(
        successCount,
        errorCount,
        messagePrefix,
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
    },
    [],
  );

  return {
    procesarNovedadApi,
    procesarNovedadesApiEnLote,
    mostrarMensajesDeResultado,
  };
};
