import { createAsyncThunk } from '@reduxjs/toolkit';
import { settingsRepository } from '../../repositories/settings.repository';
import { AppSettings } from '../../interfaces/settings.interface';

export const loadSettingsThunk = createAsyncThunk(
  'settings/loadSettings',
  async (_, { rejectWithValue }) => {
    try {
      const settings = await settingsRepository.getSettings();
      return settings;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Error loading settings');
    }
  }
);

export const updateSettingsThunk = createAsyncThunk(
  'settings/updateSettings',
  async (settings: Partial<AppSettings>, { rejectWithValue }) => {
    try {
      await settingsRepository.updateSettings(settings);
      return settings;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Error updating settings');
    }
  }
);

export const setSubdominioThunk = createAsyncThunk(
  'settings/setSubdominio',
  async (subdominio: string, { rejectWithValue }) => {
    try {
      await settingsRepository.setSubdominio(subdominio);
      return { subdominio };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Error setting subdominio');
    }
  }
);

export const setDespachoThunk = createAsyncThunk(
  'settings/setDespacho',
  async (despacho: string, { rejectWithValue }) => {
    try {
      await settingsRepository.setDespacho(despacho);
      return { despacho };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Error setting despacho');
    }
  }
);

export const setOrdenEntregaThunk = createAsyncThunk(
  'settings/setOrdenEntrega',
  async (ordenEntrega: string, { rejectWithValue }) => {
    try {
      await settingsRepository.setOrdenEntrega(ordenEntrega);
      return { ordenEntrega };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Error setting orden entrega');
    }
  }
);

export const clearSettingsThunk = createAsyncThunk(
  'settings/clearSettings',
  async (_, { rejectWithValue }) => {
    try {
      await settingsRepository.clearSettings();
      return;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Error clearing settings');
    }
  }
);
