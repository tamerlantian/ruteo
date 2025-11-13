import { useCallback, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { selectNovedadesConError } from '../store/selector/novedad.selector';
import { actualizarIdNovedad, cambiarEstadoNovedad, limpiarSeleccionNovedades } from '../store/slice/novedad.slice';
import { useNovedadApi } from './use-novedad-api.hook';
import { NovedadFormData } from '../interfaces/novedad.interface';

/**
 * Hook specifically for retrying novedades with error state
 * Uses existing novedad data from Redux instead of creating new ones
 * This fixes the issue of duplicating novedades during retry
 */
export const useRetryNovedades = () => {
  const dispatch = useAppDispatch();
  const novedadesConError = useAppSelector(selectNovedadesConError);
  const { procesarNovedadesApiEnLote, mostrarMensajesDeResultado } =
    useNovedadApi();
  const [isRetryLoading, setIsRetryLoading] = useState(false);

  /**
   * Retries sending novedades with error state using existing data from Redux
   * @param novedadIds - Array of novedad IDs with error state
   */
  const reintentarNovedadesConError = useCallback(
    async (novedadIds: string[]) => {
      try {
        setIsRetryLoading(true);
        const novedadesAReintentar: NovedadFormData[] = [];

        novedadesConError.forEach(novedad => {
          if (novedadIds.includes(novedad.id)) {
            novedadesAReintentar.push({
              id: novedad.id,
              visitaId: novedad.visita_id,
              tipo: novedad.novedad_tipo_id.toString(),
              descripcion: novedad.descripcion,
              foto: novedad.imagenes.map(img => ({
                uri: img.uri,
                timestamp: Date.now(),
              })),
            });
          }
        });

        const batchResult = await procesarNovedadesApiEnLote(
          novedadesAReintentar,
          {
            logPrefix: 'Reintento',
            messagePrefix: 'reintento',
            showToasts: false,
          },
        );

        batchResult.results.forEach(result => {
          if(result.success) {
            if (!result.novedadId) return;
            dispatch(cambiarEstadoNovedad({ id: result.datosFormulario.id, estado: 'sync' }))
            dispatch(actualizarIdNovedad({ id: result.datosFormulario.id, nuevoId: result.novedadId }))
          }
        })

        // Show consolidated result messages
        const successCount = batchResult.results.filter(r => r.success).length;
        const errorCount = batchResult.results.filter(r => !r.success).length;

        dispatch(limpiarSeleccionNovedades())
        mostrarMensajesDeResultado(successCount, errorCount, 'reintento');
      } catch (error) {
        console.error('Error general al reintentar novedades:', error);
      } finally {
        setIsRetryLoading(false);
      }
    },
    [
      dispatch,
      novedadesConError,
      procesarNovedadesApiEnLote,
      mostrarMensajesDeResultado,
    ],
  );

  return {
    reintentarNovedadesConError,
    isRetryLoading,
  };
};
