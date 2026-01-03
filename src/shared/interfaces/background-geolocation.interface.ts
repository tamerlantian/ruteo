/**
 * Configuración para react-native-background-geolocation
 * Usa los tipos nativos de la librería
 */
export interface BackgroundGeolocationConfig {
  // Configuración básica
  desiredAccuracy?: number;
  stationaryRadius?: number;
  distanceFilter?: number;
  
  // Configuración de actividad
  stopTimeout?: number;
  activityRecognitionInterval?: number;
  
  // Configuración de red y persistencia
  autoSync?: boolean;
  maxDaysToPersist?: number;
  
  // Configuración de comportamiento
  stopOnTerminate?: boolean;
  startOnBoot?: boolean;
  enableHeadless?: boolean;
  
  // Configuración de debugging
  debug?: boolean;
  logLevel?: number;
}

/**
 * Estado del servicio de background geolocation
 */
export interface BackgroundGeolocationState {
  isEnabled: boolean;
  isTracking: boolean;
  hasPermission: boolean;
  schemaName?: string;
  despacho?: number;
  usuarioId?: number;
  lastLocation?: any; // Usamos any para evitar conflictos de tipos con la librería
  errorCount: number;
}

/**
 * Configuración de tracking para una orden específica
 */
export interface TrackingConfig {
  schemaName: string;
  despacho: number;
  usuarioId: number;
}
