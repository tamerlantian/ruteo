# Análisis del Flujo de Entrega - Reporte de Puntos Críticos

**Fecha:** 2026-01-26
**Módulo Analizado:** Visita - Flujo de creación y envío de entregas

---

## 1. FLUJO ACTUAL

### 1.1 Componentes del Flujo

```
Usuario completa formulario
    ↓
[entrega-form.screen.tsx] - Formulario UI
    ↓
[entrega-form.view-model.ts] - Lógica de presentación
    ↓ (guarda en Redux primero - línea 127-131)
    ↓
[use-visita-processing.hook.ts] - Orquestador de procesamiento
    ↓
[visita-processing.service.ts] - Servicio de procesamiento
    ↓
[visita.repository.ts] - Capa de API
    ↓
[http-base.repository.ts] - Cliente HTTP
    ↓
Backend API
```

### 1.2 Secuencia de Operaciones

1. **Usuario completa formulario** (entrega-form.screen.tsx:188)
   - Campos: recibe, numeroIdentificacion, celular, parentesco, firma, fotos

2. **View Model valida y procesa** (entrega-form.view-model.ts:114-156)
   - Valida condiciones iniciales
   - **CRÍTICO:** Guarda datos en Redux PRIMERO (línea 127-131)
   - Llama a `procesarVisitasEnLote`

3. **Hook procesa el lote** (use-visita-processing.hook.ts:88-183)
   - Itera sobre cada visita
   - Llama al service por cada una
   - Actualiza Redux según resultado

4. **Service procesa visita individual** (visita-processing.service.ts:43-100)
   - Busca visita en Redux
   - Valida datos del formulario
   - Construye FormData
   - Llama al repository

5. **Repository envía datos** (visita.repository.ts:73-83)
   - Usa `postMultipart` con FormData
   - Endpoint: `ruteo/visita/entrega/`

6. **HTTP Base Repository** (http-base.repository.ts:299-316)
   - Timeout: 30 segundos
   - Interceptor para token refresh (401)
   - Manejo de errores genérico

---

## 2. PROBLEMAS CRÍTICOS IDENTIFICADOS

### 🔴 **CRÍTICO 1: Race Condition - Estado Inconsistente**

**Problema:** El caso que mencionas es REAL y NO está cubierto.

**Escenario:**
```
1. Usuario presiona "Entregar"
2. App guarda datos en Redux (visitaId + datosFormulario)
3. App envía datos al backend
4. Backend procesa exitosamente y marca como entregado en BD
5. Backend envía respuesta 200
❌ 6. PÉRDIDA DE CONEXIÓN - Cliente no recibe el 200
7. App marca la visita como "error" en Redux
8. Usuario ve la entrega como "fallida" pero en el backend está "entregada"
```

**Ubicación del código:**
- `use-visita-processing.hook.ts:124-129` - Solo marca como entregada si recibe respuesta exitosa
- `visita-processing.service.ts:95` - Return exitoso depende de recibir respuesta

**Consecuencias:**
- ✗ Estado inconsistente entre app y backend
- ✗ Usuario intenta reenviar → posible duplicación
- ✗ Reportes incorrectos
- ✗ Datos guardados en Redux obsoletos

**Solución requerida:**
- Implementar reconciliación de estado al reconectar
- Consultar al backend el estado real antes de marcar como error
- Implementar identificador único por intento (idempotencia)

---

### 🔴 **CRÍTICO 2: No hay Validación de Conexión Antes de Enviar**

**Problema:** No se valida conexión de red antes de intentar enviar.

**Código actual:**
```typescript
// entrega-form.view-model.ts:114-156
const onSubmit = async (data: EntregaFormData) => {
  if (!validateInitialConditions()) { return; }

  // ❌ NO HAY VALIDACIÓN DE RED AQUÍ

  await procesarVisitasEnLote(visitaIds, {...}, data);
}
```

**Existe el servicio pero NO se usa:**
- `network.service.ts` - `isConnected()` disponible pero no utilizado
- No hay verificación proactiva de conectividad

**Consecuencias:**
- ✗ Intentos de envío sin conexión
- ✗ Timeouts innecesarios (30 segundos esperando)
- ✗ Experiencia de usuario deficiente
- ✗ Mensajes de error confusos

**Solución requerida:**
```typescript
// Antes de enviar, validar:
const isConnected = await networkService.isConnected();
if (!isConnected) {
  // Mostrar mensaje específico
  // Ofrecer guardar para envío posterior
  // No intentar el envío
}
```

