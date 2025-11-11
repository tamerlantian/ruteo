import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../../../../store/root-reducer';

const selectNovedadRootState = (state: RootState) => state.novedad;

export const selectNovedades = createSelector(
  selectNovedadRootState,
  ({ novedades }) => novedades,
);

/**
 * Selector que obtiene los IDs únicos de visitas que tienen novedades
 * Útil para filtros cross-module
 */
export const selectVisitaIdsWithNovedades = createSelector(
  selectNovedades,
  (novedades) => {
    const uniqueVisitaIds = [...new Set(novedades.map(novedad => novedad.visita_id))];
    return uniqueVisitaIds;
  },
);

// === SELECTORES DE SELECCIÓN ===

// Selector para obtener novedades con error
export const selectNovedadesConError = createSelector(
  selectNovedadRootState,
  ({ novedades }) => novedades.filter(novedad => novedad.estado_error),
);

// Selectores para el estado de selección
export const selectNovedadesSeleccionadas = createSelector(
  selectNovedadRootState,
  novedad => novedad.seleccionadas,
);

// Selector optimizado para verificar si una novedad específica está seleccionada
export const selectIsNovedadSeleccionada = (novedadId: string) =>
  createSelector(selectNovedadesSeleccionadas, seleccionadas =>
    seleccionadas.includes(novedadId),
  );

// Selector para obtener el número total de novedades seleccionadas
export const selectTotalNovedadesSeleccionadas = createSelector(
  selectNovedadesSeleccionadas,
  seleccionadas => seleccionadas.length,
);

// Selector para verificar si todas las novedades están seleccionadas
export const selectTodasNovedadesSeleccionadas = createSelector(
  [selectNovedades, selectNovedadesSeleccionadas],
  (novedades, seleccionadas) =>
    novedades.length > 0 && novedades.length === seleccionadas.length,
);

// Selector para obtener una novedad específica por ID
export const selectNovedadPorId = (novedadId: string) =>
  createSelector(selectNovedades, novedades =>
    novedades.find(novedad => novedad.id === novedadId),
  );
