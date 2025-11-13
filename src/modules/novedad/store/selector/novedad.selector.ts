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
  novedades => {
    const uniqueVisitaIds = [
      ...new Set(novedades.map(novedad => novedad.visita_id)),
    ];
    return uniqueVisitaIds;
  },
);

// === SELECTORES DE SELECCIÓN ===

// Selector para obtener novedades con error
export const selectNovedadesConEstadosError = createSelector(
  selectNovedadRootState,
  ({ novedades }) =>
    novedades.filter(
      novedad =>
        novedad.estado === 'error' || novedad.estado_solucion === 'error',
    ),
);

export const selectNovedadesConError = createSelector(
  selectNovedadRootState,
  ({ novedades }) =>
    novedades.filter(
      novedad =>
        novedad.estado === 'error',
    ),
);

export const selectNovedadesConSolucionError = createSelector(
  selectNovedadRootState,
  ({ novedades }) =>
    novedades.filter(
      novedad =>
        novedad.estado_solucion === 'error',
    ),
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

// === SELECTORES CROSS-MODULE ===

// Selector que combina novedad con datos de la visita asociada
export const selectNovedadConVisita = (novedadId: string) =>
  createSelector(
    [selectNovedades, (state: RootState) => state.visita.visitas],
    (novedades, visitas) => {
      const novedad = novedades.find(n => n.id === novedadId);
      if (!novedad) return null;

      const visita = visitas.find(v => v.id === novedad.visita_id);
      return {
        novedad,
        visita: visita || null,
      };
    },
  );

// Selector para obtener el visita_id de una novedad específica
export const selectVisitaIdByNovedadId = (novedadId: string) =>
  createSelector([selectNovedades], novedades => {
    const novedad = novedades.find(n => n.id === novedadId);
    return novedad?.visita_id || null;
  });

// Selector que obtiene todas las novedades con sus visitas asociadas
export const selectNovedadesConVisitas = createSelector(
  [selectNovedades, (state: RootState) => state.visita.visitas],
  (novedades, visitas) => {
    console.log('Novedades', novedades);

    return novedades.map(novedad => {
      const visita = visitas.find(v => v.id === novedad.visita_id);
      return {
        novedad,
        visita: visita || null,
      };
    });
  },
);
