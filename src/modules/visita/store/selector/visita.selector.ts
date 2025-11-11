import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../../../../store/root-reducer';
import { selectVisitaIdsWithNovedades } from '../../../novedad/store/selector/novedad.selector';

const selectVisitasRootState = (state: RootState) => state.visita;

export const selectVisitas = createSelector(
  selectVisitasRootState,
  visita => visita.visitas,
);

export const selectVisitasPendientes = createSelector(
  [selectVisitas, selectVisitaIdsWithNovedades],
  (visitas, visitaIdsWithNovedades) =>
    visitas.filter(visita => 
      !visita.estado_entregado && 
      !visita.estado_error && 
      !visitaIdsWithNovedades.includes(visita.id)
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
  ({ visitas }) => visitas.filter(visita => visita.estado_error),
);

// Selector para obtener una visita específica por ID
export const selectVisitaPorId = (visitaId: number) =>
  createSelector(selectVisitas, visitas =>
    visitas.find(visita => visita.id === visitaId),
  );

// Selector para verificar si las visitas seleccionadas tienen datos guardados para reintento
export const selectVisitasSeleccionadasConDatosGuardados = createSelector(
  [selectVisitasConError, selectVisitasSeleccionadas],
  (visitas, seleccionadas) =>
    visitas
      .filter(visita => seleccionadas.includes(visita.id))
      .filter(
        visita => visita.estado_error && visita.datos_formulario_guardados,
      ),
);

/**
 * Selector cross-module que obtiene visitas que tienen novedades asociadas
 * Combina datos del módulo visita con datos del módulo novedad
 */
export const selectVisitasConNovedades = createSelector(
  [selectVisitas, selectVisitaIdsWithNovedades],
  (visitas, visitaIdsWithNovedades) =>
    visitas.filter(visita => visitaIdsWithNovedades.includes(visita.id)),
);
