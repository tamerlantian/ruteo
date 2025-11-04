import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../../../../store/root-reducer';

const selectSettingsState = (state: RootState) => state.settings;

export const selectSettings = createSelector(
  [selectSettingsState],
  (settingsState) => settingsState.settings
);

export const selectSettingsStatus = createSelector(
  [selectSettingsState],
  (settingsState) => settingsState.status
);

export const selectSettingsError = createSelector(
  [selectSettingsState],
  (settingsState) => settingsState.error
);

export const selectSubdominio = createSelector(
  [selectSettings],
  (settings) => settings.subdominio
);

export const selectDespacho = createSelector(
  [selectSettings],
  (settings) => settings.despacho
);

export const selectOrdenEntrega = createSelector(
  [selectSettings],
  (settings) => settings.ordenEntrega
);

export const selectIsSettingsLoading = createSelector(
  [selectSettingsStatus],
  (status) => status === 'loading'
);

export const selectHasSettingsError = createSelector(
  [selectSettingsError],
  (error) => error !== null
);

export const selectAreSettingsConfigured = createSelector(
  [selectSettings],
  (settings) => 
    settings.subdominio !== null && 
    settings.despacho !== null && 
    settings.ordenEntrega !== null
);

export const selectIsAppReady = createSelector(
  [selectSettings, selectSettingsStatus],
  (settings, status) => 
    status === 'succeeded' && 
    settings.subdominio !== null && 
    settings.despacho !== null
);
