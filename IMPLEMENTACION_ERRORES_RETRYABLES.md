# Implementación: Diferenciación de Errores Retryables vs No-Retryables

## ✅ Estado: COMPLETADO

Fecha: 2026-01-26

## Resumen

Se implementó exitosamente un sistema de clasificación automática de errores HTTP que diferencia entre errores retryables (problemas de red/servidor) y errores no-retryables (problemas de validación/cliente). Esto mejora significativamente la experiencia de usuario al prevenir reintentos inútiles de entregas con errores de validación.

## Archivos Modificados (11 total)

**Total: 11 archivos**

1. `/src/core/interfaces/api.interface.ts`
2. `/src/core/interceptors/error.interceptor.ts`
3. `/src/modules/visita/interfaces/visita.interface.ts`
4. `/src/modules/visita/services/visita-processing.service.ts`
5. `/src/modules/visita/store/slice/visita.slice.ts`
6. `/src/modules/visita/hooks/use-visita-processing.hook.ts`
7. `/src/modules/visita/hooks/use-retry-visitas.hook.ts`
8. `/src/modules/visita/store/selector/visita.selector.ts`
9. `/src/modules/home/screens/dashboard.screen.tsx`
10. `/src/modules/visita/components/visita-card/visita-card.style.ts` ⭐ Nuevo
11. `/src/modules/visita/components/visita-card/visita-card.component.tsx` ⭐ Nuevo

### 1. Core Layer - Interfaces y Clasificación de Errores

#### `/src/core/interfaces/api.interface.ts`
- ✅ Agregado campo `isRetryable?: boolean` a `ApiErrorResponse`
- Permite que todos los errores HTTP incluyan su clasificación

#### `/src/core/interceptors/error.interceptor.ts`
- ✅ Implementada función `determineIfRetryable()` que clasifica errores automáticamente
- ✅ Actualizado `handleErrorResponse()` para incluir clasificación en errores sin handler específico
- ✅ Actualizado `error400()`: `isRetryable: false` (errores de validación)
- ✅ Actualizado `error401()`: `isRetryable: false` (manejado por token refresh)
- ✅ Actualizado `error404()`: `isRetryable: false` (recurso no encontrado)
- ✅ Actualizado `error405()`: `isRetryable: false` (método no permitido)
- ✅ Actualizado `error500()`: `isRetryable: true` (problema del servidor)

### 2. Module Layer - Interfaces de Datos

#### `/src/modules/visita/interfaces/visita.interface.ts`
- ✅ Agregado campo `es_error_retryable?: boolean` a `VisitaResponse`
- Permite almacenar la clasificación del error en Redux

#### `/src/modules/visita/services/visita-processing.service.ts`
- ✅ Agregado import de `ApiErrorResponse`
- ✅ Agregado campo `apiError?: ApiErrorResponse` a `VisitaProcessingResult`
- ✅ Actualizado catch block en `procesarVisitaIndividual()` para incluir `apiError` completo en resultado

### 3. Module Layer - Estado (Redux)

#### `/src/modules/visita/store/slice/visita.slice.ts`
- ✅ Agregado parámetro `esErrorRetryable?: boolean` al action `cambiarEstadoVisita`
- ✅ Actualizado reducer para guardar `es_error_retryable` en el estado de la visita

### 4. Module Layer - Hooks de Procesamiento

#### `/src/modules/visita/hooks/use-visita-processing.hook.ts`
- ✅ Actualizado `procesarVisitaIndividual()` para extraer `isRetryable` de `result.apiError`
- ✅ Actualizado `procesarVisitasEnLote()` para extraer y pasar `esErrorRetryable` al dispatch
- Default: `esErrorRetryable = true` para seguridad (retrocompatibilidad)

#### `/src/modules/visita/hooks/use-retry-visitas.hook.ts`
- ✅ Agregado import de `selectVisitas` y hooks de Redux
- ✅ Agregado import de Toast para notificaciones
- ✅ Implementada validación en `reintentarVisitasConError()`:
  - Filtra solo visitas con `es_error_retryable !== false`
  - Muestra warning en consola para visitas no-retryables omitidas
  - Muestra toast info si hay visitas no-retryables
  - Muestra toast error si no hay visitas retryables
  - Previene ejecución si todas las visitas son no-retryables

### 5. Module Layer - Selectores