---

### 🔴 **CRÍTICO 3: No hay Estado Intermedio "Enviando"**

**Problema:** Las visitas saltan directamente de "pending" a "entregada" o "error".

**Estados actuales:**
```typescript
// visita.interface.ts:40
export type VisitaEstado = 'sync' | 'pending' | 'error';
```

**Problema:**
- ✗ No hay indicador de "en proceso de envío"
- ✗ Si la app se cierra durante el envío, se pierde el contexto
- ✗ No se puede distinguir entre "no enviado" y "enviando"

**Solución requerida:**
```typescript
export type VisitaEstado =
  | 'pending'      // No enviado
  | 'sending'      // En proceso de envío
  | 'sent'         // Enviado, esperando confirmación
  | 'delivered'    // Confirmado por backend
  | 'error'        // Error
  | 'sync';        // Sincronizado
```

---

### 🔴 **CRÍTICO 4: No hay Idempotencia**

**Problema:** Si se reintenta el envío después de que el backend ya procesó, se puede duplicar.

**Código actual:**
```typescript
// visita.repository.ts:55-65
async entregaVisita(schemaName: string, payloadVisita: CrearVisita) {
  const url = await buildUrlWithSubdomain(schemaName, 'ruteo/visita/entrega/');
  return this.post<VisitaResponse[]>(url, payloadVisita);
  // ❌ No hay token de idempotencia
}
```

**Escenario problemático:**
```
1. Envío exitoso en backend pero cliente no recibe 200
2. Usuario ve error
3. Usuario reintenta
4. Backend procesa OTRA VEZ la misma entrega
5. Datos duplicados
```

**Solución requerida:**
- Generar ID único por intento de envío (UUID)
- Enviar ese ID al backend en cada request
- Backend debe validar si ya procesó ese ID
- Si ya existe, devolver la respuesta original (idempotente)

---

### 🔴 **CRÍTICO 5: Timeout Insuficiente para Multipart**

**Problema:** 30 segundos puede ser insuficiente para enviar múltiples fotos en redes lentas.

**Código:**
```typescript
// http-base.repository.ts:311
timeout: options.timeout || 30000, // 30 segundos para multipart
```

**Cálculo del problema:**
```
- 5 fotos × 2MB cada una = 10MB
- Red lenta 3G: ~1Mbps = 125KB/s
- Tiempo necesario: 10MB / 125KB/s = 80 segundos
- Timeout actual: 30 segundos
- ❌ TIMEOUT GARANTIZADO
```

**Solución requerida:**
- Aumentar timeout para multipart a 120 segundos
- O implementar compresión de imágenes antes de enviar
- O implementar envío progresivo (una foto a la vez)
- O mostrar progreso de subida al usuario

---

### 🟡 **CRÍTICO 6: No hay Cola de Reintentos Automáticos**

**Problema:** Si falla el envío, solo hay reintento manual.

**Código actual:**
```typescript
// use-visita-processing.hook.ts:88-183
// Si falla → marca como error → FIN
// No hay reintento automático
```

**Casos no cubiertos:**
- ✗ Pérdida momentánea de conexión
- ✗ Timeout temporal del servidor
- ✗ Error transitorio de red

**Solución requerida:**
- Implementar cola de reintentos con backoff exponencial
- Política de reintentos: 3 intentos con delays: 5s, 15s, 30s
- Persistir cola en AsyncStorage para sobrevivir cierre de app
- Procesar cola automáticamente al recuperar conexión

---

### 🟡 **CRÍTICO 7: No hay Persistencia de Cola de Envío**

**Problema:** Si la app se cierra con envíos pendientes, se pierden.

**Código actual:**
```typescript
// visita.slice.ts - Redux state es persistido por redux-persist
// PERO no hay cola separada de "pendientes de envío"
// Los datos están guardados en visitas[].datos_formulario_guardados
```

**Problema:**
- Los datos SÍ se persisten
- PERO no hay un mecanismo que al abrir la app detecte y procese automáticamente los pendientes

**Solución requerida:**
- Al iniciar la app, detectar visitas con `datos_formulario_guardados` no vacío
- Preguntar al usuario si desea reenviar
- O procesar automáticamente con permiso previo

---

### 🟡 **CRÍTICO 8: Manejo de Errores Genérico**

**Problema:** No se distinguen tipos de errores de red.

