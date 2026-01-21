# Testing iOS Stationary Geofence - Guía de Verificación

## Objetivo
Verificar que iOS crea correctamente la **geofence estacionaria** cuando la app se cierra, permitiendo que iOS reactive la app cuando el usuario se mueva más de ~200 metros.

## ¿Qué es la Geofence Estacionaria?

Cuando iOS termina la app (por cierre del usuario o por gestión de memoria), el plugin `react-native-background-geolocation` automáticamente:

1. Crea una geofence circular de ~200m alrededor de la última ubicación conocida
2. Registra esta geofence con iOS
3. Cuando el usuario sale de esta geofence (se mueve >200m), **iOS reactiva completamente la app en background**
4. La app vuelve a trackear ubicaciones normalmente

Esto es **fundamental** para que el tracking funcione cuando la app está completamente cerrada en iOS.

---

## Mejoras Implementadas (1.1)

### 1. **stopTimeout: 5 minutos**
```typescript
stopTimeout: 5, // Da tiempo a iOS para crear la geofence antes de terminar
```

**Propósito:** Da 5 minutos de gracia a iOS para crear la geofence estacionaria antes de detener completamente el servicio de ubicación.

### 2. **Listener de eventos Geofence**
```typescript
BackgroundGeolocation.onGeofence((event) => {
  console.log('🎯 Geofence event:', event);
  if (event.action === 'EXIT' && event.identifier === 'TSLocationManager') {
    console.log('✅ iOS reactivó la app desde estado terminado');
  }
});
```

**Propósito:** Confirma cuando iOS reactiva la app por salida del geofence estacionario.

### 3. **Logging detallado en stopTracking()**
```typescript
// Muestra estado antes de detener
// Confirma que geofence estacionaria debería crearse
```

**Propósito:** Verificar el estado de iOS antes y después de detener tracking.

---

## Plan de Testing End-to-End

### Prerequisitos
- iPhone con iOS 13+ (preferiblemente iOS 14+)
- Permisos de ubicación "Siempre" otorgados
- Xcode instalado para ver logs
- Entorno de testing al aire libre (para moverse físicamente)

### Test 1: Verificar Creación de Geofence Estacionaria

**Pasos:**
1. **Iniciar tracking:**
   - Vincular una orden en la app
   - Iniciar tracking
   - Verificar que aparece la notificación de ubicación (flecha azul en status bar)

2. **Observar logs al iniciar:**
   ```
   📍 [BackgroundGeolocation] Tracking iniciado correctamente
   ```

3. **Detener tracking (sin cerrar app):**
   - Desvincular orden o detener tracking
   - **IMPORTANTE:** Observar logs específicos de iOS:
   ```
   📍 [BackgroundGeolocation] 🍎 Estado iOS antes de detener
   📍 [BackgroundGeolocation] 🍎 iOS creará geofence estacionaria automáticamente
   ✅ [BackgroundGeolocation] 🍎 iOS debería haber creado geofence estacionaria
   ✅ [BackgroundGeolocation] 🍎 App se reactivará cuando usuario se mueva ~200m
   ```

4. **Verificar en Xcode:**
   - Conectar iPhone a Mac
   - Abrir Xcode → Window → Devices and Simulators
   - Seleccionar dispositivo → View Device Logs
   - Buscar: "TSLocationManager" o "geofence"
   - Deberías ver logs de creación de geofence

**Resultado esperado:** ✅ Logs confirman creación de geofence estacionaria

---

### Test 2: Verificar Reactivación de App (CRÍTICO)

**Pasos:**
1. **Preparación:**
   - Iniciar tracking de una orden
   - Esperar 1-2 minutos para que iOS estabilice el tracking
   - Verificar en logs que hay ubicaciones siendo enviadas

2. **Cerrar app completamente:**
   - Swipe up desde multitasking para forzar cierre
   - **IMPORTANTE:** iOS ahora debería crear el geofence estacionario

3. **Permanecer estacionario:**
   - Esperar 2-3 minutos sin moverse
   - Esto asegura que iOS detecta estado estacionario

4. **Moverse >200 metros:**
   - Caminar, conducir, o usar transporte
   - Moverse al menos 200-300 metros de la ubicación original
   - **Esto debería activar el EXIT del geofence**

5. **Verificar logs (conectar a Xcode):**
   - Buscar en logs del dispositivo:
   ```
   📍 [BackgroundGeolocation] 🎯 Geofence event (iOS app reactivation)
   📍 [BackgroundGeolocation] 🎯 Geofence action: EXIT
   📍 [BackgroundGeolocation] 🎯 Geofence identifier: TSLocationManager
   ✅ [BackgroundGeolocation] iOS reactivó la app desde estado terminado
   ✅ [BackgroundGeolocation] Geofence estacionaria funcionando correctamente
   ```

