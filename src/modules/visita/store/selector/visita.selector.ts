import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "../../../../store/root-reducer";

const selectVisitasRootState = (state: RootState) => state.visita;

export const selectVisitas = createSelector(selectVisitasRootState, (visita) => visita.visitas);

export const selectIsLoading = createSelector(selectVisitasRootState, (visita) => visita.status === 'loading');

export const selectIsSucceeded = createSelector(selectVisitasRootState, (visita) => visita.status === 'succeeded');