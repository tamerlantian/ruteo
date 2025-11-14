import { useCallback, useState } from 'react';
import { useAppDispatch } from '../../../store/hooks';
import {
  limpiarNovedad,
  limpiarSeleccionNovedades,
} from '../store/slice/novedad.slice';
import { desmarcarVisitaConNovedad } from '../../visita/store/slice/visita.slice';
import { useSolucionApi, SolucionFormData } from './use-solucion-api.hook';
import { store } from '../../../store';

/**
 * Hook specifically for retrying solutions with error state
 * Uses existing solution data from Redux instead of creating new ones
 * This fixes the issue of duplicating solutions during retry
 */
export const useRetrySoluciones = () => {
  const dispatch = useAppDispatch();
  const { procesarSolucionesApiEnLote, mostrarMensajesDeResultado } =
    useSolucionApi();
  const [isRetryLoading, setIsRetryLoading] = useState(false);

  /**
   * Retries sending solutions with error state using existing data from Redux
   * @param novedadIds - Array of novedad IDs with solution error state
   */
  const reintentarSolucionesConError = useCallback(
    async (novedadIds: string[]) => {
      try {
        setIsRetryLoading(true);
        const novedadesActualizadas = store.getState().novedad.novedades;
        const novedadesConError = novedadesActualizadas.filter(
          n => n.estado_solucion === 'error',
        );
        const solucionesAReintentar: SolucionFormData[] = [];

        // Get existing solutions data from Redux
        console.log("novedades directas", novedadesActualizadas);
        
        novedadesConError.forEach(novedad => {
          if (
            novedadIds.includes(novedad.id) &&
            novedad.solucion &&
            novedad.id_real
          ) {
            solucionesAReintentar.push({
              id: novedad.id_real,
              tempId: novedad.id,
              solucion: novedad.solucion,
            });
          } 
          else if (novedadIds.includes(novedad.id) && novedad.solucion) {
            solucionesAReintentar.push({
              id: novedad.id,
              tempId: novedad.id,
              solucion: novedad.solucion,
            });
          }
        });

        if (solucionesAReintentar.length === 0) {
          console.warn('No se encontraron soluciones para reintentar');
          return;
        }

        // Process solutions via API
        const batchResult = await procesarSolucionesApiEnLote(
          solucionesAReintentar,
          {
            logPrefix: 'Reintento Solución',
            messagePrefix: 'reintento de solución',
            showToasts: false, // We'll show consolidated messages
          },
        );

        // Update Redux state based on results
        batchResult.results.forEach(result => {
          if (result.success) {
            // Remove solved novedad from store (it's now solved)
            dispatch(limpiarNovedad(result.solucionData.tempId || result.novedadId));

            // Get associated visita_id and unmark visita
            const novedad = novedadesConError.find(
              n => n.id === result.novedadId,
            );
            if (novedad?.visita_id) {
              dispatch(desmarcarVisitaConNovedad(novedad.visita_id));
            }
          }
          // If failed, solution remains in error state (no action needed)
        });

        // Show consolidated result messages
        mostrarMensajesDeResultado(
          batchResult.successCount,
          batchResult.errorCount,
          'reintento de solución',
        );

        // Clear selections after processing
        dispatch(limpiarSeleccionNovedades());
      } catch (error) {
        console.error('Error general al reintentar soluciones:', error);
      } finally {
        setIsRetryLoading(false);
      }
    },
    [dispatch, procesarSolucionesApiEnLote, mostrarMensajesDeResultado],
  );

  return {
    reintentarSolucionesConError,
    isRetryLoading,
  };
};