**Código:**
```typescript
// error.interceptor.ts - Solo maneja códigos HTTP
// ❌ No maneja errores de red (ECONNREFUSED, ETIMEDOUT, etc.)
```

**Errores de red no manejados específicamente:**
- `ECONNREFUSED` - Servidor no disponible
- `ETIMEDOUT` - Timeout de red
- `ENOTFOUND` - DNS no resuelto
- `Network Error` - Sin conexión

**Solución requerida:**
```typescript
// Clasificar errores:
if (error.code === 'ECONNABORTED') {
  // Timeout → reintentar
} else if (error.message === 'Network Error') {
  // Sin red → guardar para después
} else if (error.response?.status === 500) {
  // Error de servidor → reintentar con delay
}
```

---

### 🟡 **CRÍTICO 9: No hay Confirmación de Escritura en BD del Backend**

**Problema:** Backend puede responder 200 antes de confirmar escritura en BD.

**Escenario:**
```
1. Backend recibe request
2. Backend responde 200 OK
3. Backend intenta escribir en BD
4. ❌ BD falla (deadlock, espacio, etc.)
5. Cliente cree que fue exitoso pero no está en BD
```

**Nota:** Esto depende de la implementación del backend.

**Solución requerida (backend):**
- Backend debe responder 200 SOLO después de confirmar escritura en BD
- O usar transacciones con commit antes de responder
- O implementar webhook de confirmación asíncrona

**Solución requerida (app):**
- Implementar polling de confirmación después de recibir 200
- Consultar estado de la visita después de X segundos
- Si no está marcada como entregada en backend → marcar como "pendiente de confirmación"

---

## 3. PROBLEMAS ADICIONALES (No Críticos pero Importantes)

### 🟢 **MENOR 1: Logs Insuficientes para Debugging**

**Problema:** No hay logs estructurados de todo el flujo.

**Solución:**
- Implementar logger con niveles (info, warn, error)
- Logear cada paso del flujo con timestamp
- Incluir IDs de visita y correlación

### 🟢 **MENOR 2: No hay Métricas de Performance**

**Problema:** No se mide tiempo de envío ni éxito/fallo.

**Solución:**
- Medir tiempo de cada envío
- Contador de éxitos/fallos por sesión
- Tamaño de payload enviado
- Enviar métricas a analytics

### 🟢 **MENOR 3: Compresión de Imágenes**

**Problema:** Fotos se envían sin compresión óptima.

**Solución:**
- Comprimir fotos antes de enviar (calidad 80%, max 1920px)
- Reducir tamaño promedio de 2MB a 500KB
- Mejorar tiempos de envío

---

## 4. RECOMENDACIONES DE IMPLEMENTACIÓN

### 4.1 Prioridad Alta (Implementar YA)

1. **Validación de red antes de enviar** (CRÍTICO 2)
   - Fácil de implementar
   - Alto impacto en UX

2. **Aumentar timeout para multipart** (CRÍTICO 5)
   - Cambio de 1 línea
   - Previene fallos innecesarios

3. **Estado "enviando"** (CRÍTICO 3)
   - Necesario para tracking
   - Base para otras mejoras

### 4.2 Prioridad Media (Implementar en Sprint Siguiente)

4. **Idempotencia con UUID** (CRÍTICO 4)
   - Requiere cambio en backend y app
   - Previene duplicaciones

5. **Reconciliación de estado** (CRÍTICO 1)
   - Requiere endpoint de consulta en backend
   - Soluciona el caso principal que mencionas

6. **Cola de reintentos automáticos** (CRÍTICO 6)
   - Requiere diseño de política de reintentos
   - Gran mejora en robustez

### 4.3 Prioridad Baja (Backlog)

7. **Manejo granular de errores** (CRÍTICO 8)
8. **Persistencia y auto-procesamiento** (CRÍTICO 7)
9. **Compresión de imágenes** (MENOR 3)

---

## 5. PROPUESTA DE ARQUITECTURA MEJORADA

### 5.1 Nuevo Flujo con Queue System

```
Usuario → Formulario → Validación de Red
                           ↓
                    Guardar en Queue
                           ↓
                    Queue Processor
                           ↓
          ┌────────────────┴────────────────┐
          ↓                                 ↓
    Envío con UUID              Estado = "sending"
          ↓                                 ↓
    Respuesta Backend           Actualizar Estado
          ↓                                 ↓
    ¿200 OK?                       ¿Timeout?
          ↓                                 ↓
    Confirmar en BD              Reintento (3x)
          ↓                                 ↓
    Marcar "delivered"          ¿Persistir?
```