#### `/src/modules/visita/store/selector/visita.selector.ts`
- ✅ Agregado selector `selectVisitasConErrorRetryables`: filtra visitas retryables
- ✅ Agregado selector `selectVisitaIdsConErrorRetryables`: IDs de visitas retryables
- ✅ Actualizado selector `selectVisitasSeleccionadasConDatosGuardados`: filtra solo retryables

### 6. UI Layer - Pantallas

#### `/src/modules/home/screens/dashboard.screen.tsx`
- ✅ Agregado import de `selectVisitasConErrorRetryables`
- ✅ Agregado hook para obtener visitas retryables
- ✅ Actualizado renderizado del botón de retry para mostrarse solo cuando `visitasConErrorRetryables.length > 0`
- ✅ Actualizado contador del botón para mostrar solo visitas retryables

#### `/src/modules/visita/screen/visitas/visitas.view-model.ts`
- ✅ Ya usa `selectVisitasSeleccionadasConDatosGuardados` que ahora filtra por retryables
- No requiere cambios adicionales

#### `/src/modules/visita/components/visita-card/visita-card.style.ts`
- ✅ Agregado `containerWarning`: Borde naranja (#ff9500) con fondo suave (#fffbf0)
- ✅ Agregado `warningBadge`: Badge naranja para errores retryables
- ✅ Agregado `warningBanner`: Banner naranja con mensaje
- ✅ Agregado `warningText`: Texto naranja para el banner

#### `/src/modules/visita/components/visita-card/visita-card.component.tsx`
- ✅ Agregada clasificación de errores:
  - `isNonRetryableError`: Solo errores con `es_error_retryable === false`
  - `isRetryableError`: Errores con `es_error_retryable !== false`
- ✅ Aplicación diferenciada de estilos:
  - Errores NO-retryables: Estilos rojos severos (containerError, errorBadge, errorBanner)
  - Errores retryables: Estilos naranjas suaves (containerWarning, warningBadge, warningBanner)
- ✅ Badge "Error" (rojo) solo para errores no-retryables
- ✅ Badge "Pendiente" (naranja) con ícono de sync para errores retryables

## Lógica de Clasificación de Errores

### Errores Retryables (isRetryable: true)
- **Network errors**: Sin respuesta del servidor (`!error.response && error.request`)
- **408 Request Timeout**: Timeout de solicitud
- **429 Too Many Requests**: Rate limiting
- **500 Internal Server Error**: Error del servidor
- **502 Bad Gateway**: Gateway inválido
- **503 Service Unavailable**: Servicio no disponible
- **504 Gateway Timeout**: Timeout del gateway
- **Unknown status codes**: Default retryable por seguridad

### Errores No-Retryables (isRetryable: false)
- **400 Bad Request**: Errores de validación
- **401 Unauthorized**: Ya manejado por token refresh
- **404 Not Found**: Recurso no existe
- **405 Method Not Allowed**: Método no permitido
- **4xx Client Errors** (excepto 408, 429): Errores del cliente

## Flujo de Datos

```
1. HTTP Request → Error (Axios)
2. Error Interceptor → Clasifica error (isRetryable)
3. Repository → Retorna ApiErrorResponse con clasificación
4. Processing Service → Captura apiError completo
5. Processing Hook → Extrae isRetryable
6. Redux Dispatch → Guarda es_error_retryable en estado
7. Selector → Filtra visitas retryables
8. UI → Muestra botón solo para retryables
9. Retry Hook → Valida y filtra antes de reintentar
```

## Retrocompatibilidad

✅ **Totalmente retrocompatible**
- Errores antiguos sin clasificación son tratados como retryables (default `true`)
- Usa comparación `!== false` en lugar de `=== true`
- No requiere migración de datos existentes

## Casos de Uso

### Caso 1: Error de Validación (400) - NO RETRYABLE
```typescript
// API retorna 400: "Campo 'recibe' es requerido"
// Interceptor clasifica: isRetryable = false
// Redux guarda: es_error_retryable = false
// Card UI: Borde ROJO + Badge "Error" (rojo) + Banner rojo
// Dashboard: NO muestra botón de retry
// Retry Hook: Omite esta visita si se intenta
// Toast: "Corrige los errores de validación manualmente"
```

### Caso 2: Error de Servidor (500) - RETRYABLE
```typescript
// API retorna 500: "Servidor fuera de línea"
// Interceptor clasifica: isRetryable = true
// Redux guarda: es_error_retryable = true
// Card UI: Borde NARANJA + Badge "Pendiente" (naranja) + Banner naranja
// Dashboard: SÍ muestra botón de retry
// Retry Hook: Permite reintento
// Toast: "X reintento(s) exitoso(s)"
```

### Caso 3: Error de Red (Sin Conexión) - RETRYABLE
```typescript
// No hay respuesta del servidor
// Interceptor clasifica: isRetryable = true
// Redux guarda: es_error_retryable = true
// Card UI: Borde NARANJA + Badge "Pendiente" (naranja) + Banner naranja
// Dashboard: SÍ muestra botón de retry
// Retry Hook: Permite reintento
```

## Beneficios

1. ✅ **Mejor UX**: Usuario no ve botones de retry para errores no solucionables
2. ✅ **Diferenciación Visual Clara**:
   - Rojo = Error crítico que requiere acción manual
   - Naranja = Error temporal que se puede reintentar
3. ✅ **Mensajes Claros**: Toast indica si error requiere corrección manual
4. ✅ **Prevención de Spam**: Evita reintentos inútiles al servidor
5. ✅ **Feedback Visual Inmediato**: Usuario identifica al instante qué visitas puede reintentar
6. ✅ **Logs Informativos**: Console warnings para debugging
7. ✅ **Escalable**: Fácil agregar nuevos códigos de error
8. ✅ **Consistente**: Mismo patrón se puede aplicar a novedades y soluciones

## Testing Recomendado

### Test 1: Error 400 (Validación) - UI Roja
- [ ] Enviar entrega sin campo requerido
- [ ] Verificar `es_error_retryable === false` en Redux DevTools
- [ ] Verificar card con:
  - [ ] Borde ROJO (#ff3b30)
  - [ ] Fondo rosa claro (#fff5f5)
  - [ ] Badge "Error" en rojo
  - [ ] Banner rojo con mensaje de error
  - [ ] Ícono de alerta roja
- [ ] Verificar que NO aparece botón de retry en Dashboard
- [ ] Verificar log: `isRetryable: false`

### Test 2: Error 500 (Servidor) - UI Naranja
- [ ] Simular error 500 del backend
- [ ] Verificar `es_error_retryable === true` en Redux DevTools
- [ ] Verificar card con:
  - [ ] Borde NARANJA (#ff9500)
  - [ ] Fondo amarillo claro (#fffbf0)
  - [ ] Badge "Pendiente" en naranja
  - [ ] Banner naranja con mensaje
  - [ ] Ícono de sync naranja
- [ ] Verificar que SÍ aparece botón de retry en Dashboard
- [ ] Verificar log: `isRetryable: true`

### Test 3: Error de Red - UI Naranja
- [ ] Deshabilitar WiFi/datos móviles
- [ ] Intentar enviar entrega
- [ ] Verificar `es_error_retryable === true` en Redux DevTools
- [ ] Verificar estilos naranjas (igual que Test 2)
- [ ] Verificar que SÍ aparece botón de retry

### Test 4: Retry Mixto
- [ ] Crear 2 visitas: una con 400 y otra con 500
- [ ] Seleccionar ambas para retry
- [ ] Verificar toast info sobre visitas omitidas
- [ ] Verificar warning en consola
- [ ] Verificar que solo se reintenta la visita con 500

### Test 5: Retrocompatibilidad
- [ ] Verificar que errores antiguos (sin clasificación) son retryables
- [ ] Verificar comparación `es_error_retryable !== false`

## Próximos Pasos (Opcional)

1. Aplicar mismo patrón a módulo de novedades
2. Aplicar mismo patrón a módulo de soluciones
3. Agregar analytics para tracking de errores retryables vs no-retryables
4. Agregar badge UI que indique "Error de validación" vs "Error temporal"
5. Implementar delays progresivos para reintentos de errores 429 (rate limiting)

## Notas Importantes

- ⚠️ Los errores 401 (Unauthorized) ya se manejan automáticamente con token refresh en `HttpBaseRepository`, por lo que nunca llegan al procesamiento de visitas
- ✅ La clasificación se hace una sola vez en el interceptor y se propaga automáticamente
- ✅ No requiere cambios en componentes existentes, solo en selectores y hooks
- ✅ Compatible con sistema de entrega por lotes y reintentos coordinados
