import BackgroundGeolocation, {
  Location,
  Subscription,
} from 'react-native-background-geolocation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert, Linking, Platform, PermissionsAndroid } from 'react-native';
import { locationTrackingRepository } from '../repositories/location-tracking.repository';
import {
  BackgroundGeolocationState,
  TrackingConfig,
} from '../interfaces/background-geolocation.interface';
import { LocationTrackingData } from '../interfaces/location.interface';
import {
  reportLocationTrackingError,
  reportAsyncStorageError,
  withSentryErrorTracking,
  isPermissionError,
  addSentryBreadcrumb,
} from '../utils/sentry-helpers';

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
  private subscriptions: Subscription[] = [];

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
   * Configuración optimizada para background geolocation con HeadlessTask
   * Configurada para máxima supervivencia cuando la app está terminada
   * DEBE llamarse UNA SOLA VEZ al iniciar la app
   */
  private getDefaultConfig() {
    return {
      // Configuración básica de ubicación
      desiredAccuracy: BackgroundGeolocation.DESIRED_ACCURACY_HIGH,
      distanceFilter: 35, // Enviar cada 35 metros de movimiento
      stationaryRadius: 25, // Radio de detección de parada

      // CRÍTICO: Configuración para supervivencia de la app
      stopOnTerminate: false, // NO detener cuando la app se cierra
      startOnBoot: true, // Reiniciar después de reboot del dispositivo
      enableHeadless: true, // CRÍTICO: Habilitar HeadlessTask

      // 🔴 iOS: stopTimeout para asegurar creación de geofence estacionaria
      // Da tiempo a iOS para crear la geofence antes de terminar completamente
      stopTimeout: 5, // 5 minutos de timeout antes de detener completamente

      // 🔴 iOS: Deshabilitar detección automática de paradas (mejor para delivery)
      // Previene que el plugin detenga tracking cuando el vehículo está brevemente parado
      disableStopDetection: true,

      // ========================
      // 🧠 Android Foreground Service
      // ========================
      foregroundService: true,

      // 🔴 iOS: Para apps de delivery, solicitar Always desde el inicio
      // Android: Always desde el inicio (requerido para background)
      locationAuthorizationRequest: 'Always',

      // 🔴 iOS - Alert customizado para permisos de ubicación "Always"
      locationAuthorizationAlert: {
        titleWhenNotEnabled: 'Permisos de Ubicación Requeridos',
        titleWhenOff: 'Ubicación Desactivada',
        instructions: 'Ruteo necesita acceso "Siempre" a tu ubicación para registrar entregas automáticamente.',
        cancelButton: 'Cancelar',
        settingsButton: 'Ir a Configuración'
      },

      // 🔴 CRÍTICO ANDROID 11+ - Justificación para redirect a Configuración
      // Android 11+ NO muestra "Allow all the time" automáticamente
      // Este diálogo redirige al usuario a Settings para seleccionar manualmente
      backgroundPermissionRationale: {
        title: "Permitir Ubicación Todo el Tiempo",
        message: "Para registrar entregas automáticamente incluso con la app cerrada, " +
                 "necesitamos que selecciones 'Permitir todo el tiempo' en Configuración.\n\n" +
                 "Esto es esencial para:\n" +
                 "• Registrar ubicaciones durante entregas\n" +
                 "• Optimizar tus rutas automáticamente\n" +
                 "• Ver tu progreso en tiempo real",
        positiveAction: 'Cambiar a Permitido Todo el Tiempo',  // Android 11+ redirige a Settings
        negativeAction: 'Ahora no'
      },

      notification: {
        title: 'Seguimiento activo',
        text: 'Compartiendo ubicación en segundo plano',
        priority: BackgroundGeolocation.NOTIFICATION_PRIORITY_HIGH,
        sticky: true, // Persistente
        channelName: 'Seguimiento de Ubicación',
      },

      autoSync: true,
      batchSync: false,

      activityType: BackgroundGeolocation.ACTIVITY_TYPE_AUTOMOTIVE_NAVIGATION, // Para delivery/ruteo

      // 🔴 CRÍTICO iOS - Prevenir suspensión automática de la app
      // ADVERTENCIA: Aumenta consumo de batería (~10-20%), pero es necesario para delivery
      // Permite detectar movimiento rápidamente (pocos metros) en lugar de requerir ~200m
      preventSuspend: Platform.OS === 'ios', // Solo en iOS
      pausesLocationUpdatesAutomatically: false, // Mantener ubicación activa

      // 🔴 iOS 13+ - Mostrar indicador de ubicación en background (transparencia)
      showsBackgroundLocationIndicator: true,

      // 🔴 iOS - Control manual de alertas de permisos
      disableLocationAuthorizationAlert: false, // Mantener alertas automáticas

      // 🔴 iOS - Configuración de heartbeat para casos estacionarios
      // Trabaja en conjunto con preventSuspend para mantener tracking activo
      heartbeatInterval: 60, // Ping cada 60 segundos cuando estacionario

      // 🔴 Habilitar explícitamente motion activity updates
      // Importante para optimizar tracking y batería en apps de delivery
      disableMotionActivityUpdates: false,

      // Configuración de persistencia y sincronización
      // autoSync: true, // Sincronizar automáticamente con el servidor
      maxDaysToPersist: 1, // Mantener ubicaciones por 1 día

      // Configuración de debugging (desactivar en producción)
      debug: __DEV__, // Solo en desarrollo
      logLevel: __DEV__
        ? BackgroundGeolocation.LOG_LEVEL_VERBOSE
        : BackgroundGeolocation.LOG_LEVEL_OFF,
    };
  }

  /**
   * Solicita permisos de notificación para Android 13+ (API 33+)
   */
  private async requestNotificationPermission(): Promise<boolean> {
    if (Platform.OS !== 'android') {
      return true; // iOS no necesita este permiso
    }

    try {
      if (Platform.Version >= 33) { // Android 13+
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
          {
            title: 'Permisos de Notificación',
            message: 'Ruteo necesita mostrar notificaciones para el seguimiento de ubicación en segundo plano.',
            buttonNeutral: 'Preguntar después',
            buttonNegative: 'Denegar',
            buttonPositive: 'Permitir',
          }
        );
        
        const isGranted = granted === PermissionsAndroid.RESULTS.GRANTED;
        console.log('📱 [Notification Permission]:', isGranted ? 'Granted' : 'Denied');
        return isGranted;
      }
      
      // Android < 13 no necesita este permiso
      return true;
    } catch (error) {
      console.warn('📱 [Notification Permission] Error:', error);
      // Don't report permission errors to Sentry (user choice)
      if (!isPermissionError(error)) {
        reportLocationTrackingError('startup', error, {
          phase: 'notification_permission',
          platform: 'android',
        });
      }
      return false;
    }
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

      // Solicitar permisos de notificación ANTES de configurar BackgroundGeolocation
      const hasNotificationPermission = await this.requestNotificationPermission();
      if (!hasNotificationPermission) {
        console.warn('📱 [BGS] Permisos de notificación denegados - las notificaciones pueden no aparecer');
      }

      // Configurar event listeners
      this.setupEventListeners();

      // Llamar ready() UNA SOLA VEZ
      await BackgroundGeolocation.ready(config);
      // NO solicitar permisos aquí - se solicitarán en startTracking() cuando sea necesario

      this.isReady = true;
      this.state.isEnabled = true;
      this.state.hasPermission = true;

      if (Platform.OS === 'android') {
        // Verificar permisos actuales en Android
        const fineLocation = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        const backgroundLocation = Platform.Version >= 29
          ? await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION)
          : true;

        console.log('📍 [Android] Estado de permisos:', {
          ACCESS_FINE_LOCATION: fineLocation,
          ACCESS_BACKGROUND_LOCATION: backgroundLocation,
          'Android Version': Platform.Version,
        });
      }

      console.log('📍 [BackgroundGeolocation] Ready completado correctamente');
    } catch (error) {
      console.error('📍 [BackgroundGeolocation] Error en ready():', error);
      this.isReady = false;
      this.state.isEnabled = false;
      this.state.hasPermission = false;

      // Report startup errors to Sentry (unless permission-related)
      if (!isPermissionError(error)) {
        reportLocationTrackingError('startup', error, {
          phase: 'ready',
          platform: Platform.OS,
        });
      }

      throw error;
    }
  }

  /**
   * Configura los event listeners usando patrón Subscription (mejores prácticas)
   * Previene duplicación de listeners y permite cleanup adecuado
   */
  private setupEventListeners(): void {
    console.log('📍 [BackgroundGeolocation] Configurando event listeners...');

    // Limpiar subscriptions anteriores para evitar duplicados
    this.removeEventListeners();

    try {
      // Event listener para nuevas ubicaciones (wrapped with Sentry tracking)
      this.subscriptions.push(
        BackgroundGeolocation.onLocation(
          withSentryErrorTracking(
            'onLocation',
            this.onLocation.bind(this),
            {
              module: 'geolocation',
              location: 'background-geolocation-service',
            },
            'error'
          )
        )
      );
      console.log('📍 [BackgroundGeolocation] Listener de ubicación configurado');

      // Event listener para cambios de proveedor (wrapped with Sentry tracking)
      this.subscriptions.push(
        BackgroundGeolocation.onProviderChange(
          withSentryErrorTracking(
            'onProviderChange',
            (event) => {
              console.log('📍 [BackgroundGeolocation] Provider change:', event);
              this.state.hasPermission = event.gps && event.network && event.enabled;
            },
            {
              module: 'geolocation',
              location: 'background-geolocation-service',
            },
            'warning'
          )
        )
      );

      // Event listener para cambios de autorización (wrapped with Sentry tracking)
      this.subscriptions.push(
        BackgroundGeolocation.onAuthorization(
          withSentryErrorTracking(
            'onAuthorization',
            (status: any) => {
              console.log('📍 Authorization status change:', status);
              if (status === BackgroundGeolocation.AUTHORIZATION_STATUS_DENIED) {
                console.warn('🚫 Ubicación denegada por iOS');
                this.showLocationPermissionAlert();
              }
            },
            {
              module: 'geolocation',
              location: 'background-geolocation-service',
            },
            'warning'
          )
        )
      );

      // 🔴 NUEVO: Event listener para heartbeat (casos estacionarios, wrapped with Sentry)
      this.subscriptions.push(
        BackgroundGeolocation.onHeartbeat(
          withSentryErrorTracking(
            'onHeartbeat',
            (event) => {
              console.log('📍 [BackgroundGeolocation] Heartbeat:', event);

              // Opcional: solicitar ubicación actual en heartbeat para casos estacionarios
              if (this.hasValidTrackingConfig()) {
                BackgroundGeolocation.getCurrentPosition({
                  samples: 1,
                  persist: true,
                  timeout: 30
                }).then(location => {
                  console.log('📍 [BackgroundGeolocation] Heartbeat location:', location);
                  this.onLocation(location);
                }).catch(error => {
                  console.warn('📍 [BackgroundGeolocation] Error en heartbeat location:', error);
                  // Report heartbeat location errors as warnings
                  reportLocationTrackingError('runtime', error, {
                    phase: 'heartbeat_getCurrentPosition',
                    hasValidConfig: this.hasValidTrackingConfig(),
                  });
                });
              }
            },
            {
              module: 'geolocation',
              location: 'background-geolocation-service',
            },
            'warning'
          )
        )
      );

      // 🔴 iOS CRÍTICO: Event listener para geofences (wrapped with Sentry)
      // Este evento confirma que iOS creó el geofence estacionario y reactiva la app
      this.subscriptions.push(
        BackgroundGeolocation.onGeofence(
          withSentryErrorTracking(
            'onGeofence',
            (event) => {
              console.log('📍 [BackgroundGeolocation] 🎯 Geofence event (iOS app reactivation):', event);
              console.log('📍 [BackgroundGeolocation] 🎯 Geofence action:', event.action); // ENTER o EXIT
              console.log('📍 [BackgroundGeolocation] 🎯 Geofence identifier:', event.identifier);

              // Si es EXIT del geofence estacionario, iOS acaba de reactivar la app
              if (event.action === 'EXIT' && event.identifier === 'TSLocationManager') {
                console.log('✅ [BackgroundGeolocation] iOS reactivó la app desde estado terminado');
                console.log('✅ [BackgroundGeolocation] Geofence estacionaria funcionando correctamente');
                addSentryBreadcrumb(
                  'geolocation',
                  'iOS app reactivated from geofence exit',
                  { identifier: event.identifier },
                  'info'
                );
              }
            },
            {
              module: 'geolocation',
              location: 'background-geolocation-service',
            },
            'warning'
          )
        )
      );

      // 🔴 iOS: Event listener para cambios de estado del plugin (wrapped with Sentry)
      // Permite monitorear cuando iOS crea/destruye el geofence estacionario
      this.subscriptions.push(
        BackgroundGeolocation.onEnabledChange(
          withSentryErrorTracking(
            'onEnabledChange',
            (isEnabled) => {
              console.log('📍 [BackgroundGeolocation] Estado enabled cambió:', isEnabled);
              if (!isEnabled && Platform.OS === 'ios') {
                console.log('⚠️ [BackgroundGeolocation] iOS detuvo tracking - verificando geofence estacionaria...');
                // El plugin debería haber creado el geofence estacionario antes de desactivarse
                addSentryBreadcrumb(
                  'geolocation',
                  'iOS tracking stopped - stationary geofence should be created',
                  { isEnabled },
                  'info'
                );
              }
            },
            {
              module: 'geolocation',
              location: 'background-geolocation-service',
            },
            'warning'
          )
        )
      );

      console.log(
        `📍 [BackgroundGeolocation] ${this.subscriptions.length} listeners configurados correctamente`
      );
    } catch (error) {
      console.warn(
        '📍 [BackgroundGeolocation] Error configurando listeners:',
        error,
      );
      // No lanzar error, continuar con el tracking
    }
  }

  /**
   * Remueve todos los event listeners usando patrón Subscription
   */
  private removeEventListeners(): void {
    console.log(`📍 [BackgroundGeolocation] Removiendo ${this.subscriptions.length} listeners...`);
    this.subscriptions.forEach(subscription => subscription.remove());
    this.subscriptions = [];
  }

  /**
   * Validación mejorada de coordenadas
   */
  private isValidLocation(location: Location): boolean {
    if (!location?.coords) return false;
    
    const { latitude, longitude, accuracy } = location.coords;
    
    // Validaciones básicas
    if (typeof latitude !== 'number' || typeof longitude !== 'number') return false;
    if (isNaN(latitude) || isNaN(longitude)) return false;
    if (latitude === 0 && longitude === 0) return false;
    
    // Validaciones de rango
    if (latitude < -90 || latitude > 90) return false;
    if (longitude < -180 || longitude > 180) return false;
    
    // Validación de precisión (opcional)
    if (accuracy && accuracy > 1000) {
      console.warn('📍 [BackgroundGeolocation] Baja precisión:', accuracy, 'm');
      // Aceptar con warning, no rechazar
    }
    
    return true;
  }

  /**
   * Maneja nuevas ubicaciones recibidas con validación mejorada
   */
  private async onLocation(location: Location): Promise<void> {
    console.log('📍 [BGS] Nueva ubicación recibida:', {
      lat: location.coords?.latitude,
      lng: location.coords?.longitude,
      accuracy: location.coords?.accuracy,
    });

    // Usar validación mejorada
    if (!this.isValidLocation(location)) {
      console.warn('📍 [BGS] Ubicación inválida, ignorando...', location);
      return;
    }

    this.state.lastLocation = location;

    // MEJORAR: Validación con logging detallado
    if (!this.state.schemaName || !this.state.despacho || !this.state.usuarioId) {
      console.warn('❌ [BGS] Config de tracking INCOMPLETA, descartando ubicación');
      console.warn('❌ Estado actual:', {
        schemaName: this.state.schemaName || 'FALTA',
        despacho: this.state.despacho || 'FALTA',
        usuarioId: this.state.usuarioId || 'FALTA',
        isTracking: this.state.isTracking,
      });
      console.warn('⚠️ PROBABLE CAUSA: App se reinició y no se restauró tracking');
      console.warn('⚠️ SOLUCIÓN: Verificar que useRestoreTracking() se ejecutó correctamente');
      return;
    }

    try {
      console.log('📍 [BGS] Enviando ubicación al servidor...');
      await this.sendLocationToServer(location);
      this.state.errorCount = 0;
      console.log('✅ [BGS] Ubicación enviada exitosamente');
    } catch (error) {
      console.error('📍 [BGS] Error enviando ubicación:', error);
      this.state.errorCount++;

      // Report submission errors only if errorCount crosses threshold (avoid spam)
      if (this.state.errorCount >= 3) {
        reportLocationTrackingError('submission', error, {
          errorCount: this.state.errorCount,
          hasValidConfig: this.hasValidTrackingConfig(),
          schemaName: this.state.schemaName,
          despacho: this.state.despacho,
        });
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
      { lat: latitudFormateada, lng: longitudFormateada },
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
   *
   * Implementa patrón de upgrade progresivo:
   * - Primera vez: solicita upgrade de WhenInUse a Always (iOS)
   * - Subsecuentes: verifica y recuerda si es necesario
   */
  public async startTracking(config: TrackingConfig): Promise<void> {
    if (!this.isReady) {
      throw new Error(
        'BackgroundGeolocation no está listo. Llama ready() primero en el bootstrap de la app.',
      );
    }

    if (this.state.isTracking) {
      console.log('📍 [BackgroundGeolocation] Ya está tracking, omitiendo...');
      return;
    }

    try {
      console.log(
        '📍 [BackgroundGeolocation] Iniciando tracking para:',
        config,
      );

      // 🔴 Solicitar permisos según plataforma antes de iniciar tracking
      if (Platform.OS === 'ios') {
        console.log('📍 [iOS] Verificando permisos antes de iniciar tracking...');
        // Como ya solicitamos "Always" desde ready(), solo verificamos el estado
        const authorizationStatus = await BackgroundGeolocation.requestPermission();

        if (authorizationStatus === BackgroundGeolocation.AUTHORIZATION_STATUS_ALWAYS) {
          console.log('✅ [iOS] Permisos Always confirmados - tracking completo disponible');
        } else if (authorizationStatus === BackgroundGeolocation.AUTHORIZATION_STATUS_WHEN_IN_USE) {
          console.log('⚠️ [iOS] Solo WhenInUse - tracking limitado a app en uso');
          console.log('💡 [iOS] Usuario puede cambiar a "Siempre" en Configuración > Ruteo > Ubicación');
        } else {
          console.warn('🚫 [iOS] Sin permisos de ubicación');
        }
        // Continuar de todas formas, tracking funcionará según permisos disponibles
      } else if (Platform.OS === 'android') {
        console.log('📍 [Android] Verificando permisos antes de iniciar tracking...');
        const hasBackgroundLocation = await this.requestBackgroundLocationAndroid();

        if (hasBackgroundLocation) {
          console.log('✅ [Android] Permisos de ubicación en segundo plano confirmados');
        } else {
          console.log('⚠️ [Android] Sin permisos de background - tracking limitado');
          console.log('⚠️ [Android] Usuario puede habilitar "Allow all the time" en Configuración');
          // Continuar de todas formas - el usuario puede cambiar permisos después
        }
      }

      // Verificar estado actual del plugin
      const currentState = await BackgroundGeolocation.getState();
      console.log('📍 [BackgroundGeolocation] Estado actual del plugin:', currentState);

      // Guardar configuración de tracking en estado interno
      this.state.schemaName = config.schemaName;
      this.state.despacho = config.despacho;
      this.state.usuarioId = config.usuarioId;

      // CRÍTICO: Guardar config completa en AsyncStorage para HeadlessTask y restauración
      try {
        await AsyncStorage.multiSet([
          ['usuario_id', config.usuarioId.toString()],
          ['tracking_schema', config.schemaName],
          ['tracking_despacho', config.despacho.toString()],
        ]);
        console.log('📍 [BGS] Config completa guardada:', {
          usuarioId: config.usuarioId,
          schemaName: config.schemaName,
          despacho: config.despacho
        });
      } catch (storageError) {
        console.error('📍 [BGS] Error guardando config en AsyncStorage:', storageError);
        reportAsyncStorageError('multiSet', storageError, {
          keys: ['usuario_id', 'tracking_schema', 'tracking_despacho'],
          phase: 'startTracking',
        });
        // Don't throw - tracking can still work without persistence
      }

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

      // Report tracking startup errors (unless permission-related)
      if (!isPermissionError(error)) {
        reportLocationTrackingError('startup', error, {
          phase: 'startTracking',
          schemaName: config.schemaName,
          despacho: config.despacho,
          platform: Platform.OS,
        });
      }

      throw error;
    }
  }

  /**
   * Restaura el tracking desde AsyncStorage si hay configuración válida
   * Se llama al reabrir la app para recuperar tracking de orden activa
   */
  public async restoreTrackingIfNeeded(): Promise<boolean> {
    if (!this.isReady) {
      console.warn('📍 [BGS] No está ready, no se puede restaurar tracking');
      return false;
    }

    if (this.state.isTracking) {
      console.log('📍 [BGS] Ya está tracking, omitiendo restauración');
      return true;
    }

    try {
      console.log('📍 [BGS] Intentando restaurar tracking...');

      // Leer config de AsyncStorage
      const values = await AsyncStorage.multiGet([
        'tracking_schema',
        'tracking_despacho',
        'usuario_id'
      ]);

      const schemaName = values[0][1];
      const despachoStr = values[1][1];
      const usuarioIdStr = values[2][1];

      console.log('📍 [BGS] Config leída:', {
        schemaName,
        despacho: despachoStr,
        usuarioId: usuarioIdStr,
      });

      // Validar que tenemos todos los datos
      if (!schemaName || !despachoStr || !usuarioIdStr) {
        console.log('📍 [BGS] No hay config completa, no restaurando tracking');
        return false;
      }

      const despacho = parseInt(despachoStr, 10);
      const usuarioId = parseInt(usuarioIdStr, 10);

      if (isNaN(despacho) || isNaN(usuarioId)) {
        console.warn('📍 [BGS] Config inválida en AsyncStorage');
        return false;
      }

      // Restaurar tracking
      const trackingConfig: TrackingConfig = {
        schemaName,
        despacho,
        usuarioId,
      };

      console.log('📍 [BGS] Restaurando tracking con config:', trackingConfig);
      await this.startTracking(trackingConfig);

      console.log('✅ [BGS] Tracking restaurado exitosamente');
      return true;

    } catch (error) {
      console.error('📍 [BGS] Error restaurando tracking:', error);

      // Report restoration errors
      reportLocationTrackingError('restoration', error, {
        isReady: this.isReady,
        isTracking: this.state.isTracking,
      });

      return false;
    }
  }

  /**
   * Detiene el tracking
   */
  public async stopTracking(): Promise<void> {
    try {
      console.log('📍 [BackgroundGeolocation] Deteniendo tracking...');

      // 🔴 iOS: Verificar estado antes de detener para confirmar geofence estacionaria
      if (Platform.OS === 'ios') {
        const state = await BackgroundGeolocation.getState();
        console.log('📍 [BackgroundGeolocation] 🍎 Estado iOS antes de detener:', {
          enabled: state.enabled,
          isMoving: state.isMoving,
          trackingMode: state.trackingMode,
        });
        console.log('📍 [BackgroundGeolocation] 🍎 iOS creará geofence estacionaria automáticamente');
      }

      await BackgroundGeolocation.stop();

      this.state.isTracking = false;

      // 🔴 iOS: Confirmar que geofence estacionaria se creó
      if (Platform.OS === 'ios') {
        console.log('✅ [BackgroundGeolocation] 🍎 iOS debería haber creado geofence estacionaria');
        console.log('✅ [BackgroundGeolocation] 🍎 App se reactivará cuando usuario se mueva ~200m');
      }

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
   * Limpia datos de tracking (para desvinculación de orden)
   * NO resetea ready() ni remueve listeners - permite re-vinculación
   */
  public async cleanup(): Promise<void> {
    try {
      console.log('📍 [BackgroundGeolocation] Limpiando datos de tracking...');

      // Detener tracking si está activo
      if (this.state.isTracking) {
        await this.stopTracking();
      }

      // Limpiar datos de AsyncStorage para HeadlessTask
      try {
        await AsyncStorage.multiRemove(['usuario_id', 'tracking_schema', 'tracking_despacho']);
        console.log('📍 [BGS] Config de tracking removida de AsyncStorage');
      } catch (storageError) {
        console.error('📍 [BGS] Error removiendo config de AsyncStorage:', storageError);
        reportAsyncStorageError('multiRemove', storageError, {
          keys: ['usuario_id', 'tracking_schema', 'tracking_despacho'],
          phase: 'cleanup',
        });
        // Continue cleanup despite storage error
      }

      // Limpiar solo datos de tracking, NO el estado ready NI los listeners
      this.state.schemaName = undefined;
      this.state.despacho = undefined;
      this.state.usuarioId = undefined;
      this.state.lastLocation = undefined;
      this.state.errorCount = 0;
      // NO tocar isReady - permanece true hasta el próximo launch
      // NO remover listeners - permite re-vinculación sin problemas

      console.log(
        '📍 [BackgroundGeolocation] Datos de tracking limpiados (listeners preservados)',
      );
    } catch (error) {
      console.error('📍 [BackgroundGeolocation] Error limpiando:', error);

      // Report cleanup errors
      reportLocationTrackingError('cleanup', error, {
        phase: 'cleanup',
        wasTracking: this.state.isTracking,
      });

      throw error;
    }
  }

  /**
   * Limpieza completa para logout - remueve listeners y detiene todo
   * Solo usar en logout, NO en desvinculación de orden
   */
  public async fullCleanup(): Promise<void> {
    try {
      console.log(
        '📍 [BackgroundGeolocation] Limpieza completa para logout...',
      );

      // Detener tracking si está activo
      if (this.state.isTracking) {
        await this.stopTracking();
      }

      // Remover listeners usando patrón Subscription
      this.removeEventListeners();

      // Limpiar datos de AsyncStorage para HeadlessTask
      try {
        await AsyncStorage.multiRemove(['usuario_id', 'tracking_schema', 'tracking_despacho']);
        console.log('📍 [BGS] Config de tracking removida de AsyncStorage');
      } catch (storageError) {
        console.error('📍 [BGS] Error removiendo config de AsyncStorage:', storageError);
        reportAsyncStorageError('multiRemove', storageError, {
          keys: ['usuario_id', 'tracking_schema', 'tracking_despacho'],
          phase: 'cleanup',
        });
        // Continue cleanup despite storage error
      }

      // Resetear estado completo
      this.resetState();

      console.log(
        '📍 [BackgroundGeolocation] Limpieza completa realizada (listeners removidos)',
      );
    } catch (error) {
      console.error(
        '📍 [BackgroundGeolocation] Error en limpieza completa:',
        error,
      );

      // Report full cleanup errors
      reportLocationTrackingError('cleanup', error, {
        phase: 'fullCleanup',
        wasTracking: this.state.isTracking,
      });

      throw error;
    }
  }

  /**
   * Resetea el estado interno del servicio
   */
  private resetState(): void {
    this.state = {
      isEnabled: false,
      isTracking: false,
      hasPermission: false,
      errorCount: 0,
    };
  }

  /**
   * Android: Solicita permisos de ubicación en segundo plano (API 29+)
   *
   * Flujo para Android 10+:
   * 1. Solicitar ACCESS_FINE_LOCATION (foreground)
   * 2. Solicitar ACCESS_BACKGROUND_LOCATION (background)
   * 3. En Android 11+, si el usuario selecciona "While using", mostrar
   *    backgroundPermissionRationale que redirige a Configuración
   *
   * @returns true si tiene permisos de background location
   */
  private async requestBackgroundLocationAndroid(): Promise<boolean> {
    if (Platform.OS !== 'android') {
      return true; // Solo para Android
    }

    try {
      console.log('📍 [Android] Verificando permisos de ubicación...');

      // Paso 1: Solicitar permisos de foreground (FINE + COARSE)
      const fineLocationGranted = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );

      if (!fineLocationGranted) {
        console.log('📍 [Android] Solicitando permiso ACCESS_FINE_LOCATION...');
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Permiso de Ubicación',
            message: 'Ruteo necesita acceso a tu ubicación para registrar entregas.',
            buttonPositive: 'Permitir',
            buttonNegative: 'Denegar',
          }
        );

        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          console.warn('📍 [Android] Permiso de ubicación denegado');
          return false;
        }
      }

      // Paso 2: Android 10+ (API 29+) - Solicitar ACCESS_BACKGROUND_LOCATION
      if (Platform.Version >= 29) {
        console.log('📍 [Android 10+] Verificando ACCESS_BACKGROUND_LOCATION...');

        const backgroundGranted = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION
        );

        if (backgroundGranted) {
          console.log('✅ [Android] Ya tiene permisos de ubicación en segundo plano');
          return true;
        }

        // Mostrar alert explicativo ANTES de solicitar (similar a iOS)
        return new Promise((resolve) => {
          Alert.alert(
            'Ubicación en Segundo Plano',
            Platform.Version >= 30
              ? // Android 11+ (API 30+) - Mensaje específico para redirect a Settings
                'Para registrar entregas automáticamente con la app cerrada, ' +
                'el sistema te llevará a Configuración.\n\n' +
                'Por favor selecciona "Permitir todo el tiempo" en la página de permisos.'
              : // Android 10 (API 29) - Diálogo estándar
                'Para registrar entregas incluso cuando la app esté cerrada, ' +
                'necesitamos permiso de ubicación en segundo plano.',
            [
              {
                text: 'Cancelar',
                style: 'cancel',
                onPress: () => {
                  console.log('⚠️ [Android] Usuario canceló permisos de background');
                  resolve(false);
                },
              },
              {
                text: 'Continuar',
                onPress: async () => {
                  console.log('📍 [Android] Solicitando ACCESS_BACKGROUND_LOCATION...');

                  const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION,
                    {
                      title: 'Ubicación Todo el Tiempo',
                      message: 'Selecciona "Permitir todo el tiempo" para el mejor funcionamiento.',
                      buttonPositive: 'Permitir',
                      buttonNegative: 'Denegar',
                    }
                  );

                  const hasPermission = granted === PermissionsAndroid.RESULTS.GRANTED;

                  if (hasPermission) {
                    console.log('✅ [Android] Permisos de ubicación en segundo plano concedidos');
                  } else {
                    console.warn('⚠️ [Android] Permisos de background location denegados o parciales');
                    console.warn('⚠️ [Android] Usuario puede cambiar a "Allow all the time" en Settings');
                  }

                  resolve(hasPermission);
                },
              },
            ],
            { cancelable: false }
          );
        });
      }

      // Android < 10 - No requiere ACCESS_BACKGROUND_LOCATION separado
      console.log('✅ [Android < 10] Permisos de ubicación OK');
      return true;

    } catch (error) {
      console.error('📍 [Android] Error solicitando permisos:', error);
      return false;
    }
  }

  /**
   * Muestra alerta para solicitar permisos de ubicación cuando están denegados
   * Explica claramente por qué se necesita el permiso Always
   */
  private showLocationPermissionAlert(): void {
    Alert.alert(
      'Permisos de Ubicación Necesarios',
      'Ruteo necesita acceso a tu ubicación para registrar entregas.\n\n' +
      'Sin estos permisos no podrás:\n' +
      '• Registrar ubicaciones durante entregas\n' +
      '• Optimizar tus rutas automáticamente\n' +
      '• Ver tu progreso en el mapa\n\n' +
      'Para el mejor funcionamiento, selecciona "Siempre" en Configuración.',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Abrir Configuración',
          onPress: () => {
            Linking.openSettings();
          },
        },
      ],
      { cancelable: false }
    );
  }

  /**
   * Obtiene el estado actual del servicio
   */
  public getState(): BackgroundGeolocationState {
    return { ...this.state };
  }

  /**
   * Verifica si el tracking está activo
   */
  public isTrackingActive(): boolean {
    return this.state.isTracking;
  }

  /**
   * Verifica si hay una configuración de tracking válida
   */
  public hasValidTrackingConfig(): boolean {
    return !!(this.state.schemaName && this.state.despacho && this.state.usuarioId);
  }
}

// Exportar instancia singleton
export const backgroundGeolocationService =
  BackgroundGeolocationService.getInstance();
