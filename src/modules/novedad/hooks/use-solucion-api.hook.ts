import { useCallback } from 'react';
import { useAppSelector } from '../../../store/hooks';
import { selectSubdominio } from '../../settings';
import { novedadRepository } from '../repositories/novedad.repository';
import Toast from 'react-native-toast-message';
import { toastTextOneStyle } from '../../../shared/styles/global.style';

/**
 * Configuration for the useSolucionApi hook
 */
export interface UseSolucionApiConfig {
  showToasts?: boolean;
  logPrefix?: string;
  messagePrefix?: string;
}

/**
 * Data structure for solution submission
 */
export interface SolucionFormData {
  id: string;
  tempId: string;
  solucion: string;
}

/**
 * Result of a single solution processing
 */
export interface SolucionProcessingResult {
  success: boolean;
  novedadId: string;
  novedadTempId?: string;
  solucionData: SolucionFormData;
  error?: string;
  apiError?: any;
}

/**
 * Result of batch solution processing
 */
export interface SolucionBatchProcessingResult {
  successCount: number;
  errorCount: number;
  results: SolucionProcessingResult[];
}

/**
 * Hook for solution API communication only
 * Handles only the API calls without Redux state management
 * This is the core processing layer that can be reused by creation and retry hooks
 */
export const useSolucionApi = () => {
  const subdominio = useAppSelector(selectSubdominio);

  /**
   * Processes a single solution via API
   * Returns only the API result without updating Redux
   */
  const procesarSolucionApi = useCallback(
    async (
      solucionData: SolucionFormData,
      config: UseSolucionApiConfig = {},
    ): Promise<SolucionProcessingResult> => {
      if (!subdominio) {
        if (config.showToasts !== false) {
          Toast.show({
            type: 'error',
            text1: 'No se proporcionó un subdominio',
            text1Style: toastTextOneStyle,
          });
        }
        return { 
          success: false, 
          novedadId: solucionData.id,
          novedadTempId: solucionData.tempId,
          solucionData,
          error: 'No subdominio provided' 
        };
      }

      try {
        const { logPrefix = 'Procesamiento Solución' } = config;
        console.log(`${logPrefix} - Procesando solución para novedad ${solucionData.id}`);

        await novedadRepository.solucionarNovedades(subdominio, solucionData);

        console.log(`✅ ${logPrefix} - Solución enviada exitosamente para novedad ${solucionData.id}`);
        
        return {
          success: true,
          novedadId: solucionData.id,
          solucionData,
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`❌ Error al procesar solución para novedad ${solucionData.id}:`, error);
        
        return {
          success: false,
          novedadId: solucionData.id,
          solucionData,
          error: errorMessage,
          apiError: error,
        };
      }
    },
    [subdominio],
  );

  /**
   * Processes multiple solutions via API in batch
   * Returns only the API results without updating Redux
   */
  const procesarSolucionesApiEnLote = useCallback(
    async (
      solucionesData: SolucionFormData[],
      config: UseSolucionApiConfig = {},
    ): Promise<SolucionBatchProcessingResult> => {
      if (!subdominio) {
        if (config.showToasts !== false) {
          Toast.show({
            type: 'error',
            text1: 'No se proporcionó un subdominio',
            text1Style: toastTextOneStyle,
          });
        }
        return {
          successCount: 0,
          errorCount: solucionesData.length,
          results: solucionesData.map(data => ({
            success: false,
            novedadId: data.id,
            solucionData: data,
            error: 'No subdominio provided',
          })),
        };
      }

      try {
        const results: SolucionProcessingResult[] = [];
        let successCount = 0;
        let errorCount = 0;

        // Process each solution individually
        for (const solucionData of solucionesData) {
          const result = await procesarSolucionApi(solucionData, {
            ...config,
            showToasts: false, // We'll show consolidated messages
          });

          results.push(result);

          if (result.success) {
            successCount++;
          } else {
            errorCount++;
          }
        }

        return {
          successCount,
          errorCount,
          results,
        };
      } catch (error) {
        console.error('Error general al procesar soluciones en lote:', error);

        if (config.showToasts !== false) {
          Toast.show({
            type: 'error',
            text1: 'Error al procesar las soluciones',
            text1Style: toastTextOneStyle,
          });
        }

        return {
          successCount: 0,
          errorCount: solucionesData.length,
          results: solucionesData.map(data => ({
            success: false,
            novedadId: data.id,
            solucionData: data,
            error: String(error),
          })),
        };
      }
    },
    [subdominio, procesarSolucionApi],
  );

  /**
   * Shows result messages based on batch processing results
   */
  const mostrarMensajesDeResultado = useCallback(
    (
      successCount: number,
      errorCount: number,
      messagePrefix: string = 'solución',
    ) => {
      const total = successCount + errorCount;
      
      if (total === 0) return;

      if (errorCount === 0) {
        // All successful
        const message = successCount === 1 
          ? `${messagePrefix} enviada exitosamente`
          : `${successCount} ${messagePrefix}es enviadas exitosamente`;
        
        Toast.show({
          type: 'success',
          text1: message,
          text1Style: toastTextOneStyle,
        });
      } else if (successCount === 0) {
        // All failed
        const message = errorCount === 1
          ? `Error al enviar ${messagePrefix}`
          : `Error al enviar ${errorCount} ${messagePrefix}es`;
        
        Toast.show({
          type: 'error',
          text1: message,
          text1Style: toastTextOneStyle,
        });
      } else {
        // Mixed results
        Toast.show({
          type: 'warning',
          text1: `${successCount} ${messagePrefix}es enviadas, ${errorCount} con error`,
          text1Style: toastTextOneStyle,
        });
      }
    },
    [],
  );

  return {
    procesarSolucionApi,
    procesarSolucionesApiEnLote,
    mostrarMensajesDeResultado,
  };
};
