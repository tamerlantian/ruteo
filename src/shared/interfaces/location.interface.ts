/**
 * Coordenadas de ubicación
 */
export interface LocationCoordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number;
  altitudeAccuracy?: number;
  heading?: number;
  speed?: number;
  timestamp: number;
}

/**
 * Datos para enviar al endpoint de tracking
 */
export interface LocationTrackingData {
  latitud: number;
  longitud: number;
  despacho: number;
  usuario_id: number;
  schema: string;
  timestamp: string;
  accuracy?: number;
}

/**
 * Configuración del servicio de tracking
 */
export interface LocationTrackingConfig {
  /** Intervalo en milisegundos para enviar ubicación (default: 5000) */
  interval: number;
  /** Precisión requerida en metros (default: 100) */
  accuracy: number;
  /** Timeout para obtener ubicación en milisegundos (default: 15000) */
  timeout: number;
  /** Edad máxima de ubicación en milisegundos (default: 60000) */
  maximumAge: number;
}

/**
 * Estado del servicio de tracking
 */
export interface LocationTrackingState {
  isActive: boolean;
  isLocationEnabled: boolean;
  hasPermission: boolean;
  lastLocation?: LocationCoordinates;
  lastSentAt?: number;
  errorCount: number;
  config: LocationTrackingConfig;
}

/**
 * Resultado de solicitud de permisos de ubicación
 */
export interface LocationPermissionResult {
  granted: boolean;
  message?: string;
  canRequestAgain?: boolean;
}

/**
 * Opciones para obtener ubicación
 */
export interface LocationOptions {
  enableHighAccuracy: boolean;
  timeout: number;
  maximumAge: number;
}
