# Ruteo Mobile

Aplicación móvil para gestión de rutas y seguimiento de entregas en tiempo real. Desarrollada con React Native para iOS y Android.

## Descripción

Ruteo es una aplicación móvil que permite a los conductores gestionar sus entregas y realizar seguimiento en tiempo real usando geolocalización en segundo plano. La aplicación continúa rastreando la ubicación del usuario incluso cuando la app está cerrada o el dispositivo bloqueado.

## Stack Tecnológico

- **React Native** 0.81.5
- **TypeScript** - Tipado estático
- **Redux Toolkit** - State management (solo para estado persistente)
- **Redux Persist** - Persistencia de estado
- **React Query (TanStack Query)** - Data fetching y caché
- **React Navigation** - Navegación
- **React Native Background Geolocation** - Seguimiento de ubicación
- **Axios** - Cliente HTTP
- **React Hook Form** - Manejo de formularios
- **Sentry** - Monitoreo de errores y crashes

## Arquitectura

### Arquitectura Modular

El proyecto sigue una arquitectura modular donde cada feature es un módulo independiente con:

```
src/modules/[module-name]/
├── components/       # Componentes UI específicos del módulo
├── constants/        # Constantes (query keys, etc.)
├── context/          # Context providers
├── hooks/            # Custom hooks
├── interfaces/       # TypeScript interfaces
├── models/           # Data models/types
├── repositories/     # Comunicación con API
├── screens/          # Pantallas
├── services/         # Lógica de negocio
├── view-models/      # React Query hooks
└── styles/           # Estilos del módulo
```

**Módulos actuales:**
- `auth` - Autenticación (login, registro, recuperar contraseña)
- `visita` - Gestión de visitas/entregas
- `novedad` - Gestión de novedades
- `settings` - Configuración de la app
- `home` - Dashboard principal

### Patrones de Arquitectura

1. **Repository Pattern**: Toda la comunicación HTTP extiende `HttpBaseRepository`
   - Auto-refresh de tokens en respuestas 401
   - Interceptores de request/response
   - Cambio dinámico de base URL (dev/prod)
   - Manejo estandarizado de errores

2. **View Model Pattern**: Lógica de negocio en hooks de React Query
   - Manejo de operaciones async
   - Estados de loading/error
   - Actualización de caché
   - Notificaciones toast

3. **Service Layer**: Servicios para lógica compleja y cross-cutting concerns
   - `tokenService` - Refresh de tokens y auth state
   - `backgroundGeolocationService` - Seguimiento de ubicación (singleton)
   - `networkService` - Verificación de conectividad
   - `storageService` - Wrapper de AsyncStorage

4. **Redux solo para estado persistente**: Via `redux-persist`
   - Estado de visitas
   - Preferencias de configuración
   - Datos de novedades

### Navegación

```
AppNavigator (NavigationContainer)
└── RootNavigator
    ├── AuthNavigator (Stack)
    │   ├── Login
    │   ├── Register
    │   └── ForgotPassword
    └── MainNavigator (Stack)
        ├── HomeTabs (Bottom Tabs)
        │   ├── Dashboard
        │   ├── Visitas
        │   └── Profile
        └── EntregaForm (Modal)
```

## Setup

### Requisitos Previos

- Node.js >= 18
- npm o yarn
- Xcode (para iOS)
- Android Studio (para Android)
- CocoaPods (para iOS)

### Instalación

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd ruteo.mobile
```

2. **Instalar dependencias**
```bash
npm install
```

3. **iOS: Instalar dependencias de Ruby (primera vez)**
```bash
bundle install
```

4. **iOS: Instalar CocoaPods**
```bash
cd ios && bundle exec pod install && cd ..
```

> **Nota**: Ejecuta `bundle exec pod install` cada vez que actualices dependencias nativas.

## Desarrollo

### Ejecutar la Aplicación

```bash
# Iniciar Metro bundler
npm start

# Ejecutar en Android
npm run android

# Ejecutar en iOS
npm run ios
```

### Quality Checks

```bash
# Linter
npm run lint

# Tests
npm test

# Tests con coverage
npm test -- --coverage

# Tests específicos
npm test -- sentry-helpers.test.ts
```

### Comandos Útiles

```bash
# Limpiar caché de Metro
npm start -- --reset-cache

# Limpiar build de Android
cd android && ./gradlew clean && cd ..

# Limpiar build de iOS
cd ios && xcodebuild clean && cd ..
```

## Características Principales

### 1. Geolocalización en Segundo Plano
- Seguimiento continuo incluso con app cerrada
- Configuración automática de permisos
- Optimización de batería
- Almacenamiento local y sincronización

### 2. Error Boundaries
Protección contra crashes en múltiples niveles:
- **Root Level**: Previene pantallas en blanco
- **Navigation Level**: Aísla errores de navegación
- **Form Level**: Protege formularios de entrega y novedades
- **Component Level**: Errores de componentes individuales

### 3. Monitoreo con Sentry
- Captura automática de crashes y errores
- Performance monitoring (20% sample rate)
- Session tracking
- Filtrado de datos sensibles
- Contexto rico (usuario, navegación, formularios)

**Cobertura actual**: ~90% de errores capturados
- Error Boundaries
- Background Services
- API calls
- Token refresh
- Async operations

### 4. Manejo Robusto de Errores
- Network error detection
- Automatic token refresh
- User-friendly error messages
- Normalización de errores para Sentry

### 5. Optimización de Red
- Request queuing durante token refresh
- Retry logic para operaciones críticas
- Detección proactiva de conectividad
- Caché con React Query

## Testing

### Ejecutar Tests

```bash
# Todos los tests
npm test

