import BackgroundGeolocation, {
  Location,
} from 'react-native-background-geolocation';
import { locationTrackingRepository } from '../repositories/location-tracking.repository';
import {
  BackgroundGeolocationState,
  TrackingConfig,
} from '../interfaces/background-geolocation.interface';
import { LocationTrackingData } from '../interfaces/location.interface';

/**
 * Servicio para manejar background geolocation usando react-native-background-geolocation
 * Implementa el patrón Singleton para evitar múltiples instancias
 *
 * IMPORTANTE: Sigue el patrón oficial de la librería:
 * - .ready() se llama UNA SOLA VEZ al iniciar la app
 * - .start()/.stop() controlan el tracking
 */
export class BackgroundGeolocationService {
  private static instance: BackgroundGeolocationService;
  private state: BackgroundGeolocationState = {
    isEnabled: false,
    isTracking: false,
    hasPermission: false,
    errorCount: 0,
  };
  private isReady: boolean = false;

  private constructor() {
    // NO inicializar eventos aquí - se hace en ready()
  }

  /**
   * Obtiene la instancia única del servicio
   */
  public static getInstance(): BackgroundGeolocationService {
    if (!BackgroundGeolocationService.instance) {
      BackgroundGeolocationService.instance =
        new BackgroundGeolocationService();
    }
    return BackgroundGeolocationService.instance;
  }

  /**
   * Configuración ultra-mínima para background geolocation
   * Solo ubicación básica sin funcionalidades adicionales
   * DEBE llamarse UNA SOLA VEZ al iniciar la app
   */
  private getDefaultConfig() {
    return {
      // Solo configuración básica de ubicación
      desiredAccuracy: BackgroundGeolocation.DESIRED_ACCURACY_HIGH,
      distanceFilter: 10,

      // Configuración crítica para segundo plano
      stopOnTerminate: false,
      startOnBoot: true,

      enableHeadless: true,
      foregroundService: true,
      notification: {
        title: 'Rastreo activo',
        text: 'Tu ubicación se está registrando ',
        channelName: 'Location',
        priority: BackgroundGeolocation.NOTIFICATION_PRIORITY_HIGH,
      },

      // Desactivar funcionalidades que pueden solicitar permisos adicionales
      // disableMotionActivityUpdates: true,  // Evita permisos de motion
      // disableLocationAuthorizationAlert: true,  // Evita alertas automáticas

      // Debugging mínimo
      // debug: false,  // Desactivar completamente para evitar logs excesivos
      // logLevel: BackgroundGeolocation.LOG_LEVEL_OFF,
    };
  }

  /**
   * Inicializa el servicio de background geolocation
   * DEBE llamarse UNA SOLA VEZ al iniciar la app (en App.tsx o similar)
   */
  public async ready(): Promise<void> {
    if (this.isReady) {
      console.log(
        '📍 [BackgroundGeolocation] Ya está inicializado, omitiendo ready()',
      );
      return;
    }

    try {
      console.log(
        '📍 [BackgroundGeolocation] Llamando ready() - SOLO UNA VEZ por launch',
      );

      const config = this.getDefaultConfig();


      // Configurar event listeners
      this.setupEventListeners();

      // Llamar ready() UNA SOLA VEZ
      await BackgroundGeolocation.ready(config);

      this.isReady = true;
      this.state.isEnabled = true;
      this.state.hasPermission = true;

      console.log('📍 [BackgroundGeolocation] Ready completado correctamente');
    } catch (error) {
      console.error('📍 [BackgroundGeolocation] Error en ready():', error);
      this.isReady = false;
      this.state.isEnabled = false;
      this.state.hasPermission = false;
      throw error;
    }
  }

  /**
   * Configura los event listeners (solo después de ready())
   */
  private setupEventListeners(): void {
    console.log('📍 [BackgroundGeolocation] Configurando event listeners...');

    // Event listener para nuevas ubicaciones
    BackgroundGeolocation.onLocation(this.onLocation.bind(this));

    // Event listener para errores
    BackgroundGeolocation.onProviderChange(event => {
      console.log('📍 [BackgroundGeolocation] Provider change:', event);
      this.state.hasPermission = event.gps && event.network && event.enabled;
    });
  }

  /**
   * Maneja nuevas ubicaciones recibidas
   */
  private async onLocation(location: Location): Promise<void> {
    console.log('📍 [BackgroundGeolocation] Nueva ubicación:', location);

    // Validar que la ubicación tenga coordenadas válidas
    if (!location || !location.coords) {
      console.warn(
        '📍 [BackgroundGeolocation] Ubicación sin coordenadas, ignorando...',
      );
      return;
    }

    // Validar que las coordenadas sean válidas
    if (
      typeof location.coords.latitude !== 'number' ||
      typeof location.coords.longitude !== 'number' ||
      isNaN(location.coords.latitude) ||
      isNaN(location.coords.longitude)
    ) {
      console.warn(
        '📍 [BackgroundGeolocation] Coordenadas inválidas, ignorando...',
        location.coords,
      );
      return;
    }

    this.state.lastLocation = location;

    // Solo enviar si tenemos configuración de tracking
    if (this.state.schemaName && this.state.despacho && this.state.usuarioId) {
      try {
        await this.sendLocationToServer(location);
        this.state.errorCount = 0; // Reset error count on success
      } catch (error) {
        console.error(
          '📍 [BackgroundGeolocation] Error enviando ubicación:',
          error,
        );
        this.state.errorCount++;
      }
    }
  }

