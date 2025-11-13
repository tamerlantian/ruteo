import { useCallback, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { 
  limpiarNovedad,
  limpiarSeleccionNovedades
} from '../store/slice/novedad.slice';
import { desmarcarVisitaConNovedad } from '../../visita/store/slice/visita.slice';
import { useSolucionApi, SolucionFormData } from './use-solucion-api.hook';
import { selectNovedadesConSolucionError } from '../store/selector/novedad.selector';

/**
 * Hook specifically for retrying solutions with error state
 * Uses existing solution data from Redux instead of creating new ones
 * This fixes the issue of duplicating solutions during retry
 */
export const useRetrySoluciones = () => {
  const dispatch = useAppDispatch();
  const novedades = useAppSelector(selectNovedadesConSolucionError);
  const { procesarSolucionesApiEnLote, mostrarMensajesDeResultado } = useSolucionApi();
  const [isRetryLoading, setIsRetryLoading] = useState(false);

  /**
   * Retries sending solutions with error state using existing data from Redux
   * @param novedadIds - Array of novedad IDs with solution error state
   */
  const reintentarSolucionesConError = useCallback(
    async (novedadIds: string[]) => {
      try {
        setIsRetryLoading(true);
        const solucionesAReintentar: SolucionFormData[] = [];

        // Get existing solutions data from Redux
        novedades.forEach(novedad => {
          if (novedadIds.includes(novedad.id) && novedad.solucion) {
            solucionesAReintentar.push({
              id: novedad.id,
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
            dispatch(limpiarNovedad(result.novedadId));
            
            // Get associated visita_id and unmark visita
            const novedad = novedades.find(n => n.id === result.novedadId);
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
          'reintento de solución'
        );

        // Clear selections after processing
        dispatch(limpiarSeleccionNovedades());

      } catch (error) {
        console.error('Error general al reintentar soluciones:', error);
      } finally {
        setIsRetryLoading(false);
      }
    },
    [dispatch, novedades, procesarSolucionesApiEnLote, mostrarMensajesDeResultado],
  );

  return {
    reintentarSolucionesConError,
    isRetryLoading,
  };
};