### 5.2 Nuevos Componentes Necesarios

1. **SendQueue Service**
   - Cola persistente de envíos pendientes
   - Procesador con reintentos
   - Backoff exponencial

2. **IdempotencyService**
   - Generar UUIDs
   - Tracking de intentos
   - Validación de duplicados

3. **ReconciliationService**
   - Consultar estado real del backend
   - Sincronizar estado local
   - Resolver conflictos

4. **NetworkMonitor**
   - Listener de cambios de conexión
   - Auto-trigger de envíos pendientes
   - Notificaciones al usuario

---

## 6. ENDPOINTS DE BACKEND NECESARIOS

Para soportar las mejoras, el backend necesita:

### 6.1 Endpoint de Idempotencia

```
POST /ruteo/visita/entrega/
Headers:
  - X-Idempotency-Key: {UUID}

Response si ya existe:
  - 200 OK (misma respuesta original)
  - Header: X-Idempotency-Hit: true
```

### 6.2 Endpoint de Consulta de Estado

```
GET /ruteo/visita/{visitaId}/estado/
Response:
{
  "id": 123,
  "estado_entregado": true,
  "fecha_entrega": "2026-01-26 10:30:00",
  "ultima_actualizacion": "2026-01-26 10:30:15"
}
```

### 6.3 Endpoint de Reconciliación por Lote

```
POST /ruteo/visita/reconciliar/
Body: {
  "visitas": [
    {"id": 123, "cliente_cree_estado": "error"},
    {"id": 124, "cliente_cree_estado": "pending"}
  ]
}
Response: [
  {"id": 123, "estado_real": "entregado", "necesita_sync": true},
  {"id": 124, "estado_real": "pending", "necesita_sync": false}
]
```

---

## 7. CASOS DE USO CUBIERTOS VS NO CUBIERTOS

### ✅ Casos CUBIERTOS actualmente:

1. Envío exitoso con conexión estable
2. Error de servidor (500) con mensaje al usuario
3. Token expirado (401) con refresh automático
4. Validación de formulario local

### ❌ Casos NO CUBIERTOS actualmente:

1. **Backend responde 200 pero cliente no recibe** (TU CASO PRINCIPAL)
2. Pérdida de conexión durante envío
3. Timeout por red lenta con imágenes pesadas
4. App cerrada con envíos pendientes
5. Reintento después de éxito parcial en backend
6. Duplicación de entregas por reintentos
7. Red inestable con cortes intermitentes
8. Backend responde 200 pero falla escritura en BD
9. Múltiples dispositivos sincronizando misma visita

---

## 8. ESTIMACIÓN DE IMPACTO

### 8.1 Frecuencia Estimada de Problemas

Asumiendo 1000 entregas diarias:

- **CRÍTICO 1** (Race condition): ~2% (20 casos/día) ⚠️
- **CRÍTICO 2** (Sin validación red): ~5% (50 casos/día) ⚠️
- **CRÍTICO 5** (Timeout): ~1-3% según cobertura (10-30 casos/día) ⚠️
- **CRÍTICO 4** (Duplicados): ~0.5% (5 casos/día)

### 8.2 Costo de NO Arreglar

- Pérdida de confianza del usuario
- Soporte adicional para resolver inconsistencias
- Duplicación de entregas (costo operativo)
- Datos incorrectos en reportes
- Posible pérdida de entregas no registradas

---

## 9. CONCLUSIÓN

El flujo actual funciona en el "happy path" pero tiene **vulnerabilidades críticas** en casos de red inestable o intermitente, que son comunes en apps móviles.

### El caso que mencionas (backend marca como entregado pero app no recibe el 200) es:
- ✅ **REAL**
- ✅ **NO ESTÁ CUBIERTO**
- ✅ **OCURRIRÁ EN PRODUCCIÓN**
- ✅ **REQUIERE SOLUCIÓN PRIORITARIA**

### Próximos pasos recomendados:

1. Implementar validación de red (2 horas)
2. Aumentar timeout multipart (10 minutos)
3. Agregar estado "sending" (4 horas)
4. Diseñar e implementar sistema de idempotencia (2-3 días)
5. Implementar reconciliación de estado (2-3 días)
6. Implementar cola de reintentos (3-4 días)

**Total estimado:** ~2 semanas para cubrir todos los casos críticos.

---

**Fin del reporte.**
