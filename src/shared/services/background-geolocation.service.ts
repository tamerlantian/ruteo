import BackgroundGeolocation, {
  Location,
} from 'react-native-background-geolocation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert, Linking, Platform, PermissionsAndroid } from 'react-native';
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
   * Configuración optimizada para background geolocation con HeadlessTask
   * Configurada para máxima supervivencia cuando la app está terminada
   * DEBE llamarse UNA SOLA VEZ al iniciar la app
   */
  private getDefaultConfig() {
    return {
      // Configuración básica de ubicación
      desiredAccuracy: BackgroundGeolocation.DESIRED_ACCURACY_HIGH,
      distanceFilter: 35, // Enviar cada 50 metros de movimiento
      stationaryRadius: 25, // Radio de detección de parada

      // CRÍTICO: Configuración para supervivencia de la app
      stopOnTerminate: false, // NO detener cuando la app se cierra
      startOnBoot: true, // Reiniciar después de reboot del dispositivo
      enableHeadless: true, // CRÍTICO: Habilitar HeadlessTask

      // ========================
      // 🧠 Android Foreground Service
      // ========================
      foregroundService: true,

      // 🔴 CRÍTICO EN iOS - Solicitar permisos Always desde inicialización
      locationAuthorizationRequest: 'Always' as any,
      locationAuthorizationAlert: {
        titleWhenNotEnabled: 'Permisos de Ubicación Requeridos',
        titleWhenOff: 'Ubicación Desactivada',
        instructions: 'Ruteo necesita acceso a tu ubicación "Siempre" para registrar entregas correctamente, incluso cuando la app esté cerrada.\n\nEsto es necesario para el funcionamiento de la aplicación.',
        cancelButton: 'Cancelar',
        settingsButton: 'Ir a Configuración'
      },

      // 🔴 CRÍTICO EN ANDROID - Justificación específica para permisos de ubicación en segundo plano
      backgroundPermissionRationale: {
        title: "Permisos de Ubicación en Segundo Plano",
        message: "Ruteo necesita acceso a tu ubicación en segundo plano para registrar entregas y optimizar rutas de manera precisa, incluso cuando la aplicación esté cerrada o minimizada. Esto es esencial para el seguimiento de entregas y la gestión eficiente de rutas.",
        positiveAction: 'Permitir',
        negativeAction: 'Denegar'
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

      // Configuración de persistencia y sincronización
      // autoSync: true, // Sincronizar automáticamente con el servidor
      // maxDaysToPersist: 1, // Mantener ubicaciones por 1 día

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
      const status = await BackgroundGeolocation.requestPermission();

      console.log('[BGG] Permission status:', status);

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
   * Previene duplicación de listeners en re-vinculaciones
   */
  private setupEventListeners(): void {
    console.log('📍 [BackgroundGeolocation] Configurando event listeners...');

    // IMPORTANTE: No remover listeners existentes aquí para evitar problemas
    // Los listeners se configuran una vez y se mantienen activos
    // Solo se reconfiguran si es necesario

    try {
      // Event listener para nuevas ubicaciones
      BackgroundGeolocation.onLocation(this.onLocation.bind(this));
      console.log(
        '📍 [BackgroundGeolocation] Listener de ubicación configurado',
      );

      // Event listener para cambios de proveedor
      BackgroundGeolocation.onProviderChange(event => {
        console.log('📍 [BackgroundGeolocation] Provider change:', event);
        this.state.hasPermission = event.gps && event.network && event.enabled;
      });

      BackgroundGeolocation.onAuthorization((status: any) => {
        console.log('📍 Authorization status change:', status);

        if (status === BackgroundGeolocation.AUTHORIZATION_STATUS_DENIED) {
          console.warn('🚫 Ubicación denegada por iOS');
          this.showLocationPermissionAlert();
        }
      });

      console.log(
        '📍 [BackgroundGeolocation] Listener de proveedor configurado',
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

      // Guardar configuración de tracking en estado interno
      this.state.schemaName = config.schemaName;
      this.state.despacho = config.despacho;
      this.state.usuarioId = config.usuarioId;

      // CRÍTICO: Guardar usuario ID en AsyncStorage para Headl
      await AsyncStorage.setItem('usuario_id', config.usuarioId.toString());
      console.log(
        '📍 [BackgroundGeolocation] Usuario ID guardado para HeadlessTask:',
        config.usuarioId,
      );

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
      await AsyncStorage.removeItem('usuario_id');
      console.log(
        '📍 [BackgroundGeolocation] Usuario ID removido de AsyncStorage',
      );

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

      // Limpiar datos de AsyncStorage para HeadlessTask
      await AsyncStorage.removeItem('usuario_id');
      console.log(
        '📍 [BackgroundGeolocation] Usuario ID removido de AsyncStorage',
      );

      // Limpiar todos los datos de tracking
      this.state.schemaName = undefined;
      this.state.despacho = undefined;
      this.state.usuarioId = undefined;
      this.state.lastLocation = undefined;
      this.state.errorCount = 0;
      // NO tocar isReady - permanece true hasta el próximo launch

      // SOLO en logout: remover listeners completamente
      BackgroundGeolocation.removeListeners();
      console.log(
        '📍 [BackgroundGeolocation] Limpieza completa realizada (listeners removidos)',
      );
    } catch (error) {
      console.error(
        '📍 [BackgroundGeolocation] Error en limpieza completa:',
        error,
      );
      throw error;
    }
  }

  /**
   * Solicita permisos "Always" específicamente antes de iniciar tracking
   */
  private async requestAlwaysLocationPermission(): Promise<void> {
    console.log('📍 [BackgroundGeolocation] Solicitando permisos Always...');

    return new Promise((resolve, reject) => {
      Alert.alert(
        'Permisos de Ubicación Requeridos',
        'Para registrar entregas correctamente, Ruteo necesita acceso a tu ubicación "Siempre", incluso cuando la app esté cerrada.\n\n¿Deseas continuar?',
        [
          {
            text: 'Cancelar',
            style: 'cancel',
            onPress: () => {
              console.log('📍 Usuario canceló solicitud de permisos Always');
              reject(new Error('Usuario canceló solicitud de permisos Always'));
            },
          },
          {
            text: 'Continuar',
            onPress: async () => {
              try {
                // Solicitar permisos Always usando BackgroundGeolocation
                const status = await BackgroundGeolocation.requestPermission();
                console.log('📍 Status de permisos después de solicitud:', status);
                
                if (status === BackgroundGeolocation.AUTHORIZATION_STATUS_ALWAYS) {
                  console.log('✅ Permisos Always otorgados');
                  resolve();
                } else if (status === BackgroundGeolocation.AUTHORIZATION_STATUS_WHEN_IN_USE) {
                  console.log('⚠️ Solo permisos WhenInUse otorgados, solicitando Always...');
                  // Mostrar alerta para ir a configuración y cambiar a Always
                  this.showLocationPermissionAlert();
                  resolve(); // Continuar aunque sea WhenInUse por ahora
                } else {
                  console.warn('🚫 Permisos denegados:', status);
                  reject(new Error('Permisos de ubicación denegados'));
                }
              } catch (error) {
                console.error('📍 Error solicitando permisos:', error);
                reject(error);
              }
            },
          },
        ],
        { cancelable: false }
      );
    });
  }

  /**
   * Muestra alerta para solicitar permisos de ubicación y abre configuración
   */
  private showLocationPermissionAlert(): void {
    Alert.alert(
      'Permisos de Ubicación Requeridos',
      'Ruteo necesita acceso a tu ubicación "Siempre" para registrar entregas incluso cuando la app esté cerrada.\n\nPor favor, ve a Configuración y selecciona "Siempre" en los permisos de ubicación.',
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
