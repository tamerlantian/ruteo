# BackgroundGeolocation - Uso Correcto

## Problema Anterior

Estábamos implementando el patrón **INCORRECTAMENTE**:
- ❌ Llamábamos `.ready()` múltiples veces
- ❌ Llamábamos `.ready()` condicionalmente (solo al cargar orden)
- ❌ Configuración en lugar incorrecto

## Patrón Correcto (Según Documentación Oficial)

### 1. Llamar `.ready()` UNA SOLA VEZ al iniciar la app

**En `init-services.ts` (llamado desde App.tsx):**

```typescript
import { backgroundGeolocationService } from './src/shared/services';

export async function initializeServices(): Promise<void> {
  // Otros servicios...
  
  // CRÍTICO: Llamar ready() UNA SOLA VEZ por launch
  try {
    await backgroundGeolocationService.ready();
    console.log('BackgroundGeolocation listo');
  } catch (error) {
    console.error('Error inicializando BackgroundGeolocation:', error);
  }
}
```

### 2. Usar `.start()` y `.stop()` para controlar tracking

**En CargarOrdenComponent:**

```typescript
// ✅ CORRECTO
const onCargarOrden = async () => {
  try {
    // ... lógica de cargar orden
    
    // Solo iniciar tracking (ready() ya fue llamado)
    await backgroundGeolocationService.startTracking({
      schemaName: schema_name,
      despacho: despacho_id,
      usuarioId: user.id
    });
    
  } catch (error) {
    // ...
  }
};
```

**En Logout:**

```typescript
// ✅ CORRECTO
const logout = async () => {
  // Solo limpiar datos, NO resetear ready()
  await backgroundGeolocationService.cleanup();
  // ... resto del logout
};
```

## Cambios Implementados en el Servicio

### Nuevos Métodos

1. **`ready()`** - Llama `.ready()` de la librería UNA SOLA VEZ
2. **`startTracking()`** - Solo llama `.start()` (requiere ready() previo)
3. **`cleanup()`** - Limpia datos pero NO resetea ready()

### Estado Interno

- `isReady: boolean` - Controla si `.ready()` ya fue llamado
- Validación en `startTracking()` para asegurar que ready() fue llamado

## Flujo Correcto Implementado

```
1. App inicia → init-services.ts llama backgroundGeolocationService.ready()
2. Usuario carga orden → CargarOrden llama startTracking()
3. Tracking activo → Envía ubicaciones automáticamente
4. Usuario hace logout → cleanup() detiene tracking pero mantiene ready()
5. Usuario carga nueva orden → startTracking() funciona inmediatamente
6. App se cierra completamente → Al reiniciar, vuelve al paso 1
```

## Beneficios del Patrón Correcto

- ✅ **Cumple documentación oficial**: Una sola llamada a `.ready()`
- ✅ **Mejor performance**: No re-configuración innecesaria
- ✅ **iOS background**: Funciona correctamente cuando iOS relanza la app
- ✅ **Configuración persistente**: La librería recuerda la configuración
- ✅ **Menos permisos**: No solicita permisos múltiples veces

## Archivos Modificados

### 1. BackgroundGeolocationService
- ✅ Agregado método `ready()` público
- ✅ Simplificado `startTracking()` - solo llama `.start()`
- ✅ Mejorado `cleanup()` - no resetea ready()
- ✅ Agregada validación `isReady`

### 2. init-services.ts
- ✅ Agregada inicialización de BackgroundGeolocation
- ✅ Función convertida a async
- ✅ Manejo de errores sin bloquear la app

### 3. App.tsx
- ✅ Manejo de `initializeServices()` async
- ✅ Logging de errores

### 4. CargarOrdenComponent
- ✅ Ya estaba correcto - solo usa `startTracking()`

## Advertencias Importantes

⚠️ **NO llamar `.ready()` desde componentes que se cargan por acciones del usuario**
⚠️ **NO llamar `.ready()` múltiples veces**
⚠️ **SÍ llamar `.ready()` siempre al iniciar la app, incluso si no vas a usar tracking inmediatamente**
⚠️ **Especialmente importante para iOS**: Si el OS relanza la app en background, `.ready()` debe ejecutarse

## Testing Requerido

1. **Primer uso**: App nueva → ready() → startTracking() → debe funcionar
2. **Logout/Login**: cleanup() → startTracking() → debe funcionar sin ready()
3. **Reinicio completo**: Cerrar app → Abrir → ready() → startTracking() → debe funcionar
4. **Background iOS**: Minimizar → iOS relanza → ready() debe haberse ejecutado automáticamente

## Logs Esperados

```
🚀 [InitServices] Inicializando BackgroundGeolocation...
📍 [BackgroundGeolocation] Llamando ready() - SOLO UNA VEZ por launch
📍 [BackgroundGeolocation] Configurando event listeners...
📍 [BackgroundGeolocation] Ready completado correctamente
🚀 [InitServices] BackgroundGeolocation listo

// Más tarde, al cargar orden:
📍 [BackgroundGeolocation] Iniciando tracking para: {...}
📍 [BackgroundGeolocation] Tracking iniciado correctamente

// Al hacer logout:
📍 [BackgroundGeolocation] Limpiando datos de tracking...
📍 [BackgroundGeolocation] Datos de tracking limpiados

// Al cargar nueva orden (sin reiniciar app):
📍 [BackgroundGeolocation] Iniciando tracking para: {...}
📍 [BackgroundGeolocation] Tracking iniciado correctamente
```

## Estado Final

✅ **Implementación completa** siguiendo el patrón oficial de react-native-background-geolocation
✅ **Una sola llamada a ready()** por launch de la aplicación
✅ **Tracking controlado** con start()/stop() según necesidad
✅ **Compatibilidad iOS** para relanzamiento en background
✅ **Performance optimizada** sin re-configuraciones innecesarias
