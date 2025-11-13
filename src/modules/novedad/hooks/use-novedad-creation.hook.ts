import { useCallback } from 'react';
import { useAppDispatch } from '../../../store/hooks';
import { guardarNovedad, limpiarSeleccionNovedades } from '../store/slice/novedad.slice';
import { marcarVisitaConNovedad } from '../../visita/store/slice/visita.slice';
import { useNovedadApi, UseNovedadApiConfig } from './use-novedad-api.hook';
import { Novedad, NovedadFormData } from '../interfaces/novedad.interface';
import { NovedadBatchProcessingResult } from '../services/novedad-processing.service';

/**
 * Configuration for the useNovedadCreation hook
 */
export interface UseNovedadCreationConfig extends UseNovedadApiConfig {
  clearSelectionsOnSuccess?: boolean;
}

/**
 * Hook specifically for creating new novedades
 * Handles the creation flow: API call + Redux state management for new novedades
 */
export const useNovedadCreation = () => {
  const dispatch = useAppDispatch();
  const { procesarNovedadesApiEnLote, mostrarMensajesDeResultado } = useNovedadApi();

  /**
   * Creates new novedades for the given visita IDs
   * This is used when submitting the novedad form for the first time
   */
  const crearNuevasNovedades = useCallback(
    async (
      formularios: NovedadFormData[],
      config: UseNovedadCreationConfig = {},
    ): Promise<NovedadBatchProcessingResult> => {
      try {
        // Call API to create novedades
        const batchResult = await procesarNovedadesApiEnLote(
          formularios,
          config,
        );

        // Update Redux for each result
        batchResult.results.forEach(result => {
          const novedadData: Novedad = {
            id: result.datosFormulario.id,
            visita_id: result.visitaId,
            novedad_tipo_id: parseInt(result.datosFormulario.tipo, 10),
            fecha: new Date().toISOString(),
            descripcion: result.datosFormulario.descripcion,
            imagenes: result.datosFormulario.foto.map(foto => ({
              uri: foto.uri,
            })),
            estado: 'error',
            estado_solucion: 'pending',
          };

          if (!result.success) {
            // Skip if novedad is duplicated (API error 400)
            if (result.apiError?.codigo === 400) {
              return;
            }

            dispatch(
              guardarNovedad({
                novedad: novedadData,
              }),
            );
          }

          if (result.success) {
            if (!result.novedadId) return;
            
            dispatch(
              guardarNovedad({
                novedad: {
                  ...novedadData,
                  id: result.novedadId,
                  estado: 'sync',
                  estado_solucion: 'pending',
                },
              }),
            );
          }

          // Mark visita as having novedad
          dispatch(marcarVisitaConNovedad(result.visitaId));
        });

        // Show result messages
        if (config.showToasts !== false) {
          mostrarMensajesDeResultado(
            batchResult.successCount,
            batchResult.errorCount,
            config.messagePrefix || 'novedad',
          );
        }

        // Clear selections if all were successful and configured to do so
        if (config.clearSelectionsOnSuccess && batchResult.errorCount === 0) {
          dispatch(limpiarSeleccionNovedades());
        }

        return batchResult;
      } catch (error) {
        console.error('Error general al crear novedades:', error);
        
        // Return error result
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
    [dispatch, procesarNovedadesApiEnLote, mostrarMensajesDeResultado],
  );

  return {
    crearNuevasNovedades,
  };
};
