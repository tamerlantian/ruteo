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