6. **Verificar ubicaciones en servidor:**
   - Después de reactivación, deberían aparecer nuevas ubicaciones
   - Verificar en backend que las ubicaciones post-reactivación se enviaron

**Resultado esperado:**
- ✅ iOS reactiva la app cuando se sale del geofence
- ✅ Ubicaciones se envían correctamente después de reactivación
- ✅ Logs muestran evento de geofence EXIT

---

### Test 3: Verificar Heartbeat cuando Estacionario

**Pasos:**
1. **Iniciar tracking**
2. **Permanecer completamente estacionario** (>60 segundos)
3. **Observar logs:**
   ```
   📍 [BackgroundGeolocation] Heartbeat: {...}
   📍 [BackgroundGeolocation] Heartbeat location: {...}
   ```

4. **Verificar que ubicaciones se envían cada ~60 segundos** incluso sin movimiento

**Resultado esperado:** ✅ Heartbeat envía ubicaciones cuando usuario está estacionario

---

## Troubleshooting

### ❌ No veo logs de geofence EXIT después de moverme

**Posibles causas:**
1. **No te moviste suficiente distancia:**
   - Solución: Muévete al menos 250-300 metros

2. **iOS no creó el geofence estacionario:**
   - Verificar: Logs de `stopTracking()` deberían mostrar "iOS creará geofence"
   - Verificar: Permisos "Siempre" están otorgados
   - Verificar: `stopOnTerminate: false` en configuración

3. **App no se cerró correctamente:**
   - Asegúrate de hacer swipe up en multitasking
   - No solo presionar home (eso solo minimiza)

4. **stopTimeout muy corto:**
   - Actualmente configurado en 5 minutos
   - Si el issue persiste, considerar aumentar a 10 minutos

### ❌ App no se reactiva cuando me muevo

**Posibles causas:**
1. **Permisos no están en "Siempre":**
   - Ir a Settings → Ruteo → Location → "Always"

2. **Background App Refresh desactivado:**
   - Settings → General → Background App Refresh → ON para Ruteo

3. **Low Power Mode activo:**
   - iOS limita background tasks en Low Power Mode
   - Desactivar temporalmente para testing

4. **iOS mató el proceso completamente:**
   - Después de varias horas/días, iOS puede limpiar completamente
   - Solución: `startOnBoot: true` debería ayudar

### ❌ Logs muestran "HeadlessTask" en iOS

**Diagnóstico:**
- HeadlessTask es solo para Android
- Si ves estos logs en iOS, hay un problema de configuración
- Revisar que `enableHeadless` está correctamente implementado

---

## Métricas de Éxito

Para considerar que la geofence estacionaria funciona correctamente:

- ✅ Logs muestran "iOS creará geofence estacionaria" al detener tracking
- ✅ Logs muestran evento de geofence EXIT cuando se mueve >200m
- ✅ App se reactiva automáticamente después de movimiento
- ✅ Ubicaciones post-reactivación se envían correctamente al servidor
- ✅ Heartbeat funciona cuando usuario está estacionario
- ✅ No hay gaps de ubicaciones mayores a 1-2 minutos durante movimiento

---

## Configuración Final Implementada

```typescript
{
  // iOS Stationary Geofence
  stopOnTerminate: false,           // No detener al cerrar app
  stopTimeout: 5,                    // 5 min para crear geofence
  heartbeatInterval: 60,             // Ping cada 60s estacionario
  pausesLocationUpdatesAutomatically: false, // Mantener activo

  // Event Listeners
  onGeofence: ✅ Implementado         // Monitorea reactivación iOS
  onEnabledChange: ✅ Implementado    // Monitorea cambios de estado
  onHeartbeat: ✅ Implementado        // Maneja casos estacionarios
}
```

---

## Referencias

- [react-native-background-geolocation - iOS Stationary Geofence](https://transistorsoft.github.io/react-native-background-geolocation/)
- [Apple Location Services Best Practices](https://developer.apple.com/documentation/corelocation)

---

## Próximos Pasos

Después de verificar que la geofence estacionaria funciona:

1. ✅ **Completar punto 1.1** - iOS Stationary Geofence
2. ⏭️ **Punto 1.2** - Implementar JWT Authorization para token refresh automático
3. ⏭️ **Punto 1.3** - Descomentar `maxDaysToPersist`
4. ⏭️ **Punto 1.4** - Implementar retry logic en HeadlessTask

---

**Fecha de implementación:** 2026-01-21
**Versión:** 1.0
**Estado:** ✅ Implementado - Pendiente Testing
