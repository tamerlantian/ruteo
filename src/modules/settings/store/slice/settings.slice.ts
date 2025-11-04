import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SettingsState, AppSettings } from '../../interfaces/settings.interface';
import {
  loadSettingsThunk,
  updateSettingsThunk,
  setSubdominioThunk,
  setDespachoThunk,
  setOrdenEntregaThunk,
  clearSettingsThunk,
} from '../thunk/settings.thunk';

const initialState: SettingsState = {
  settings: {
    subdominio: null,
    despacho: null,
    ordenEntrega: null,
  },
  status: 'idle',
  error: null,
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    resetError: (state) => {
      state.error = null;
    },
    setSettingsLocal: (state, action: PayloadAction<Partial<AppSettings>>) => {
      state.settings = { ...state.settings, ...action.payload };
    },
    resetSettings: (state) => {
      state.settings = {
        subdominio: null,
        despacho: null,
        ordenEntrega: null,
      };
      state.status = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Load Settings
    builder
      .addCase(loadSettingsThunk.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loadSettingsThunk.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.settings = action.payload;
        state.error = null;
      })
      .addCase(loadSettingsThunk.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });

    // Update Settings
    builder
      .addCase(updateSettingsThunk.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(updateSettingsThunk.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.settings = { ...state.settings, ...action.payload };
        state.error = null;
      })
      .addCase(updateSettingsThunk.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });

    // Set Subdominio
    builder
      .addCase(setSubdominioThunk.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(setSubdominioThunk.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.settings.subdominio = action.payload.subdominio;
        state.error = null;
      })
      .addCase(setSubdominioThunk.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });

    // Set Despacho
    builder
      .addCase(setDespachoThunk.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(setDespachoThunk.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.settings.despacho = action.payload.despacho;
        state.error = null;
      })
      .addCase(setDespachoThunk.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });

    // Set Orden Entrega
    builder
      .addCase(setOrdenEntregaThunk.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(setOrdenEntregaThunk.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.settings.ordenEntrega = action.payload.ordenEntrega;
        state.error = null;
      })
      .addCase(setOrdenEntregaThunk.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });

    // Clear Settings
    builder
      .addCase(clearSettingsThunk.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(clearSettingsThunk.fulfilled, (state) => {
        state.status = 'succeeded';
        state.settings = {
          subdominio: null,
          despacho: null,
          ordenEntrega: null,
        };
        state.error = null;
      })
      .addCase(clearSettingsThunk.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });
  },
});

export const { resetError, setSettingsLocal, resetSettings } = settingsSlice.actions;
export default settingsSlice.reducer;
