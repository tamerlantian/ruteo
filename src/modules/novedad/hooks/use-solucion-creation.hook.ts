import { useCallback } from 'react';
import { useAppDispatch } from '../../../store/hooks';
import {
  guardarSolucionNovedad,
  limpiarNovedad,
  limpiarSeleccionNovedades,
  cambiarEstadoSolucionNovedad,
} from '../store/slice/novedad.slice';
import { desmarcarVisitaConNovedad } from '../../visita/store/slice/visita.slice';
import { isTempId } from '../../../shared/utils/id-generator.util';
import { store } from '../../../store';
import { useSolucionApi } from './use-solucion-api.hook';
import { SolucionBatchProcessingResult, SolucionFormData, UseSolucionCreationConfig } from '../interfaces/solucion.interface';

/**
 * Hook specifically for creating new solutions
 * Handles the creation flow: API call + Redux state management for new solutions
 */
export const useSolucionCreation = () => {
  const dispatch = useAppDispatch();
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
        const novedades = store.getState().novedad.novedades;

        // Buscar los IDs actualizados en el store y actualizar solucionesData
        const solucionesConIdsActualizados = solucionesData.map(solucion => {
          // Buscar la novedad en el store por id o id_real
          const novedadEnStore = novedades.find(n => 
            n.id === solucion.id || n.id_real === solucion.id
          );
          
          if (novedadEnStore) {
            // Si encontramos la novedad, usar el id_real si existe, sino el id original
            const idActualizado = novedadEnStore.id_real || novedadEnStore.id;            
            return {
              ...solucion,
              id: idActualizado
            };
          }
          
          // Si no encontramos la novedad, mantener el ID original
          console.warn(`⚠️ No se encontró novedad en store para ID: ${solucion.id}`);
          return solucion;
        });

        // Separate temp IDs from synced IDs usando los IDs actualizados
        const solucionesTemporales: SolucionFormData[] = [];
        const solucionesSincronizadas: SolucionFormData[] = [];

        solucionesConIdsActualizados.forEach(solucion => {
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
              const novedad = novedades.find(n => n.id === result.novedadId || n.id_real === result.novedadId);
              if (novedad?.visita_id) {
                dispatch(desmarcarVisitaConNovedad(novedad.visita_id));
              }
            } else {
               // Get associated visita_id and unmark visita
              const novedad = novedades.find(n => n.id === result.novedadId || n.id_real === result.novedadId);
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
      procesarSolucionesApiEnLote,
      mostrarMensajesDeResultado,
    ],
  );

  return {
    crearNuevasSoluciones,
  };
};
