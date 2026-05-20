import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../../../../store/root-reducer';
import { selectVisitaIdsWithNovedades } from '../../../novedad/store/selector/novedad.selector';

const selectVisitasRootState = (state: RootState) => state.visita;

export const selectVisitas = createSelector(
  selectVisitasRootState,
  visita => visita.visitas,
);

export const selectVisitasPendientes = createSelector(
  [selectVisitas],
  visitas =>
    visitas.filter(
      visita =>
        !visita.estado_entregado &&
        visita.estado === 'pending' &&
        !visita.estado_novedad,
    ),
);

export const selectVisitasEntregadas = createSelector(
  selectVisitasRootState,
  ({ visitas }) => visitas.filter(visita => visita.estado_entregado),
);

export const selectIsLoading = createSelector(
  selectVisitasRootState,
  visita => visita.status === 'loading',
);

export const selectIsSyncing = (state: RootState) => state.visita.isSyncing;

export const selectIsSucceeded = createSelector(
  selectVisitasRootState,
  visita => visita.status === 'succeeded',
);

// Selectores para el estado de selección
export const selectVisitasSeleccionadas = createSelector(
  selectVisitasRootState,
  visita => visita.seleccionadas,
);

// Selector optimizado para verificar si una visita específica está seleccionada
export const selectIsVisitaSeleccionada = (visitaId: number) =>
  createSelector(selectVisitasSeleccionadas, seleccionadas =>
    seleccionadas.includes(visitaId),
  );

// Selector para obtener el número total de visitas seleccionadas
export const selectTotalVisitasSeleccionadas = createSelector(
  selectVisitasSeleccionadas,
  seleccionadas => seleccionadas.length,
);

// Selector para verificar si todas las visitas están seleccionadas
export const selectTodasVisitasSeleccionadas = createSelector(
  [selectVisitas, selectVisitasSeleccionadas],
  (visitas, seleccionadas) =>
    visitas.length > 0 && visitas.length === seleccionadas.length,
);

// Selector para obtener visitas con error
export const selectVisitasConError = createSelector(
  selectVisitasRootState,
  ({ visitas }) => visitas.filter(visita => visita.estado === 'error'),
);

// Selector para obtener IDs de visitas con error (optimizado para retry)
export const selectVisitaIdsConError = createSelector(
  selectVisitasConError,
  visitasConError => visitasConError.map(visita => visita.id),
);

// Selector completo que incluye visitas con error Y visitas con novedades con error
export const selectVisitaIdsConErrorCompleto = createSelector(
  [
    selectVisitasConError, // Visitas con estado error directo
    (state: RootState) => state.novedad.novedades, // Novedades del estado
  ],
  (visitasConError, novedades) => {
    // IDs de visitas con error directo
    const visitaIdsConErrorDirecto = visitasConError.map(visita => visita.id);
    
    // IDs de visitas que tienen novedades con error (estado o estado_solucion)
    const visitaIdsConNovedadesError = novedades
      .filter(novedad => 
        novedad.estado === 'error' || novedad.estado_solucion === 'error'
      )
      .map(novedad => novedad.visita_id);
    
    // Combinar y eliminar duplicados
    const todosLosIds = [...visitaIdsConErrorDirecto, ...visitaIdsConNovedadesError];
    return [...new Set(todosLosIds)];
  },
);

// Selector que obtiene todas las visitas (objetos completos) que tienen algún tipo de error
export const selectVisitasConErrorCompleto = createSelector(
  [
    selectVisitas, // Todas las visitas
    selectVisitaIdsConErrorCompleto, // IDs con error completo
  ],
  (visitas, idsConError) => {
    return visitas.filter(visita => idsConError.includes(visita.id));
  },
);

// Selector para obtener una visita específica por ID
export const selectVisitaPorId = (visitaId: number) =>
  createSelector(selectVisitas, visitas =>
    visitas.find(visita => visita.id === visitaId),
  );

// Selector para verificar si las visitas seleccionadas tienen datos guardados para reintento
// Solo incluye visitas que son retryables (es_error_retryable !== false)
export const selectVisitasSeleccionadasConDatosGuardados = createSelector(
  [selectVisitasConError, selectVisitasSeleccionadas],
  (visitas, seleccionadas) =>
    visitas
      .filter(visita => seleccionadas.includes(visita.id))
      .filter(
        visita =>
          visita.estado === 'error' &&
          visita.datos_formulario_guardados &&
          visita.es_error_retryable !== false, // Solo retryables
      ),
);

/**
 * Selector cross-module que obtiene visitas que tienen novedades asociadas
 * Combina datos del módulo visita con datos del módulo novedad
 */