  /**
   * Envía la ubicación al servidor usando el repository existente
   */
  private async sendLocationToServer(location: Location): Promise<void> {
    if (
      !this.state.schemaName ||
      !this.state.despacho ||
      !this.state.usuarioId
    ) {
      throw new Error('Configuración de tracking no establecida');
    }

    // Validación adicional de seguridad
    if (!location?.coords) {
      throw new Error('Ubicación sin coordenadas válidas');
    }

    // Formatear coordenadas para asegurar 15 decimales (requerido por API)
    const latitudOriginal = location.coords.latitude;
    const longitudOriginal = location.coords.longitude;
    const latitudFormateada = parseFloat(latitudOriginal.toFixed(15));
    const longitudFormateada = parseFloat(longitudOriginal.toFixed(15));

    console.log(
      '📍 [BackgroundGeolocation] Coordenadas - Original:',
      { lat: latitudOriginal, lng: longitudOriginal },
      'Formateadas:',
      { lat: latitudFormateada, lng: longitudFormateada }
    );

    const trackingData: LocationTrackingData = {
      latitud: latitudFormateada,
      longitud: longitudFormateada,
      despacho: this.state.despacho!,
      usuario_id: this.state.usuarioId!,
      schema: this.state.schemaName,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16), // YYYY-MM-DD HH:MM
      accuracy: location.coords.accuracy || 0, // Fallback para accuracy
    };

    console.log(
      '📍 [BackgroundGeolocation] Enviando al servidor:',
      trackingData,
    );

    const result = await locationTrackingRepository.sendLocationData(
      this.state.schemaName,
      trackingData,
    );

    console.log('📍 [BackgroundGeolocation] Respuesta del servidor:', result);
  }

  /**
   * Inicia el tracking para una orden específica
   * PREREQUISITO: ready() debe haber sido llamado previamente
   */
  public async startTracking(config: TrackingConfig): Promise<void> {
    if (!this.isReady) {
      throw new Error(
        'BackgroundGeolocation no está listo. Llama ready() primero en el bootstrap de la app.',
      );
    }

    try {
      console.log(
        '📍 [BackgroundGeolocation] Iniciando tracking para:',
        config,
      );

      // Guardar configuración de tracking
      this.state.schemaName = config.schemaName;
      this.state.despacho = config.despacho;
      this.state.usuarioId = config.usuarioId;

      // Configurar event listeners
      this.setupEventListeners();

      // Solo iniciar tracking (ready() ya fue llamado)
      await BackgroundGeolocation.start();

      this.state.isTracking = true;

      console.log('📍 [BackgroundGeolocation] Tracking iniciado correctamente');
    } catch (error) {
      console.error(
        '📍 [BackgroundGeolocation] Error iniciando tracking:',
        error,
      );
      this.state.isTracking = false;
      throw error;
    }
  }

  /**
   * Detiene el tracking
   */
  public async stopTracking(): Promise<void> {
    try {
      console.log('📍 [BackgroundGeolocation] Deteniendo tracking...');

      await BackgroundGeolocation.stop();

      this.state.isTracking = false;

      console.log('📍 [BackgroundGeolocation] Tracking detenido correctamente');
    } catch (error) {
      console.error(
        '📍 [BackgroundGeolocation] Error deteniendo tracking:',
        error,
      );
      throw error;
    }
  }

  /**
   * Limpia datos de tracking (para logout)
   * NO resetea ready() - eso solo se hace una vez por launch
   */
  public async cleanup(): Promise<void> {
    try {
      console.log('📍 [BackgroundGeolocation] Limpiando datos de tracking...');

      // Detener tracking si está activo
      if (this.state.isTracking) {
        await this.stopTracking();
      }

      // Limpiar solo datos de tracking, NO el estado ready
      this.state.schemaName = undefined;
      this.state.despacho = undefined;
      this.state.usuarioId = undefined;
      this.state.lastLocation = undefined;
      this.state.errorCount = 0;
      // NO tocar isReady - permanece true hasta el próximo launch

      BackgroundGeolocation.removeListeners();
      console.log('📍 [BackgroundGeolocation] Datos de tracking limpiados');
    } catch (error) {
      console.error('📍 [BackgroundGeolocation] Error limpiando:', error);
      throw error;
    }
  }

  /**
   * Obtiene el estado actual del servicio
   */
  public getState(): BackgroundGeolocationState {
    return { ...this.state };
  }
}

// Exportar instancia singleton
export const backgroundGeolocationService =
  BackgroundGeolocationService.getInstance();
