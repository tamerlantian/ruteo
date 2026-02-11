# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Ruteo is a React Native mobile application (iOS/Android) for route management and delivery tracking. The app uses background geolocation to track deliveries even when the app is terminated.

**Key Technologies:**
- React Native 0.81.5
- TypeScript
- Redux Toolkit + redux-persist
- React Query (TanStack Query)
- React Navigation
- react-native-background-geolocation
- Axios for HTTP communications

## Development Commands

### Setup
```bash
# Install dependencies
npm install

# iOS: Install Ruby dependencies (first time only)
bundle install

# iOS: Install CocoaPods dependencies (after installing or updating native deps)
cd ios && bundle exec pod install && cd ..
```

### Running the App
```bash
# Start Metro bundler
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios
```

### Code Quality
```bash
# Run linter
npm run lint

# Run tests
npm test
```

## Architecture Overview

### Module-Based Architecture

The app follows a **modular architecture** where each feature is a self-contained module with its own:
- Components
- View Models (React Query hooks)
- Repositories (API communication)
- Services (business logic)
- Redux slices (for persistent state)
- Interfaces/Types
- Constants

**Current modules:**
- `auth` - Authentication (login, register, forgot password)
- `visita` - Visits/delivery management
- `novedad` - News/updates management
- `settings` - App settings and configuration
- `vertical` - Vertical-specific functionality
- `home` - Dashboard/home screen

### Core Architecture Patterns

#### 1. Repository Pattern (HTTP Communication)
All HTTP communication extends `HttpBaseRepository` which provides:
- Automatic token refresh on 401 responses
- Request/response interceptors
- Dynamic base URL switching (dev/prod environments via `environment.apiBase`)
- Standardized error handling via `handleErrorResponse`

Example: `src/modules/auth/repositories/auth.repository.ts`

**Important:** Repositories use singleton pattern. Access via `getInstance()`:
```typescript
const authService = AuthRepository.getInstance();
```

#### 2. View Model Pattern
Business logic lives in view models, which are React Query hooks (`useMutation`, `useQuery`):
- Handle async operations
- Manage loading/error states
- Update cache via `queryClient`
- Show toast notifications for success/error

Example: `src/modules/auth/view-models/login.view-model.ts`

#### 3. Service Layer
Services handle complex business logic and cross-cutting concerns:
- `tokenService` - Token refresh and auth state management
- `backgroundGeolocationService` - Location tracking (singleton)
- `networkService` - Network connectivity checks
- `storageService` - AsyncStorage wrapper

**Critical:** Services are initialized once in `src/core/services/init-services.ts`, called from `App.tsx`.

#### 4. Redux for Persistent State Only
Redux Toolkit is used ONLY for state that needs persistence across app restarts via `redux-persist`:
- Visita state
- Settings preferences
- Novedad data

For ephemeral state or server data, use React Query instead.

### Navigation Structure

React Navigation with TypeScript:
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

**Type-safe navigation:** Use specialized hooks from `src/navigation/hooks/`:
- `useAuthNavigation()` - For Auth stack screens
- `useMainNavigation()` - For Main stack screens
- `useTabNavigation()` - For tab screens

Navigation types are centralized in `src/navigation/types.ts`.

## Critical Implementation Details

### Background Geolocation

**IMPORTANT:** Background geolocation follows a specific initialization pattern:

1. **One-time initialization:** `BackgroundGeolocation.ready()` is called ONCE per app launch in `initializeServices()` (App.tsx bootstrap)
2. **Start/Stop per order:** Use `startTracking(config)` and `stopTracking()` to control tracking for specific orders
3. **Cleanup vs Full Cleanup:**
   - `cleanup()` - Clears tracking data but preserves listeners (for switching orders)
   - `fullCleanup()` - Removes all listeners (only on logout)

**Never call `ready()` more than once per app launch - it will cause issues.**

Service location: `src/shared/services/background-geolocation.service.ts`

### Environment & API Configuration

Dynamic API base URL switching:
- `environment.apiBase` can be switched at runtime via `updateApiBaseUrl(isDeveloperMode)`
- Dev URL: `http://ruteoapi.online`
- Prod URL: `https://ruteoapi.co`
- HttpBaseRepository reads `environment.apiBase` dynamically on each request

### Token Refresh Flow

Automatic token refresh on 401:
1. Request fails with 401
2. HttpBaseRepository intercepts and queues failed requests
3. Calls `tokenService.refreshAccessToken()`
4. On success: retries all queued requests with new token
5. On failure: calls `tokenService.handleAuthFailure()` which triggers logout

**Important:** `tokenService` requires `authService` to be set via `setAuthService()` during initialization to avoid circular dependencies.

### Module Structure Example

```
src/modules/auth/
├── components/          # UI components specific to auth
├── constants/          # Auth-specific constants (query keys, etc.)
├── context/            # Auth context provider
├── controllers/        # Orchestration layer between view-models and repositories
├── hooks/              # Custom hooks (non-React Query)
├── interfaces/         # TypeScript interfaces
├── models/             # Data models/types
├── repositories/       # API communication (extends HttpBaseRepository)
├── screens/            # Screen components
├── services/           # Business logic services
├── view-models/        # React Query hooks for data operations
└── styles/             # Module-specific styles
```

### Shared Resources

`src/shared/` contains cross-module utilities:
- `components/` - Reusable UI components
- `services/` - Shared services (storage, network, geolocation)
- `utils/` - Helper functions
- `context/` - Global contexts (Toast, DevMode)
- `constants/` - App-wide constants
- `repositories/` - Shared repositories (location tracking)

## Development Guidelines

### Adding a New Module

1. Create module directory structure under `src/modules/[module-name]/`
2. Add repository extending `HttpBaseRepository`
3. Create view models using React Query hooks
4. Add Redux slice to `src/store/root-reducer.ts` only if persistence is needed
5. Create screens and wire up navigation in appropriate navigator
6. Add navigation types to `src/navigation/types.ts`

### Working with Forms

Uses `react-hook-form` for form validation and state management. View models handle form submission via mutations.

### Toast Notifications

Global toast via `react-native-toast-message`:
- Shown from view models on success/error
- Positioned above navigation (see App.tsx)
- Use `toastTextOneStyle` from `src/shared/styles/global.style.ts` for consistent styling

### Permissions & Location

- Location permissions: Handled by `react-native-background-geolocation` (asks for "Always" permission)
- Notification permissions (Android 13+): Requested in `backgroundGeolocationService.ready()`
- Camera/image permissions: Handled by `react-native-image-picker` and `react-native-vision-camera`

## iOS Specifics

- Bundle ID changed from "ruteo" to "lutencio" (see recent commits)
- CocoaPods dependencies managed via `bundle exec pod install`
- Always run `bundle exec pod install` after updating native dependencies

## Common Patterns

### Singleton Services
```typescript
export class MyService {
  private static instance: MyService;

  private constructor() {}

  public static getInstance(): MyService {
    if (!MyService.instance) {
      MyService.instance = new MyService();
    }
    return MyService.instance;
  }
}

export const myService = MyService.getInstance();
```

### React Query Keys
Centralize query keys as constants:
```typescript
// src/modules/auth/constants/auth-keys.ts
export const authKeys = {
  session: () => ['auth', 'session'] as const,
  user: () => ['auth', 'user'] as const,
};
```

### Error Handling
- Repositories throw errors caught from HTTP responses
- View models catch errors and map them to user-friendly messages
- Use `AuthErrorMapperService` pattern for domain-specific error mapping
- Network errors are checked proactively via `networkService.isConnected()`

### Common Tasks
- Siempre intenta implementar buenas practicas