export interface AppSettings {
  subdominio: string | null;
  despacho: string | null;
  ordenEntrega: string | null;
}

export interface SettingsState {
  settings: AppSettings;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}
