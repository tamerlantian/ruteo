# Configuración de Headless Mode para Background Geolocation

## ¿Qué es el Headless Mode?

El **Headless Mode** permite que `react-native-background-geolocation` continúe funcionando **incluso cuando la app está completamente terminada**. Esto es crítico para aplicaciones de tracking como Ruteo.

### Casos donde funciona el Headless Mode:
1. ✅ Usuario cierra la app desde el task switcher
2. ✅ Sistema Android mata el proceso por memoria
3. ✅ Usuario fuerza el cierre de la app
4. ✅ App crashea o se cierra inesperadamente
5. ✅ Dispositivo se reinicia (con `startOnBoot: true`)

### Limitaciones:
- ❌ **Solo funciona en Android** (iOS maneja background location diferente)
- ❌ No funciona si el usuario desactiva completamente los permisos de ubicación
- ❌ Puede ser limitado por optimizaciones de batería del sistema

## Configuración Implementada

### 1. Permisos de Android (AndroidManifest.xml)
```xml
<!-- GEOLOCALIZACIÓN EN SEGUNDO PLANO -->
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_BACKGROUND_LOCATION" />
<uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
<uses-permission android:name="android.permission.WAKE_LOCK" />
```

### 2. Configuración del Servicio
```typescript
// En BackgroundGeolocationService.getDefaultConfig()
{
  stopOnTerminate: false,    // NO detener cuando la app se cierra
  startOnBoot: true,         // Reiniciar después de reboot
  enableHeadless: true,      // CRÍTICO: Habilitar HeadlessTask
  foregroundService: true,   // Usar foreground service
  autoSync: true,           // Sincronizar automáticamente
}
```

### 3. HeadlessTask (index.js)
```javascript
// Registrado en index.js - ÚNICO lugar válido
const BackgroundGeolocationHeadlessTask = async (event) => {
  switch (event.name) {
    case 'location':
      await handleLocationInHeadlessMode(event.params);
      break;
    case 'heartbeat':
      // Obtener ubicación cuando está estacionario
      break;
  }
};

BackgroundGeolocation.registerHeadlessTask(BackgroundGeolocationHeadlessTask);
```

### 4. Manejo de Datos en Headless Mode
- **No hay acceso a Redux** en headless mode
- **Usa AsyncStorage directo** para obtener configuración
- **Usa fetch nativo** para enviar al servidor
- **Validación robusta** de datos antes de envío

## Flujo de Funcionamiento

### Modo Normal (App Abierta)
1. `BackgroundGeolocationService.onLocation()` maneja eventos
2. Usa `locationTrackingRepository` para enviar al servidor
3. Acceso completo a Redux y servicios

### Modo Headless (App Terminada)
1. `BackgroundGeolocationHeadlessTask` recibe eventos
2. Lee configuración desde AsyncStorage
3. Usa `fetch` nativo para enviar al servidor
4. Logging limitado a console

## Datos Enviados en Headless Mode

```json
{
  "latitud": 4.123456,
  "longitud": -74.123456,
  "despacho": "123",
  "usuario_id": "456",
  "schema": "cliente",
  "timestamp": "2025-01-03 15:30",
  "accuracy": 10,
  "headless": true  // Marca que fue enviado desde headless mode
}
```

## Testing del Headless Mode

### 1. Preparación
```bash
# Instalar en dispositivo real (no funciona en simulador)
npx react-native run-android --variant=release

# Habilitar logs de background geolocation
adb logcat | grep -i "background\|headless\|location"
```

### 2. Pruebas a Realizar

#### Test 1: Cierre Normal
1. Abrir app y cargar una orden (iniciar tracking)
2. Cerrar app desde task switcher
3. Mover el dispositivo 10+ metros
4. Verificar logs: `[🚀 HeadlessTask] Evento recibido: location`
5. Verificar en servidor que llegaron ubicaciones con `headless: true`

#### Test 2: Forzar Cierre
1. Abrir app y cargar orden
2. Forzar cierre: `adb shell am force-stop com.anonymous.lutencio`
3. Mover dispositivo
4. Verificar funcionamiento

#### Test 3: Reboot del Dispositivo
1. Cargar orden y cerrar app
2. Reiniciar dispositivo
3. Verificar que el tracking se reanuda automáticamente

### 3. Comandos de Debug
```bash
# Ver logs específicos de background geolocation
adb logcat | grep -E "(BackgroundGeolocation|HeadlessTask|📍|🚀)"

# Ver estado de la app
adb shell dumpsys activity | grep -i "ruteo\|anonymous"

# Verificar foreground service
adb shell dumpsys activity services | grep -i location
```

## Troubleshooting

### Problema: HeadlessTask no se ejecuta
**Posibles causas:**
- App no está en release mode
- Permisos de ubicación no concedidos
- Optimización de batería activada para la app
- HeadlessTask no registrado en index.js

**Solución:**
```bash
# Verificar que está registrado
adb logcat | grep "registerHeadlessTask"

# Desactivar optimización de batería
# Configuración > Batería > Optimización de batería > Ruteo > No optimizar
```

### Problema: No llegan ubicaciones al servidor
**Posibles causas:**
- Configuración incompleta en AsyncStorage
- URL del servidor incorrecta
- Token de autenticación faltante

**Solución:**
```javascript
// Verificar AsyncStorage en HeadlessTask
const schemaName = await AsyncStorage.getItem('subdominio');
const despacho = await AsyncStorage.getItem('despacho');
const usuarioId = await AsyncStorage.getItem('usuario_id');
console.log('Config:', { schemaName, despacho, usuarioId });
```

### Problema: Batería se agota rápido
**Optimizaciones:**
- Aumentar `distanceFilter` (ej: 20 metros)
- Aumentar `heartbeatInterval` (ej: 120 segundos)
- Usar `DESIRED_ACCURACY_BALANCED` en lugar de `HIGH`

## Configuraciones de Producción

### Para Máxima Supervivencia
```typescript
{
  distanceFilter: 10,
  heartbeatInterval: 60,
  desiredAccuracy: BackgroundGeolocation.DESIRED_ACCURACY_HIGH,
  stopOnTerminate: false,
  startOnBoot: true,
  enableHeadless: true,
}
```

### Para Ahorro de Batería
```typescript
{
  distanceFilter: 25,
  heartbeatInterval: 300,
  desiredAccuracy: BackgroundGeolocation.DESIRED_ACCURACY_BALANCED,
  stopOnTerminate: false,
  startOnBoot: true,
  enableHeadless: true,
}
```

## Monitoreo en Producción

### Métricas Importantes
- Porcentaje de ubicaciones con `headless: true`
- Tiempo entre ubicaciones en modo headless
- Errores de envío en modo headless
- Consumo de batería reportado por usuarios

### Logs Recomendados
```javascript
// En HeadlessTask
console.log('[🚀 HeadlessTask] Stats:', {
  event: event.name,
  timestamp: new Date().toISOString(),
  battery: location.battery?.level,
  accuracy: location.coords?.accuracy,
});
```

## Conclusión

El Headless Mode está **completamente configurado** y debería funcionar cuando la app esté terminada. La clave es:

1. ✅ **Permisos correctos** en AndroidManifest.xml
2. ✅ **HeadlessTask registrado** en index.js
3. ✅ **Configuración optimizada** en el servicio
4. ✅ **AsyncStorage** para datos persistentes
5. ✅ **Fetch nativo** para comunicación con servidor

**Próximo paso:** Probar en dispositivo real con los comandos de testing mencionados.
