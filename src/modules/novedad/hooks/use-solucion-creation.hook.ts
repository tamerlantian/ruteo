import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import {
  guardarSolucionNovedad,
  limpiarNovedad,
  limpiarSeleccionNovedades,
  cambiarEstadoSolucionNovedad,
} from '../store/slice/novedad.slice';
import { desmarcarVisitaConNovedad } from '../../visita/store/slice/visita.slice';
import {
  useSolucionApi,
  UseSolucionApiConfig,
  SolucionFormData,
  SolucionBatchProcessingResult,
} from './use-solucion-api.hook';
import { isTempId } from '../../../shared/utils/id-generator.util';
import { selectNovedades } from '../store/selector/novedad.selector';

/**
 * Configuration for the useSolucionCreation hook
 */
export interface UseSolucionCreationConfig extends UseSolucionApiConfig {
  clearSelectionsOnSuccess?: boolean;
}

/**
 * Hook specifically for creating new solutions
 * Handles the creation flow: API call + Redux state management for new solutions
 */
export const useSolucionCreation = () => {
  const dispatch = useAppDispatch();
  const novedades = useAppSelector(selectNovedades);
  const { procesarSolucionesApiEnLote, mostrarMensajesDeResultado } =
    useSolucionApi();

  /**
   * Creates new solutions for the given novedad IDs
   * This is used when submitting the solution form for the first time
   */
  const crearNuevasSoluciones = useCallback(
    async (
      solucionesData: SolucionFormData[],
      config: UseSolucionCreationConfig = {},
    ): Promise<SolucionBatchProcessingResult> => {
      try {
        // Separate temp IDs from synced IDs
        const solucionesTemporales: SolucionFormData[] = [];
        const solucionesSincronizadas: SolucionFormData[] = [];

        solucionesData.forEach(solucion => {
          if (isTempId(solucion.id)) {
            solucionesTemporales.push(solucion);
          } else {
            solucionesSincronizadas.push(solucion);
          }
        });

        let totalSuccessCount = 0;
        let totalErrorCount = 0;
        const allResults: any[] = [];

        // Handle temporary solutions (local only)
        if (solucionesTemporales.length > 0) {
          solucionesTemporales.forEach(solucionData => {
            try {
              // Save solution locally
              dispatch(guardarSolucionNovedad(solucionData));

              // Update solution state
              dispatch(
                cambiarEstadoSolucionNovedad({
                  id: solucionData.id,
                  estado: 'error',
                }),
              );

              // Get associated visita_id and unmark visita
              const novedad = novedades.find(n => n.id === solucionData.id);
              if (novedad?.visita_id) {
                dispatch(desmarcarVisitaConNovedad(novedad.visita_id));
              }

              allResults.push({
                success: true,
                novedadId: solucionData.id,
                solucionData,
              });

              totalSuccessCount++;
            } catch (error) {
              allResults.push({
                success: false,
                novedadId: solucionData.id,
                solucionData,
                error: String(error),
              });

              totalErrorCount++;
            }
          });
        }

        // Handle synced solutions (API call)
        if (solucionesSincronizadas.length > 0) {
          const batchResult = await procesarSolucionesApiEnLote(
            solucionesSincronizadas,
            config,
          );

          // Update Redux for each result
          batchResult.results.forEach(result => {
            if (result.success) {
              // Remove solved novedad from store (it's now solved)
              dispatch(limpiarNovedad(result.novedadId));

              // Get associated visita_id and unmark visita
              const novedad = novedades.find(n => n.id === result.novedadId);
              if (novedad?.visita_id) {
                dispatch(desmarcarVisitaConNovedad(novedad.visita_id));
              }
            } else {
               // Get associated visita_id and unmark visita
              const novedad = novedades.find(n => n.id === result.novedadId);
              if (novedad?.visita_id) {
                dispatch(desmarcarVisitaConNovedad(novedad.visita_id));
              }
              
              // Mark solution with error state for retry
              dispatch(guardarSolucionNovedad(result.solucionData));
              dispatch(
                cambiarEstadoSolucionNovedad({
                  id: result.novedadId,
                  estado: 'error',
                }),
              );
            }
          });

          totalSuccessCount += batchResult.successCount;
          totalErrorCount += batchResult.errorCount;
          allResults.push(...batchResult.results);
        }

        // Show result messages
        if (config.showToasts !== false) {
          mostrarMensajesDeResultado(
            totalSuccessCount,
            totalErrorCount,
            config.messagePrefix || 'solución',
          );
        }

        dispatch(limpiarSeleccionNovedades());

        return {
          successCount: totalSuccessCount,
          errorCount: totalErrorCount,
          results: allResults,
        };
      } catch (error) {
        console.error('Error general al crear soluciones:', error);

        // Return error result
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
    [
      dispatch,
      novedades,
      procesarSolucionesApiEnLote,
      mostrarMensajesDeResultado,
    ],
  );

  return {
    crearNuevasSoluciones,
  };
};