# Watch mode
npm test -- --watch

# Coverage
npm test -- --coverage

# Test específico
npm test -- error-boundary.test.tsx
```

### Coverage Actual

- `sentry-helpers.ts`: 100% coverage (29 tests)
- `error-boundary.component.tsx`: Full coverage
- View models: Unit tests para mutaciones críticas

## Configuración de Ambiente

### Variables de Entorno

La app soporta cambio dinámico entre ambientes (dev/prod) via toggle en settings:

- **Dev**: `http://ruteoapi.online`
- **Prod**: `https://ruteoapi.co`

### Sentry Configuration

```typescript
// App.tsx
Sentry.init({
  dsn: 'your-sentry-dsn',
  enabled: !__DEV__, // Solo en producción
  environment: __DEV__ ? 'development' : 'production',
  tracesSampleRate: 0.2,
});
```

Para testing, cambiar `enabled: true` temporalmente.

## Detalles Críticos de Implementación

### Background Geolocation

**IMPORTANTE**: Patrón de inicialización específico:

1. `BackgroundGeolocation.ready()` se llama **UNA SOLA VEZ** por lanzamiento de app en `initializeServices()`
2. Usa `startTracking(config)` y `stopTracking()` para controlar tracking por pedido
3. **Cleanup**:
   - `cleanup()` - Limpia datos pero preserva listeners (para cambiar pedidos)
   - `fullCleanup()` - Remueve todos los listeners (solo en logout)

**Nunca llamar `ready()` más de una vez - causará problemas.**

### Token Refresh Flow

1. Request falla con 401
2. HttpBaseRepository intercepta y encola requests fallidos
3. Llama `tokenService.refreshAccessToken()`
4. En éxito: reintenta todos los requests encolados con nuevo token
5. En falla: llama `tokenService.handleAuthFailure()` que ejecuta logout

### Error Handling Pattern

```typescript
// 1. Verificar red primero
if (error.message === 'NO_INTERNET_CONNECTION') {
  Toast.show({ ... });
  return; // NO reportar a Sentry
}

// 2. Reportar a Sentry ANTES del toast
reportMutationError('operation', error, { module, location });

// 3. Mostrar toast al usuario
Toast.show({ type: 'error', ... });
```

## Troubleshooting

### iOS

**Error: CocoaPods not found**
```bash
bundle install
cd ios && bundle exec pod install && cd ..
```

**Build falla después de actualizar dependencias**
```bash
cd ios && bundle exec pod install && cd ..
npm run ios
```

### Android

**Error: INSTALL_FAILED_UPDATE_INCOMPATIBLE**
```bash
# Desinstalar app del emulador/dispositivo
adb uninstall com.ruteomobile

# Reinstalar
npm run android
```

**Gradle sync issues**
```bash
cd android && ./gradlew clean && cd ..
npm run android
```

### General

**Metro bundler cache issues**
```bash
npm start -- --reset-cache
```

**App no refleja cambios**
- Android: Presiona <kbd>R</kbd> dos veces
- iOS: <kbd>Cmd ⌘</kbd> + <kbd>R</kbd> en el simulador

## Estructura del Proyecto

```
ruteo.mobile/
├── src/
│   ├── core/               # Core services y configuración
│   │   ├── services/       # Services de inicialización
│   │   └── store/          # Redux store setup
│   ├── modules/            # Feature modules
│   │   ├── auth/
│   │   ├── visita/
│   │   ├── novedad/
│   │   ├── settings/
│   │   └── home/
│   ├── navigation/         # React Navigation setup
│   │   ├── navigators/
│   │   ├── hooks/
│   │   └── types.ts
│   ├── shared/             # Recursos compartidos
│   │   ├── components/     # UI components reutilizables
│   │   ├── services/       # Shared services
│   │   ├── utils/          # Helper functions
│   │   ├── hooks/          # Custom hooks
│   │   └── context/        # Global contexts
│   └── App.tsx            # App entry point
├── ios/                   # iOS native code
├── android/               # Android native code
└── __tests__/            # Tests
```

## Próximos Pasos para Producción

### Sentry
- [x] Integración básica
- [x] Error Boundaries
- [x] Service error tracking
- [ ] `Sentry.setUser()` en login/logout
- [ ] Source maps (iOS/Android)
- [ ] Alerts en dashboard
- [ ] Release tracking

### Features
- [ ] Offline mode completo
- [ ] Push notifications
- [ ] Optimización de batería
- [ ] Mejoras de performance

## Contribución

1. Crea un branch desde `develop`
2. Haz tus cambios
3. Ejecuta tests y linter
4. Crea PR hacia `develop`

### Convenciones de Commits

```
feat: nueva característica
fix: corrección de bug
chore: tareas de mantenimiento
docs: documentación
test: agregar o modificar tests
refactor: refactorización de código
```

## Recursos

- [React Native Docs](https://reactnative.dev/docs/getting-started)
- [React Query Docs](https://tanstack.com/query/latest)
- [Redux Toolkit Docs](https://redux-toolkit.js.org/)
- [React Navigation Docs](https://reactnavigation.org/)
- [Background Geolocation Docs](https://transistorsoft.github.io/react-native-background-geolocation)
- [Sentry React Native Docs](https://docs.sentry.io/platforms/react-native/)

## Licencia

Propiedad de Semántica SAS

## Contacto

Para más información, consulta `CLAUDE.md` o contacta al equipo de desarrollo.
