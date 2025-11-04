/**
 * Settings Slice Usage Examples
 * 
 * This file demonstrates how to use the settings slice in your components
 */

import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import {
  loadSettingsThunk,
  updateSettingsThunk,
  setSubdominioThunk,
  setDespachoThunk,
  setOrdenEntregaThunk,
  clearSettingsThunk,
  selectSettings,
  selectIsSettingsLoading,
  selectAreSettingsConfigured,
  selectIsAppReady,
  resetError,
} from '../index';

// Example React component using the settings slice
export const SettingsExampleComponent = () => {
  const dispatch = useAppDispatch();
  
  // Selectors
  const settings = useAppSelector(selectSettings);
  const isLoading = useAppSelector(selectIsSettingsLoading);
  const areConfigured = useAppSelector(selectAreSettingsConfigured);
  const isAppReady = useAppSelector(selectIsAppReady);

  // Load settings on component mount
  const loadSettings = () => {
    dispatch(loadSettingsThunk());
  };

  // Update multiple settings at once
  const updateMultipleSettings = () => {
    dispatch(updateSettingsThunk({
      subdominio: 'new-subdomain',
      despacho: '123',
      ordenEntrega: 'ORD-456'
    }));
  };

  // Update individual settings
  const updateSubdominio = (subdominio: string) => {
    dispatch(setSubdominioThunk(subdominio));
  };

  const updateDespacho = (despacho: string) => {
    dispatch(setDespachoThunk(despacho));
  };

  const updateOrdenEntrega = (ordenEntrega: string) => {
    dispatch(setOrdenEntregaThunk(ordenEntrega));
  };

  // Clear all settings
  const clearAllSettings = () => {
    dispatch(clearSettingsThunk());
  };

  // Reset error state
  const handleResetError = () => {
    dispatch(resetError());
  };

  return {
    settings,
    isLoading,
    areConfigured,
    isAppReady,
    loadSettings,
    updateMultipleSettings,
    updateSubdominio,
    updateDespacho,
    updateOrdenEntrega,
    clearAllSettings,
    handleResetError,
  };
};

// Example usage in a thunk (like the visita thunk)
export const exampleThunkUsage = async (dispatch: any) => {
  // Save settings after successful operation
  await dispatch(updateSettingsThunk({
    subdominio: 'example-schema',
    despacho: '999',
    ordenEntrega: 'ORD-123'
  }));
  
  // Or update individual settings
  await dispatch(setSubdominioThunk('new-schema'));
  await dispatch(setDespachoThunk('888'));
};
