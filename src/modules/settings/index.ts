// Interfaces
export type { AppSettings, SettingsState } from './interfaces/settings.interface';

// Constants
export { STORAGE_KEYS } from './constants/settings.constants';

// Repository
export { settingsRepository } from './repositories/settings.repository';

// Thunks
export {
  loadSettingsThunk,
  updateSettingsThunk,
  setSubdominioThunk,
  setDespachoThunk,
  setOrdenEntregaThunk,
  clearSettingsThunk,
} from './store/thunk/settings.thunk';

// Slice actions
export {
  resetError,
  setSettingsLocal,
  resetSettings,
} from './store/slice/settings.slice';

// Selectors
export {
  selectSettings,
  selectSettingsStatus,
  selectSettingsError,
  selectSubdominio,
  selectDespacho,
  selectOrdenEntrega,
  selectIsSettingsLoading,
  selectHasSettingsError,
  selectAreSettingsConfigured,
  selectIsAppReady,
} from './store/selector/settings.selector';