export const selectVisitasConNovedades = createSelector(
  [selectVisitas, selectVisitaIdsWithNovedades],
  (visitas, visitaIdsWithNovedades) =>
    visitas.filter(
      visita =>
        visitaIdsWithNovedades.includes(visita.id) && visita.estado_novedad,
    ),
);

/**
 * Selector para detectar si hay visitas que impiden la desvinculación
 * Incluye visitas con errores (error) y visitas que tienen novedades con error
 */
export const selectVisitasQueImpidenDesvinculacion = createSelector(
  [
    selectVisitas, // Todas las visitas
    (state: RootState) => state.novedad.novedades, // Novedades del estado
  ],
  (visitas, novedades) => {
    // Visitas con error directo
    const visitasConErrorDirecto = visitas.filter(visita => visita.estado === 'error');
    
    // IDs de visitas que tienen novedades con error (estado o estado_solucion)
    const visitaIdsConNovedadesError = novedades
      .filter(novedad => 
        novedad.estado === 'error' || novedad.estado_solucion === 'error'
      )
      .map(novedad => novedad.visita_id);
    
    // Visitas que tienen novedades con error
    const visitasConNovedadesError = visitas.filter(visita => 
      visitaIdsConNovedadesError.includes(visita.id)
    );
    
    // Combinar ambos tipos y eliminar duplicados
    const todasLasVisitasConError = [...visitasConErrorDirecto, ...visitasConNovedadesError];
    const visitasUnicas = todasLasVisitasConError.filter((visita, index, array) => 
      array.findIndex(v => v.id === visita.id) === index
    );
    
    return visitasUnicas;
  },
);

/**
 * Selector para verificar si se puede desvincular (no hay entregas pendientes ni errores)
 */
export const selectPuedeDesvincular = createSelector(
  [selectVisitasQueImpidenDesvinculacion],
  (visitasQueImpiden) => visitasQueImpiden.length === 0,
);

/**
 * Selector para obtener el conteo de visitas que impiden la desvinculación
 */
export const selectConteoVisitasQueImpidenDesvinculacion = createSelector(
  [
    selectVisitasQueImpidenDesvinculacion,
    (state: RootState) => state.novedad.novedades, // Para contar novedades con error
  ],
  (visitasQueImpiden, novedades) => {
    // Contar visitas con error directo
    const visitasConErrorDirecto = visitasQueImpiden.filter(v => v.estado === 'error').length;

    // Contar novedades con error (estado o estado_solucion)
    const novedadesConError = novedades.filter(novedad =>
      novedad.estado === 'error' || novedad.estado_solucion === 'error'
    ).length;

    return {
      total: visitasQueImpiden.length,
      visitasConError: visitasConErrorDirecto,
      novedadesConError: novedadesConError,
    };
  },
);

/**
 * Selector para obtener visitas con error que son retryables.
 * Base: `selectVisitasConError` (visitas con `estado === 'error'` directo).
 * El cross-module con novedades NO aplica aca — una novedad en error es otro
 * flujo, no se re-procesa por "Reintentar".
 */
export const selectVisitasConErrorRetryables = createSelector(
  [selectVisitasConError],
  visitasConError =>
    visitasConError.filter(
      visita => visita.es_error_retryable !== false, // undefined cuenta como retryable por retrocompat
    ),
);

/**
 * Selector para obtener IDs de visitas con error retryables
 */
export const selectVisitaIdsConErrorRetryables = createSelector(
  [selectVisitasConErrorRetryables],
  visitasRetryables => visitasRetryables.map(visita => visita.id),
);

/**
 * Selector para obtener visitas con error que NO son retryables
 * Filtra solo visitas donde es_error_retryable === false
 */
export const selectVisitasConErrorNoRetryables = createSelector(
  [selectVisitasConError],
  visitasConError =>
    visitasConError.filter(
      visita => visita.es_error_retryable === false, // Solo errores explícitamente no-retryables
    ),
);

/**
 * Selector para obtener visitas seleccionadas que NO son retryables
 * Útil para mostrar botón "Anular" cuando hay visitas no-retryables seleccionadas
 */
export const selectVisitasSeleccionadasNoRetryables = createSelector(
  [selectVisitas, selectVisitasSeleccionadas],
  (visitas, seleccionadas) =>
    visitas
      .filter(visita => seleccionadas.includes(visita.id))
      .filter(visita => 
        visita.estado === 'error' && visita.es_error_retryable === false
      ),
);

/**
 * Selector para verificar si hay visitas seleccionadas que son no-retryables
 * Útil para mostrar/ocultar botón "Anular"
 */
export const selectHayVisitasSeleccionadasNoRetryables = createSelector(
  [selectVisitasSeleccionadasNoRetryables],
  visitasNoRetryables => visitasNoRetryables.length > 0,
);
