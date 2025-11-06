import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../../../../store/root-reducer';

const selectVisitasRootState = (state: RootState) => state.visita;

export const selectVisitas = createSelector(
  selectVisitasRootState,
  visita => visita.visitas,
);

export const selectVisitasPendientes = createSelector(
  selectVisitasRootState,
  ({ visitas }) => visitas.filter(visita => !visita.estado_entregado && !visita.estado_error),
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

// Selector para verificar si hay alguna visita seleccionada
export const selectHayVisitasSeleccionadas = createSelector(
  selectVisitasSeleccionadas,
  seleccionadas => seleccionadas.length > 0,
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

// Selector para obtener los datos del formulario guardados de una visita específica
export const selectDatosFormularioGuardados = (visitaId: number) =>
  createSelector(selectVisitaPorId(visitaId), visita =>
    visita?.datos_formulario_guardados,
  );

// Selector para verificar si las visitas seleccionadas tienen datos guardados para reintento
export const selectVisitasSeleccionadasConDatosGuardados = createSelector(
  [selectVisitasConError, selectVisitasSeleccionadas],
  (visitas, seleccionadas) =>
    visitas
      .filter(visita => seleccionadas.includes(visita.id))
      .filter(visita => visita.estado_error && visita.datos_formulario_guardados),
);
