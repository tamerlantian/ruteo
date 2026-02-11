/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import BackgroundGeolocation from 'react-native-background-geolocation';

// Registrar componente principal
AppRegistry.registerComponent(appName, () => App);

/**
 * HEADLESS TASK - CRÍTICO para funcionamiento cuando la app está terminada
 * 
 * Este task se ejecuta cuando:
 * 1. La app está completamente cerrada/terminada
 * 2. El sistema Android mata el proceso de la app
 * 3. El usuario fuerza el cierre de la app
 * 
 * IMPORTANTE: Solo funciona en Android. iOS maneja background location de forma diferente.
 */
const BackgroundGeolocationHeadlessTask = async (event) => {
  const params = event.params;
  console.log('[🚀 HeadlessTask] Evento recibido:', event.name, params);

  switch (event.name) {
    case 'location':
      // Nueva ubicación recibida cuando la app está terminada
      await handleLocationInHeadlessMode(params);
      break;
      
    case 'terminate':
      // La app está siendo terminada
      console.log('[🚀 HeadlessTask] App terminándose, preparando cleanup...');
      break;
      
    case 'heartbeat':
      // Heartbeat cuando el dispositivo está estacionario
      console.log('[🚀 HeadlessTask] Heartbeat recibido');
      // Opcionalmente obtener ubicación actual
      try {
        const location = await BackgroundGeolocation.getCurrentPosition({
          samples: 1,
          extras: { headless: true },
          persist: true
        });
        await handleLocationInHeadlessMode(location);
      } catch (error) {
        console.error('[🚀 HeadlessTask] Error obteniendo ubicación:', error);
      }
      break;
      
    default:
      console.log('[🚀 HeadlessTask] Evento no manejado:', event.name);
  }
};

/**
 * Maneja ubicaciones cuando la app está en modo headless
 * Envía directamente al servidor usando fetch nativo
 */
const handleLocationInHeadlessMode = async (location) => {
  try {
    console.log('[🚀 HeadlessTask] Procesando ubicación:', location);
    
    // Validar ubicación
    if (!location || !location.coords) {
      console.warn('[🚀 HeadlessTask] Ubicación inválida, ignorando...');
      return;
    }

    // Obtener configuración almacenada (necesitamos schema, despacho, usuario)
    // NOTA: En headless mode no tenemos acceso a Redux, usamos AsyncStorage directo
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    
    // IMPORTANTE: Usar las mismas keys que el sistema de settings y auth
    const schemaName = await AsyncStorage.getItem('@app_subdominio');
    const despacho = await AsyncStorage.getItem('@app_despacho');
    const usuarioId = await AsyncStorage.getItem('usuario_id'); // Esta key sí es directa
    const authToken = await AsyncStorage.getItem('@auth_token'); // Mismo patrón que HttpBaseRepository
    
    console.log('[🚀 HeadlessTask] Configuración obtenida:', {
      schemaName,
      despacho,
      usuarioId,
      hasSchema: !!schemaName,
      hasDespacho: !!despacho,
      hasUsuario: !!usuarioId,
      hasToken: !!authToken
    });
    
    if (!schemaName || !despacho || !usuarioId) {
      console.warn('[🚀 HeadlessTask] Configuración incompleta, no enviando ubicación');
      console.warn('[🚀 HeadlessTask] Faltantes:', {
        schemaName: !schemaName ? 'FALTA' : 'OK',
        despacho: !despacho ? 'FALTA' : 'OK',
        usuarioId: !usuarioId ? 'FALTA' : 'OK',
        authToken: !authToken ? 'FALTA' : 'OK'
      });
      return;
    }

    // Preparar datos para envío
    const trackingData = {
      latitud: parseFloat(location.coords.latitude.toFixed(15)),
      longitud: parseFloat(location.coords.longitude.toFixed(15)),
      despacho: despacho,
      usuario_id: usuarioId,
      schema: schemaName,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      accuracy: location.coords.accuracy || 0,
      headless: true // Marcar como enviado desde headless mode
    };

    // Enviar usando fetch nativo (no podemos usar el repository en headless mode)
    // IMPORTANTE: Usar el mismo patrón que locationTrackingRepository
    // Construir URL como: https://schema.ruteoapi.online/ruteo/ubicacion/
    const isDeveloperMode = await AsyncStorage.getItem('@dev_mode_enabled');
    const isDevMode = isDeveloperMode ? JSON.parse(isDeveloperMode) : false;
    const baseDomain = isDevMode ? 'ruteoapi.online' : 'ruteoapi.co';
    const protocol = isDevMode ? 'http' : 'https';
    const url = `${protocol}://${schemaName}.${baseDomain}/ruteo/ubicacion/`;
    
    console.log('[🚀 HeadlessTask] URL construida:', {
      url,
      schemaName,
      baseDomain,
      protocol,
      isDevMode
    });
    
    // Preparar headers con autenticación (mismo patrón que HttpBaseRepository)
    const headers = {
      'Content-Type': 'application/json',
    };
    
    // Agregar token de autenticación si está disponible
    if (authToken) {
      headers.Authorization = `Bearer ${authToken}`;
      console.log('[🚀 HeadlessTask] Token de auth agregado a headers');
    } else {
      console.warn('[🚀 HeadlessTask] No hay token de auth disponible');
    }
    
    const response = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(trackingData)
    });

    if (response.ok) {
      const responseData = await response.json();
      console.log('[🚀 HeadlessTask] Ubicación enviada exitosamente:', {
        status: response.status,
        id: responseData?.id,
        url: url
      });
    } else {
      const errorText = await response.text();
      console.error('[🚀 HeadlessTask] Error enviando ubicación:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
        url: url
      });
    }
    
  } catch (error) {
    console.error('[🚀 HeadlessTask] Error procesando ubicación:', error);
  }
};

// REGISTRAR EL HEADLESS TASK - CRÍTICO
BackgroundGeolocation.registerHeadlessTask(BackgroundGeolocationHeadlessTask);
