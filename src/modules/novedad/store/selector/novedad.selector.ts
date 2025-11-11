import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../../../../store/root-reducer';

const selectNovedadRootState = (state: RootState) => state.novedad;

export const selectNovedades = createSelector(
  selectNovedadRootState,
  ({ novedades }) => novedades,
);
