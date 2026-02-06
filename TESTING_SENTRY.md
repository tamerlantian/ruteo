# 🔍 Guía de Prueba: Sentry Integration

## Verificación de Integración

### ✅ Configuración Actual

**Sentry está configurado con:**
- DSN: Configurado ✓
- Environment: `development` / `production` (basado en `__DEV__`)
- Enabled: Solo en producción (cambia a `true` para probar en desarrollo)
- Error tracking: ✓
- Performance monitoring: ✓ (20% sample rate)
- Session tracking: ✓
- Native crash handling: ✓

**Error Boundaries integrados:**
- ✅ Root level (App.tsx)
- ✅ Navigation level (RootNavigator.tsx)
- ✅ Form level (EntregaFormScreen, NovedadFormScreen)
- ✅ Component level (ErrorBoundary base)

---

## 🧪 Cómo Probar Sentry

### Opción 1: Botón de Prueba en Dashboard (Actual)

Ya tienes un botón de prueba en el Dashboard:

```typescript
<Button
  title='Try!'
  onPress={() => {
    Sentry.captureException(new Error('First error'))
  }}
/>
```

**Pasos:**
1. Abre la app
2. Navega al Dashboard
3. Presiona el botón "Try!"
4. Ve a tu panel de Sentry: https://sentry.io
5. Deberías ver el error "First error" en el dashboard

---

### Opción 2: Probar Error Boundaries

Usa el `ErrorBoundaryTester` que creamos antes:

```typescript
// En dashboard.screen.tsx
import { ErrorBoundaryTester } from '../../../shared/components/error-boundary/ErrorBoundaryTester';

// En el render:
<ErrorBoundaryTester />
```

**Pasos:**
1. Presiona "Lanzar Error de Render"
2. El error boundary captura el error
3. Sentry recibe el error automáticamente
4. En Sentry verás:
   - Error message
   - Component stack
   - Error boundary level (form/navigation/root)
   - Context data

---

### Opción 3: Pruebas Específicas por Nivel

#### A. Root Error Boundary

```typescript
// Modifica App.tsx temporalmente
function AppContent() {
  throw new Error('Test root error boundary');
  // ...
}
```

**Esperado en Sentry:**
- Level: `fatal`
- Tag: `error_boundary: root`
- Context: Component stack, error boundary info

#### B. Navigation Error Boundary

Navega a una pantalla y lanza un error en el render.

**Esperado en Sentry:**
- Level: `error`
- Tag: `error_boundary: navigation`
- Context: Authentication state, component stack

#### C. Form Error Boundary

En EntregaFormScreen o NovedadFormScreen:

```typescript
// Dentro del componente
if (someCondition) {
  throw new Error('Test form error');
}
```

**Esperado en Sentry:**
- Level: `error`
- Tag: `form_type: entrega` o `novedad`
- Context: Visitas count, visitas IDs, component stack

---

## 🚀 Habilitar Sentry en Desarrollo (para pruebas)

Por defecto, Sentry está **deshabilitado en desarrollo**. Para probarlo:

**App.tsx (línea ~31):**
```typescript
// Cambia esto:
enabled: !__DEV__, // Solo producción

// Por esto:
enabled: true, // Siempre habilitado (para probar)
```

**IMPORTANTE:** Revierte este cambio antes de producción para evitar spam de errores de desarrollo.

---

## 📊 Qué Deberías Ver en Sentry

### 1. Error Events

Cada error capturado incluye:
- **Message**: Descripción del error
- **Stack Trace**: Con source maps (si están configurados)
- **Breadcrumbs**: Acciones del usuario antes del error
- **Context**:
  - Device info
  - OS version
  - App version
  - User info (si está configurado)
  - Custom contexts (react, form, navigation, etc.)
- **Tags**:
  - error_boundary: root/navigation/form
  - form_type: entrega/novedad
  - location: archivo donde ocurrió

### 2. Performance Monitoring

Si navegas entre pantallas, deberías ver:
- Transaction traces
- Navigation timing
- Component render times

### 3. Session Tracking

Sentry rastreará:
- App launches
- Session duration
- Crashes vs clean exits

---

## 🎯 Escenarios de Prueba Completos

### Escenario 1: Error en Inicialización
```typescript
// Simular error en initializeServices()
// src/core/services/init-services.ts
throw new Error('Service initialization failed');
```

**Verificar:**
- [ ] Error aparece en Sentry
- [ ] Tag: `location: app_initialization`
- [ ] Level: `error`
- [ ] App continúa funcionando (no crash total)

### Escenario 2: Error en Render de Componente
```typescript
// Cualquier componente
const MyComponent = () => {
  throw new Error('Component render error');
  return <View />;
};
```

**Verificar:**
- [ ] Error boundary captura el error
- [ ] UI de fallback se muestra
- [ ] Error en Sentry con component stack
- [ ] User puede recuperarse (botón "Intentar nuevamente")

### Escenario 3: Error en Event Handler
```typescript
// Este NO será capturado por error boundary
const handlePress = () => {
  throw new Error('Event handler error');
};

// Necesita try-catch manual
const handlePress = () => {
  try {
    // código que falla
  } catch (error) {
    Sentry.captureException(error);
  }
};
```

