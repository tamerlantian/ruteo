import { useCallback } from 'react';
import { useAppSelector } from '../../../store/hooks';
import { selectNovedadesConEstadosError } from '../../novedad/store/selector/novedad.selector';
import { Novedad } from '../../novedad/interfaces/novedad.interface';
import { useRetrySoluciones } from '../../novedad/hooks/use-retry-soluciones.hook';
import { useRetryNovedades } from '../../novedad/hooks';
import { useRetryVisitas } from './use-retry-visitas.hook';

/**
 * Hook for coordinated retry of visitas and their associated novedades/soluciones
 * Executes retries in the correct order: novedades → soluciones → visitas
 */
export const useCoordinatedRetry = () => {
  const novedadesConErrores = useAppSelector(selectNovedadesConEstadosError);
  const { reintentarNovedadesConError } = useRetryNovedades();
  const { reintentarSolucionesConError } = useRetrySoluciones();
  const { reintentarVisitasConError } = useRetryVisitas();

  /**
   * Executes coordinated retry for visitas and their associated elements
   * @param visitaIds - Array of visita IDs to retry
   * @param options - Configuration options
   */
  const executeCoordinatedRetry = useCallback(
    async (
      visitaIds: number[],
      options: {
        logPrefix?: string;
        skipVisitaRetry?: boolean; // Allow skipping visita retry if only preparing
      } = {},
    ) => {
      const { logPrefix = 'Retry', skipVisitaRetry = false } = options;

      try {
        // 1. Get all novedades associated with these visitas
        const novedadesAsociadas = novedadesConErrores.filter(
          (novedad: Novedad) => visitaIds.includes(novedad.visita_id),
        );

        const novedadIds = novedadesAsociadas.map(
          (novedad: Novedad) => novedad.id,
        );

        // 2. Execute retries in order: novedades → soluciones → visitas
        if (novedadIds.length > 0) {
          console.log(
            `${logPrefix}: Reintentando ${novedadIds.length} novedades con error...`,
          );
          await reintentarNovedadesConError(novedadIds);

          console.log(
            `${logPrefix}: Reintentando ${novedadIds.length} soluciones con error...`,
          );
          await reintentarSolucionesConError(novedadIds);
        }

        // 3. Finally retry visitas (if not skipped)
        if (!skipVisitaRetry && visitaIds.length > 0) {
          console.log(
            `${logPrefix}: Reintentando ${visitaIds.length} visitas con error...`,
          );
          await reintentarVisitasConError(visitaIds);
        }

        return {
          success: true,
          retriedNovedades: novedadIds.length,
          retriedVisitas: skipVisitaRetry ? 0 : visitaIds.length,
        };
      } catch (error) {
        console.error(
          `${logPrefix}: Error al ejecutar retry coordinado:`,
          error,
        );
        throw error;
      }
    },
    [
      novedadesConErrores,
      reintentarNovedadesConError,
      reintentarSolucionesConError,
      reintentarVisitasConError,
    ],
  );

  /**
   * Prepares visitas for processing by retrying associated novedades/soluciones
   * Does NOT retry the visitas themselves (useful before form submission)
   * @param visitaIds - Array of visita IDs to prepare
   */
  const prepareVisitasForProcessing = useCallback(
    async (visitaIds: number[]) => {
      return executeCoordinatedRetry(visitaIds, {
        logPrefix: 'Preparación',
        skipVisitaRetry: true,
      });
    },
    [executeCoordinatedRetry],
  );

  return {
    executeCoordinatedRetry,
    prepareVisitasForProcessing,
  };
};
