import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "../../../../store/root-reducer";

const selectVisitasRootState = (state: RootState) => state.visita;

export const selectVisitas = createSelector(selectVisitasRootState, (visita) => visita.visitas);

export const selectIsLoading = createSelector(selectVisitasRootState, (visita) => visita.status === 'loading');

export const selectIsSucceeded = createSelector(selectVisitasRootState, (visita) => visita.status === 'succeeded');

// Selectores para el estado de selección
export const selectVisitasSeleccionadas = createSelector(selectVisitasRootState, (visita) => visita.seleccionadas);

// Selector optimizado para verificar si una visita específica está seleccionada
export const selectIsVisitaSeleccionada = (visitaId: number) => 
  createSelector(selectVisitasSeleccionadas, (seleccionadas) => seleccionadas.includes(visitaId));

// Selector para obtener el número total de visitas seleccionadas
export const selectTotalVisitasSeleccionadas = createSelector(selectVisitasSeleccionadas, (seleccionadas) => seleccionadas.length);

// Selector para verificar si todas las visitas están seleccionadas
export const selectTodasVisitasSeleccionadas = createSelector(
  [selectVisitas, selectVisitasSeleccionadas],
  (visitas, seleccionadas) => visitas.length > 0 && visitas.length === seleccionadas.length
);

// Selector para verificar si hay alguna visita seleccionada
export const selectHayVisitasSeleccionadas = createSelector(selectVisitasSeleccionadas, (seleccionadas) => seleccionadas.length > 0);