**Verificar:**
- [ ] Error en Sentry
- [ ] App puede continuar (con try-catch)
- [ ] Sin try-catch: app crashea (esperado)

### Escenario 4: Error en API Call
```typescript
// En un view model o repository
try {
  await api.fetchData();
} catch (error) {
  Sentry.captureException(error, {
    tags: {
      api_endpoint: '/api/visitas',
      http_method: 'GET',
    },
  });
}
```

**Verificar:**
- [ ] Error en Sentry con tags personalizados
- [ ] Stack trace completo
- [ ] Request/response data (si está configurado)

---

## 🔧 Configuración Avanzada

### User Context

Para rastrear qué usuario experimentó el error:

```typescript
// Cuando el usuario hace login
Sentry.setUser({
  id: user.id,
  username: user.username,
  email: user.email,
});

// Cuando hace logout
Sentry.setUser(null);
```

**Dónde agregarlo:**
- `src/modules/auth/context/auth.context.tsx`
- En el `login` success handler
- En el `logout` handler

### Custom Tags

Para filtrar errores más fácilmente:

```typescript
Sentry.setTag('orden_entrega', ordenEntrega);
Sentry.setTag('subdominio', subdominio);
Sentry.setTag('despacho', despacho);
```

### Breadcrumbs Personalizados

Para rastrear flujo del usuario:

```typescript
Sentry.addBreadcrumb({
  category: 'delivery',
  message: 'User started delivery process',
  level: 'info',
  data: {
    visita_id: visitaId,
    timestamp: new Date().toISOString(),
  },
});
```

---

## 📱 Source Maps (Opcional pero Recomendado)

Para ver stack traces legibles en producción:

### iOS
```bash
# En el build de producción
npx sentry-cli sourcemaps upload \
  --org your-org \
  --project ruteo-mobile \
  --release $RELEASE_VERSION \
  ios/
```

### Android
```bash
# Configurar en android/app/build.gradle
apply from: "../../node_modules/@sentry/react-native/sentry.gradle"
```

---

## 🧹 Limpieza Después de Probar

Una vez verificado que Sentry funciona:

1. **Eliminar botón de prueba del Dashboard**
   ```typescript
   // Eliminar:
   <Button title='Try!' onPress={...} />
   ```

2. **Revertir `enabled` en App.tsx**
   ```typescript
   // De vuelta a:
   enabled: !__DEV__, // Solo producción
   ```

3. **Eliminar componentes de prueba**
   ```bash
   rm src/shared/components/error-boundary/ErrorBoundaryTester.tsx
   ```

---

## ✅ Checklist de Verificación

Antes de considerar Sentry completamente integrado:

- [ ] ✅ Sentry inicializado en App.tsx
- [ ] ✅ Error boundaries integrados con Sentry
- [ ] ✅ Errores de inicialización capturados
- [ ] ✅ Errores de render capturados
- [ ] ✅ Probado con error real
- [ ] ✅ Error aparece en dashboard de Sentry
- [ ] ✅ Stack traces son legibles
- [ ] ✅ Tags y contexts apropiados
- [ ] ✅ User context configurado (opcional)
- [ ] ✅ Performance monitoring funciona
- [ ] ✅ Session tracking funciona
- [ ] ✅ `enabled: !__DEV__` para producción
- [ ] ✅ Componentes de prueba eliminados
- [ ] ✅ Source maps configurados (opcional)

---

## 🚨 Troubleshooting

### "No veo errores en Sentry"

**Posibles causas:**
1. `enabled: false` en configuración
   - Solución: Cambia a `true` temporalmente
2. Red bloqueada
   - Verifica conectividad
3. DSN incorrecto
   - Verifica en App.tsx línea 26

### "Stack traces son ilegibles"

**Causa:** Falta configurar source maps

**Solución:**
1. Configurar sentry-cli
2. Subir source maps en cada build
3. Configurar release en Sentry.init()

### "Demasiados errores de desarrollo"

**Causa:** Sentry habilitado en desarrollo

**Solución:**
```typescript
enabled: !__DEV__, // Deshabilitar en desarrollo
```

### "Errores no capturados"

**Causa:** Error en event handler o código asíncrono

**Solución:**
```typescript
// Usar try-catch manual
try {
  await asyncOperation();
} catch (error) {
  Sentry.captureException(error);
}
```

---

## 📚 Recursos

- [Sentry React Native Docs](https://docs.sentry.io/platforms/react-native/)
- [Error Boundaries](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)
- [Source Maps Setup](https://docs.sentry.io/platforms/react-native/sourcemaps/)
- [Performance Monitoring](https://docs.sentry.io/platforms/react-native/performance/)

---

## 🎉 Próximos Pasos

Una vez Sentry esté funcionando:

1. **Configurar Alerts**
   - Email/Slack cuando hay errores críticos
   - Threshold alerts (ej: >10 errores/minuto)

2. **Configurar Releases**
   - Rastrear errores por versión de app
   - Comparar estabilidad entre releases

3. **Dashboard de Producción**
   - Monitor crash-free rate
   - Identificar errores más frecuentes
   - Priorizar fixes basado en impacto

4. **Integración con CI/CD**
   - Auto-crear releases en deploys
   - Subir source maps automáticamente
   - Notificaciones en Slack
