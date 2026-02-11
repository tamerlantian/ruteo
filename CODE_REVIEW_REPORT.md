# Ruteo Mobile - Comprehensive Code Review & Improvement Plan
## Senior React Native Developer Audit Report

**Project**: Ruteo Mobile (React Native 0.81.5 + TypeScript)
**Review Date**: February 5, 2026
**Overall Assessment**: ⚠️ **MODERATE RISK - Requires significant improvements before production**

---

## Executive Summary

The Ruteo mobile application demonstrates **solid architectural foundations** with modular design, proper separation of concerns, and good use of modern React Native patterns (React Query, Redux Toolkit). However, the codebase has **critical security vulnerabilities** and **stability concerns** that must be addressed before production deployment.

### Key Strengths ✓
- Clean modular architecture with well-defined module boundaries
- Proper use of Repository pattern with token refresh mechanism
- Good TypeScript adoption and type safety (mostly)
- Well-implemented background geolocation service
- Optimized FlatList rendering with proper configurations

### Critical Issues ❌
- **Zero test coverage** (~20,000 lines of code with 1 basic test)
- **Unencrypted sensitive data storage** (tokens, user data in plain AsyncStorage)
- **HTTP API in development mode** with iOS security exceptions
- **No error boundaries** - any component error crashes entire app
- **No production monitoring** (crash reporting, analytics, logging)
- **104 console.log statements** exposing sensitive data in production

### Readiness Score: **4/10**
**Estimated effort to production-ready**: 2-3 weeks with focused team

---

## Critical Findings (Fix Immediately)

### 🔴 P0: Security - Unencrypted Token Storage
**Severity**: CRITICAL | **Risk**: HIGH | **Effort**: Medium (3-5 days)

**Issue**: JWT tokens and sensitive user data stored in plain AsyncStorage without encryption.

**Files Affected**:
- `src/shared/services/storage.service.ts`
- `src/store/index.ts` (redux-persist configuration)

**Attack Vector**:
- Android ADB access can extract AsyncStorage
- Rooted/jailbroken devices expose all data
- Malware can read application data

**Impact**: Complete authentication bypass, user data theft, delivery data exposure

**Solution**:
```typescript
// Replace AsyncStorage with encrypted storage
import EncryptedStorage from 'react-native-encrypted-storage';

// For Redux persist
import createEncryptor from 'redux-persist-transform-encrypt';

const encryptor = createEncryptor({
  secretKey: 'your-secret-key-from-env',
  onError: (error) => {
    // Handle encryption errors
  },
});

const persistConfig = {
  key: 'root',
  storage: EncryptedStorage, // Use encrypted storage
  transforms: [encryptor],    // Encrypt all persisted data
};
```

**Action Items**:
1. Install `react-native-encrypted-storage`
2. Install `redux-persist-transform-encrypt`
3. Migrate StorageService to use EncryptedStorage
4. Update redux-persist config with encryption transform
5. Handle migration for existing users (decrypt old → encrypt new)

---

### 🔴 P0: No Error Boundaries
**Severity**: CRITICAL | **Risk**: HIGH | **Effort**: Small (1-2 days)

**Issue**: Zero error boundaries implemented. Any unhandled component error crashes the entire app with blank screen.

**Files to Create**:
- `src/shared/components/error-boundary/error-boundary.component.tsx`
- `src/shared/components/error-boundary/fallback-error.component.tsx`

**Solution**:
```typescript
// Implement at 3 levels:
// 1. Root level (App.tsx) - catch all app crashes
// 2. Navigation level - catch navigation errors
// 3. Form level - catch form submission errors

class ErrorBoundary extends React.Component<Props, State> {
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log to crash reporting service (Sentry)
    logErrorToService(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <FallbackComponent error={this.state.error} />;
    }
    return this.props.children;
  }
}
```

**Action Items**:
1. Create ErrorBoundary component with proper fallback UI
2. Wrap App.tsx root component
3. Wrap each navigator in navigation stack
4. Wrap EntregaForm and NovedadForm screens
5. Test error boundary with intentional errors

---

### 🔴 P0: HTTP API Communication
**Severity**: CRITICAL | **Risk**: HIGH | **Effort**: Small (depends on API team)

**Issue**: Development API uses unencrypted HTTP (`http://ruteoapi.online`), exposing data to MITM attacks.

**Files Affected**:
- `src/config/environment.ts:8`
- `ios/ruteo/Info.plist:42-51` (NSAllowsArbitraryLoads exception)

**Current Code**:
```typescript
// environment.ts
DEVELOPMENT: 'http://ruteoapi.online', // ❌ INSECURE
```

**iOS Exception** (allows HTTP traffic):
```xml
<key>NSAppTransportSecurity</key>
<dict>
  <key>NSAllowsArbitraryLoads</key>
  <true/> <!-- ❌ DANGEROUS -->
</dict>
```

**Action Items**:
1. Coordinate with backend team to enable HTTPS for development API
2. Once HTTPS enabled, update environment.ts
3. Remove NSAllowsArbitraryLoads from Info.plist
4. Implement SSL certificate pinning for production (see P1 below)

---

### 🔴 P0: No Crash Reporting or Monitoring
**Severity**: CRITICAL | **Risk**: HIGH | **Effort**: Small (1 day)

**Issue**: No production monitoring. Crashes, errors, and issues go unnoticed.

**Solution**: Integrate Sentry for React Native

**Action Items**:
```bash
# 1. Install dependencies
npm install @sentry/react-native
npx @sentry/wizard -i reactNative -p ios android

# 2. Configure in App.tsx (before app renders)
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: 'YOUR_SENTRY_DSN',
  environment: __DEV__ ? 'development' : 'production',
  enabled: !__DEV__, // Only in production
  tracesSampleRate: 0.2,
});

# 3. Wrap app with Sentry
export default Sentry.wrap(App);

# 4. Configure source maps for readable stack traces
```

**Benefits**:
- Real-time crash notifications
- Complete stack traces with source maps
- User breadcrumbs to reproduce issues
- Performance monitoring
- Release tracking

---

### 🔴 P0: Console.log in Production
**Severity**: CRITICAL | **Risk**: MEDIUM | **Effort**: Medium (2-3 days)

**Issue**: 104 console.log statements exposing sensitive data:
- Location coordinates (`background-geolocation.service.ts:383-387`)
- User IDs, schema names, despacho IDs
- Authentication tokens (potentially)
- Form submission data

**Files Affected**: 58 files with console logging

**Solution**:
```javascript
// 1. Install babel plugin
npm install --save-dev babel-plugin-transform-remove-console

// 2. Update babel.config.js
module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    // Remove all console.* in production
    ['transform-remove-console', { exclude: ['error', 'warn'] }],
  ],
  env: {
    production: {
      plugins: ['transform-remove-console'],
    },
  },
};

// 3. Implement proper logging service
// src/shared/services/logger.service.ts
import { logger as rnLogger } from 'react-native-logs';

const config = {
  levels: {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
  },
  severity: __DEV__ ? 'debug' : 'error',
  transport: __DEV__ ? consoleTransport : sentryTransport,
};

export const logger = rnLogger.createLogger(config);

// 4. Replace all console.log with logger.debug
```

**Action Items**:
1. Install babel-plugin-transform-remove-console
2. Create LoggerService with environment-aware levels
3. Replace console.log → logger.debug (automated with find/replace)
4. Replace console.error → logger.error
5. Configure Sentry transport for production logs
6. Test production build has no console output

---

## High Priority Issues (Fix Within 2 Weeks)

### 🟠 P1: Zero Test Coverage
**Severity**: HIGH | **Risk**: HIGH | **Effort**: Large (2 weeks ongoing)

**Issue**: Only 1 basic smoke test exists. ~20,000 lines of code untested.

**Critical Modules Without Tests**:
- ❌ `token.service.ts` - Token refresh flow
- ❌ `http-base.repository.ts` - HTTP interceptors, retry logic
- ❌ `background-geolocation.service.ts` - Location tracking
- ❌ `storage.service.ts` - Data persistence
- ❌ `visita-processing.service.ts` - Delivery processing logic
- ❌ All view models and repositories

**Action Items**:

**Phase 1: Critical Path Tests (Week 1)**
```typescript
// 1. Authentication flow tests
// __tests__/modules/auth/token.service.test.ts
describe('TokenService', () => {
  test('refreshes token on 401 response', async () => {});
  test('queues failed requests during refresh', async () => {});
  test('triggers logout on refresh failure', async () => {});
  test('prevents multiple simultaneous refresh calls', async () => {});
});

// 2. HTTP interceptor tests
// __tests__/core/http-base.repository.test.ts
describe('HttpBaseRepository', () => {
  test('retries request after successful token refresh', async () => {});
  test('handles network timeout correctly', async () => {});
  test('processes request queue in order', async () => {});
});

// 3. Background geolocation tests
// __tests__/shared/services/background-geolocation.test.ts
describe('BackgroundGeolocationService', () => {
  test('initializes only once per app launch', async () => {});
  test('starts tracking with correct config', async () => {});
  test('queues locations when offline', async () => {});
  test('cleans up listeners on full cleanup', async () => {});
});
```

**Phase 2: Integration Tests (Week 2)**
```typescript
// Test critical user flows end-to-end
describe('Login Flow Integration', () => {
  test('user can login with valid credentials', async () => {});
  test('user sees error on invalid credentials', async () => {});
  test('token is stored securely after login', async () => {});
  test('user is redirected to dashboard after login', async () => {});
});

describe('Delivery Submission Flow', () => {
  test('user can submit delivery with photos', async () => {});
  test('delivery is queued when offline', async () => {});
  test('delivery syncs when network returns', async () => {});
  test('user sees success message on submission', async () => {});
});
```

**Setup**:
```bash
# Install testing dependencies
npm install --save-dev @testing-library/react-native @testing-library/jest-native
npm install --save-dev @testing-library/react-hooks
npm install --save-dev jest-fetch-mock

# Update jest.config.js for coverage thresholds
module.exports = {
  preset: 'react-native',
  coverageThreshold: {
    global: {
      statements: 70,
      branches: 60,
      functions: 70,
      lines: 70,
    },
  },
};
```

**Target**: 70% code coverage for critical paths within 2 weeks

---

### 🟠 P1: No SSL Certificate Pinning
**Severity**: HIGH | **Risk**: MEDIUM | **Effort**: Medium (3-4 days)

**Issue**: Production API (`ruteoapi.co`) has no certificate pinning. Vulnerable to MITM attacks even with HTTPS.

**Solution**:
```bash
# Install SSL pinning library
npm install react-native-ssl-pinning
```

**Implementation**:
```typescript
// src/core/repositories/http-base.repository.ts
import { fetch } from 'react-native-ssl-pinning';

// Add to HttpBaseRepository
private async makeSecureRequest(config: AxiosRequestConfig) {
  if (!__DEV__) {
    // Pin certificate for production
    return fetch(config.url, {
      method: config.method,
      headers: config.headers,
      body: config.data,
      sslPinning: {
        certs: ['ruteoapi'], // Certificate in assets
      },
    });
  }
  return this.axiosInstance.request(config);
}
```

**Steps**:
1. Extract production API SSL certificate
2. Add certificate to `ios/Assets/` and `android/src/main/assets/`
3. Implement pinning in HttpBaseRepository
4. Test with valid and invalid certificates
5. Add certificate rotation strategy (pin multiple certs)

---

### 🟠 P1: Memory Leak - Scanner Modal AppState Listener
**Severity**: HIGH | **Risk**: MEDIUM | **Effort**: Small (1 hour)

**Issue**: AppState listener accumulates on each modal open/close.

**Location**: `src/shared/components/scanner/components/scanner-modal.component.tsx:35-49`

**Current Code**:
```typescript
useEffect(() => {
  if (!visible) return;

  const handleAppStateChange = (nextAppState: string) => {
    if (nextAppState === 'active') {
      setCameraKey(prev => prev + 1);
    }
  };

  const subscription = AppState.addEventListener('change', handleAppStateChange);

  return () => {
    subscription?.remove();
  };
}, [visible]); // ❌ Re-runs every time visible changes
```

**Fix**:
```typescript
useEffect(() => {
  if (!visible) return;

  const handleAppStateChange = (nextAppState: string) => {
    if (nextAppState === 'active' && visible) { // ✓ Check visible state
      setCameraKey(prev => prev + 1);
    }
  };

  const subscription = AppState.addEventListener('change', handleAppStateChange);

  return () => {
    subscription.remove(); // ✓ Always cleanup
  };
}, []); // ✓ Run only once

// Alternative: Use ref to track visible state
const visibleRef = useRef(visible);
useEffect(() => { visibleRef.current = visible; }, [visible]);
```

---

### 🟠 P1: Missing AbortControllers for Network Requests
**Severity**: MEDIUM | **Risk**: MEDIUM | **Effort**: Medium (2-3 days)

**Issue**: Network requests continue after component unmount, causing memory leaks and setState warnings.

**Files Affected**:
- `src/modules/visita/hooks/use-visita-processing.hook.ts`
- `src/modules/novedad/view-models/novedad.view-model.ts`
- All React Query mutations

**Solution**:
```typescript
// Example: Visita processing hook
export const useVisitaProcessing = () => {
  const abortControllerRef = useRef<AbortController | null>(null);

  const processMutation = useMutation({
    mutationFn: async (data: ProcessData) => {
      // Create abort controller for this request
      abortControllerRef.current = new AbortController();

      return visitaRepository.processVisita(data, {
        signal: abortControllerRef.current.signal,
      });
    },
    onError: (error) => {
      if (error.name === 'AbortError') {
        // Request was cancelled - don't show error
        return;
      }
      // Handle actual errors
    },
  });

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  return processMutation;
};

// Update repository to accept signal
// src/modules/visita/repositories/visita.repository.ts
public async processVisita(
  data: ProcessData,
  options?: { signal?: AbortSignal }
): Promise<Response> {
  return this.post('/visitas/process', data, {
    signal: options?.signal,
  });
}
```

**Action Items**:
1. Add AbortController to all async hooks
2. Update repositories to accept signal parameter
3. Update HttpBaseRepository to support AbortSignal
4. Test request cancellation on component unmount
5. Document pattern for future development

---

### 🟠 P1: Encrypted Redux Persistence
**Severity**: HIGH | **Risk**: MEDIUM | **Effort**: Medium (2 days)

**Issue**: Redux state (visita, novedad, settings) persisted unencrypted with sensitive data.

**Data at Risk**:
- Delivery addresses and customer names (visita slice)
- Issue reports with photos and descriptions (novedad slice)
- User preferences and configurations (settings slice)

**Current Config**: `src/store/index.ts`
```typescript
const persistConfig = {
  key: "root",
  version: 1,
  storage: AsyncStorage, // ❌ No encryption
  timeout: 0,
};
```

**Solution**:
```typescript
import createEncryptor from 'redux-persist-transform-encrypt';
import EncryptedStorage from 'react-native-encrypted-storage';
import { ENCRYPTION_KEY } from '@env'; // From react-native-config

const encryptor = createEncryptor({
  secretKey: ENCRYPTION_KEY,
  onError: (error) => {
    logger.error('Encryption error:', error);
  },
});

const persistConfig = {
  key: 'root',
  version: 2, // ✓ Increment version for migration
  storage: EncryptedStorage, // ✓ Use encrypted storage
  transforms: [encryptor],   // ✓ Encrypt all data
  migrate: createMigrate({
    // Migrate from v1 (unencrypted) to v2 (encrypted)
    2: (state) => {
      // State is auto-encrypted by redux-persist
      return state;
    },
  }),
};
```

**Action Items**:
1. Install `redux-persist-transform-encrypt` and `react-native-encrypted-storage`
2. Set up encryption key in environment variables
3. Update persist config with encryption
4. Test migration from unencrypted to encrypted state
5. Verify data survives app restart
6. Clear old AsyncStorage data after migration

---

### 🟠 P1: Environment Variable Management
**Severity**: HIGH | **Risk**: MEDIUM | **Effort**: Small (1-2 days)

**Issue**: API URLs and configuration hardcoded in source code. No .env file management.

**Current**: `src/config/environment.ts`
```typescript
const API_URLS = {
  PRODUCTION: 'https://ruteoapi.co',
  DEVELOPMENT: 'http://ruteoapi.online', // ❌ Hardcoded
};
```

**Solution**:
```bash
# 1. Install react-native-config
npm install react-native-config
npx pod-install # iOS

# 2. Create environment files
# .env.production
API_BASE_URL=https://ruteoapi.co
ENVIRONMENT=production
SENTRY_DSN=https://...
ENCRYPTION_KEY=your-secret-key-here

# .env.development
API_BASE_URL=https://ruteoapi.online  # Note: HTTPS
ENVIRONMENT=development
SENTRY_DSN=https://...
ENCRYPTION_KEY=your-dev-key-here

# 3. Add to .gitignore
.env
.env.production
.env.development
.env.local

# 4. Create .env.example (commit this)
API_BASE_URL=
ENVIRONMENT=
SENTRY_DSN=
ENCRYPTION_KEY=
```

**Update Code**:
```typescript
// src/config/environment.ts
import Config from 'react-native-config';

export const environment = {
  apiBase: Config.API_BASE_URL || '',
  environment: Config.ENVIRONMENT || 'development',
  timeout: 30000,
  sentryDsn: Config.SENTRY_DSN,
  encryptionKey: Config.ENCRYPTION_KEY,
};

// No more runtime environment switching
// ❌ Remove: updateApiBaseUrl() function
```

**Build Scripts**:
```json
// package.json
{
  "scripts": {
    "android:dev": "ENVFILE=.env.development react-native run-android",
    "android:prod": "ENVFILE=.env.production react-native run-android --variant=release",
    "ios:dev": "ENVFILE=.env.development react-native run-ios",
    "ios:prod": "ENVFILE=.env.production react-native run-ios --configuration Release"
  }
}
```

---

## Medium Priority Issues (Fix Within 1 Month)

### 🟡 P2: Architectural Inconsistencies

#### Issue 1: Inconsistent Directory Naming
**Files Affected**:
- `src/modules/auth/screens/` (plural) ✓
- `src/modules/visita/screen/` (singular) ❌
- `src/modules/novedad/screen/` (singular) ❌
- `src/modules/settings/screens/` (plural) ✓

**Fix**: Standardize to `screens/` (plural) everywhere
```bash
# Rename directories
mv src/modules/visita/screen src/modules/visita/screens
mv src/modules/novedad/screen src/modules/novedad/screens

# Update imports (automated)
find src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's|/screen/|/screens/|g'
```

#### Issue 2: View-Model Location Inconsistency
**Problem**:
- Auth module: `/view-models/` directory ✓
- Visita/Novedad: view-models inside screen folders ❌

**Decision Required**: Choose ONE pattern:

**Option A**: Dedicated view-models directory (Recommended)
```
src/modules/visita/
├── view-models/           # ✓ All view models here
│   ├── visita-list.vm.ts
│   ├── entrega-form.vm.ts
│   └── visita-detail.vm.ts
└── screens/
    └── visitas/
        └── visitas.screen.tsx  # ✓ Only UI logic
```

**Option B**: Collocated with screens
```
src/modules/visita/
└── screens/
    ├── visitas/
    │   ├── visitas.screen.tsx
    │   └── visitas.view-model.ts  # ✓ View model next to screen
    └── entrega-form/
        ├── entrega-form.screen.tsx
        └── entrega-form.view-model.ts
```

**Recommendation**: Option A - Dedicated directory (matches CLAUDE.md documentation)

**Action**:
1. Move all view-models to dedicated `/view-models/` directories
2. Update CLAUDE.md to explicitly document the chosen pattern
3. Update all imports

#### Issue 3: Settings Module Anti-Pattern
**Problem**: Settings uses Redux thunks instead of React Query (violates architecture)

**Current**: `src/modules/settings/store/thunk/settings.thunk.ts`
```typescript
export const loadSettingsThunk = createAsyncThunk(
  'settings/loadSettings',
  async (_, { rejectWithValue }) => {
    // ❌ Async operations in Redux thunks
  }
);
```

**Should Be**: React Query view models
```typescript
// src/modules/settings/view-models/settings.view-model.ts
export const useSettings = () => {
  return useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const settings = await storageService.getSettings();
      return settings;
    },
    staleTime: Infinity, // Settings rarely change
  });
};

export const useUpdateSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (settings: Settings) => {
      return settingsRepository.updateSettings(settings);
    },
    onSuccess: (newSettings) => {
      // Update cache
      queryClient.setQueryData(['settings'], newSettings);
      // Persist to AsyncStorage
      storageService.setSettings(newSettings);
    },
  });
};
```

**Refactor Plan**:
1. Create `src/modules/settings/view-models/` directory
2. Migrate thunk logic to React Query mutations
3. Update screens to use view-models instead of Redux
4. Keep Settings slice ONLY for persistence (remove thunks)
5. Remove `src/modules/settings/store/thunk/` directory

**Effort**: 1-2 days

#### Issue 4: Incomplete Modules
**Vertical Module**: Only has `interfaces/` and `repositories/`, no consumers
- **Action**: Either complete module (add view-models, screens) OR remove if unused

**Home Module**: Only has screens, no view-models/repositories
- **Action**: Extract Dashboard logic to view-models (currently 80+ lines in component)

---

### 🟡 P2: TypeScript Type Safety

#### Issue: Excessive `any` Usage
**Found**: 36 occurrences across 18 files

**Critical Files**:
```typescript
// src/core/repositories/http-base.repository.ts
private failedQueue: Array<{
  resolve: (value?: any) => void;     // ❌ any
  reject: (_reason?: any) => void;    // ❌ any
  config: AxiosRequestConfig;
}> = [];

// Should be:
private failedQueue: Array<{
  resolve: (value?: AxiosResponse) => void;
  reject: (reason?: Error) => void;
  config: AxiosRequestConfig;
}> = [];
```

```typescript
// src/modules/auth/view-models/login.view-model.ts
} catch (error: any) { // ❌ any

// Should be:
} catch (error) {
  const err = error as Error; // ✓ Type assertion
  // or
  if (error instanceof Error) { // ✓ Type guard
    // Handle error
  }
}
```

**Fix Strategy**:
1. Enable `strict: true` in `tsconfig.json`
2. Fix type errors incrementally (start with critical files)
3. Create proper error types:
```typescript
// src/shared/types/errors.ts
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public response?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class NetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NetworkError';
  }
}
```
4. Replace `any` with proper types
5. Set up pre-commit hook to prevent new `any` types

**Effort**: 1 week (incremental)

---

### 🟡 P2: Missing Path Aliases
**Issue**: Deep relative imports throughout codebase

**Examples**:
```typescript
// Bad (current)
import { something } from '../../../../navigation/types';
import { Component } from '../../../shared/components/ui/button';

// Good (with aliases)
import { something } from '@navigation/types';
import { Component } from '@shared/components/ui/button';
```

**Solution**: Update `tsconfig.json`
```json
{
  "extends": "@react-native/typescript-config",
  "compilerOptions": {
    "baseUrl": "./src",
    "paths": {
      "@modules/*": ["modules/*"],
      "@shared/*": ["shared/*"],
      "@navigation/*": ["navigation/*"],
      "@core/*": ["core/*"],
      "@config/*": ["config/*"],
      "@store/*": ["store/*"]
    }
  }
}
```

**Also update**: `babel.config.js`
```javascript
module.exports = {
  plugins: [
    [
      'module-resolver',
      {
        root: ['./src'],
        alias: {
          '@modules': './src/modules',
          '@shared': './src/shared',
          '@navigation': './src/navigation',
          '@core': './src/core',
          '@config': './src/config',
          '@store': './src/store',
        },
      },
    ],
  ],
};
```

**Migration**:
```bash
# Install babel plugin
npm install --save-dev babel-plugin-module-resolver

# Automated import rewrite (use with caution, test thoroughly)
npx jscodeshift -t transform-imports.js src/
```

**Effort**: 1 day (setup + migration + testing)

---

### 🟡 P2: Performance Optimizations

#### Issue 1: Missing React.memo on List Items
**Check**: `src/modules/visita/components/visita-card/visita-card.component.tsx`

**Verify and add if missing**:
```typescript
export const VisitaCardComponent = React.memo<VisitaCardProps>(
  ({ visita, onPress, isSelected }) => {
    // Component implementation
  },
  (prevProps, nextProps) => {
    // Custom comparison for optimization
    return (
      prevProps.visita.id === nextProps.visita.id &&
      prevProps.isSelected === nextProps.isSelected &&
      prevProps.visita.estado === nextProps.visita.estado
    );
  }
);
```

#### Issue 2: Selector Memoization
**Create memoized selectors**: `src/modules/visita/store/selector/visita.selector.ts`

```typescript
import { createSelector } from '@reduxjs/toolkit';

// Base selector (not memoized)
const selectVisitas = (state: RootState) => state.visita.visitas;
const selectSearchValue = (state: RootState) => state.visita.searchValue;
const selectActiveFilter = (state: RootState) => state.visita.activeFilter;

// Memoized derived selector (only recomputes when inputs change)
export const selectFilteredVisitas = createSelector(
  [selectVisitas, selectSearchValue, selectActiveFilter],
  (visitas, searchValue, activeFilter) => {
    // Expensive filtering logic only runs when dependencies change
    return visitas
      .filter(v => applyFilter(v, activeFilter))
      .filter(v => matchesSearch(v, searchValue));
  }
);
```

#### Issue 3: Image Rotation Performance
**File**: `src/shared/components/ui/photo-capture/hooks/usePhotoCaptureVision.ts:73`

**Issue**: Image rotation blocks UI thread

**Solution**: Move to native module or web worker
```typescript
// Option 1: Use react-native-image-manipulator (recommended)
import * as ImageManipulator from 'expo-image-manipulator';

const rotatedImage = await ImageManipulator.manipulateAsync(
  photoData.uri,
  [{ rotate: orientation }],
  { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
);

// Option 2: If custom rotation needed, move to native thread
import { Image } from 'react-native-image-crop-picker';

const rotatedImage = await Image.rotate(photoData.path, orientation);
```

**Effort**: Each optimization is 1-2 days

---

### 🟡 P2: Production Features

#### Missing: Analytics Implementation
**Install**: Firebase Analytics or Mixpanel

```bash
npm install @react-native-firebase/analytics
```

**Track Key Events**:
```typescript
// src/shared/services/analytics.service.ts
import analytics from '@react-native-firebase/analytics';

export const analyticsService = {
  logLogin: async (method: 'credentials' | 'biometric') => {
    await analytics().logLogin({ method });
  },

  logDeliveryCompleted: async (deliveryId: string, duration: number) => {
    await analytics().logEvent('delivery_completed', {
      delivery_id: deliveryId,
      duration_minutes: Math.round(duration / 60),
    });
  },

  logError: async (error: Error, context: string) => {
    await analytics().logEvent('error_occurred', {
      error_message: error.message,
      error_context: context,
    });
  },

  setUserId: async (userId: string) => {
    await analytics().setUserId(userId);
  },

  logScreenView: async (screenName: string) => {
    await analytics().logScreenView({ screen_name: screenName });
  },
};
```

**Integrate with Navigation**:
```typescript
// src/navigation/navigators/app.navigator.tsx
import { useNavigationContainerRef } from '@react-navigation/native';

export const AppNavigator = () => {
  const navigationRef = useNavigationContainerRef();
  const routeNameRef = useRef<string>();

  return (
    <NavigationContainer
      ref={navigationRef}
      onReady={() => {
        routeNameRef.current = navigationRef.getCurrentRoute()?.name;
      }}
      onStateChange={() => {
        const previousRouteName = routeNameRef.current;
        const currentRouteName = navigationRef.getCurrentRoute()?.name;

        if (previousRouteName !== currentRouteName) {
          analyticsService.logScreenView(currentRouteName || 'Unknown');
        }

        routeNameRef.current = currentRouteName;
      }}
    >
      {/* Navigators */}
    </NavigationContainer>
  );
};
```

**Effort**: 2-3 days

---

## Low Priority / Code Quality

### 🟢 P3: Code Organization

1. **Add Barrel Exports** (index.ts files)
   - Missing in: auth, visita, novedad, vertical modules
   - Cleaner imports: `from '@modules/auth'` instead of `from '@modules/auth/services/auth.service'`
   - **Effort**: 1 day

2. **Repository Singleton Consistency**
   - Settings module doesn't use singleton pattern
   - **Fix**: Convert to singleton like other repositories
   - **Effort**: 30 minutes

3. **Remove Example Code**
   - Found in: `src/modules/novedad/examples/`, `src/modules/settings/examples/`
   - **Action**: Delete or move to `/docs/examples/`
   - **Effort**: 15 minutes

4. **Enable TypeScript Strict Mode**
   - Add `"strict": true` to tsconfig.json
   - Fix resulting type errors incrementally
   - **Effort**: 1-2 weeks (background task)

---

## App Store Compliance

### iOS (App Store)
**Status**: ⚠️ Needs Changes

**Required Actions**:
1. ✅ Remove unused permission strings (Calendar, Contacts, Microphone, Music, Speech, Bluetooth)
   - **File**: `ios/ruteo/Info.plist:66-76`
   - Apple rejects apps with unused permission requests

2. ✅ Remove `NSAllowsArbitraryLoads` and HTTP exceptions
   - **File**: `ios/ruteo/Info.plist:42-51`
   - Required after migrating to HTTPS API

3. ✅ Update "Always" location permission justification
   - Current description is adequate but could be more specific
   - Mention "real-time delivery tracking for route optimization"

4. ✅ Verify privacy policy URL is accessible and current
   - **Current**: `http://app.ruteo.online/politicas_privacidad` (change to HTTPS)
   - Must include: location data usage, retention period, user rights

### Android (Google Play)
**Status**: ⚠️ Needs Changes

**Required Actions**:
1. ✅ Set `android:usesCleartextTraffic="false"` for production
   - **File**: `android/app/src/main/AndroidManifest.xml:28`

2. ✅ Add foreground service type for Android 14+
   ```xml
   <service
     android:name="com.transistorsoft.locationmanager.service.TrackingService"
     android:foregroundServiceType="location"
     android:enabled="true"
     android:exported="false">
   </service>
   ```

3. ✅ Verify privacy policy compliance
   - Same requirements as iOS
   - Update URL to HTTPS

4. ✅ Test on Android 14+ devices
   - New runtime permission requirements
   - Foreground service restrictions

---

## Privacy & GDPR Compliance

### Required Features (not currently implemented):

1. **User Data Deletion**
   ```typescript
   // Add to auth module
   export const useDeleteAccount = () => {
     return useMutation({
       mutationFn: () => authRepository.deleteAccount(),
       onSuccess: async () => {
         // Clear all local data
         await AsyncStorage.clear();
         await backgroundGeolocationService.fullCleanup();
         // Logout
       },
     });
   };
   ```

2. **Data Export**
   ```typescript
   // Add to settings module
   export const useExportUserData = () => {
     return useMutation({
       mutationFn: () => settingsRepository.exportUserData(),
       onSuccess: (data) => {
         // Download JSON file with user data
         shareFile(data);
       },
     });
   };
   ```

3. **Explicit Location Consent**
   - Show consent dialog before requesting location permission
   - Explain what data is collected and why
   - Provide link to privacy policy
   - Allow user to opt-out (disable tracking)

4. **Data Retention Policy**
   - Automatically delete old location data after 90 days
   - Clear cached delivery data after 30 days
   - Implement background cleanup job

**Effort**: 1 week

---

## Race Conditions & Concurrency

### Issue 1: Token Refresh TOCTOU Race
**File**: `src/core/services/token.service.ts:84-91`

**Problem**: Multiple simultaneous requests can all check `isRefreshing` before any sets it to true

**Fix**: Use mutex lock
```typescript
import { Mutex } from 'async-mutex';

class TokenService {
  private refreshMutex = new Mutex();

  public async refreshAccessToken(): Promise<string> {
    return this.refreshMutex.runExclusive(async () => {
      // Check if already refreshed while waiting for lock
      const currentToken = await this.getAccessToken();
      if (this.isTokenFresh(currentToken)) {
        return currentToken;
      }

      // Proceed with refresh...
    });
  }
}
```

### Issue 2: useRestoreTracking Race Condition
**File**: `src/shared/hooks/use-restore-tracking.hook.ts:27-86`

**Problem**: Multiple restoration attempts can be queued if dependencies change rapidly

**Fix**: Use debounce and ref
```typescript
const restorationAttemptedRef = useRef(false);
const timeoutRef = useRef<NodeJS.Timeout>();

useEffect(() => {
  if (restorationAttemptedRef.current) return;
  if (!isAuthenticated || !user?.id) return;

  // Clear any pending timeout
  if (timeoutRef.current) {
    clearTimeout(timeoutRef.current);
  }

  // Debounce restoration attempt
  timeoutRef.current = setTimeout(() => {
    if (!restorationAttemptedRef.current) {
      restorationAttemptedRef.current = true;
      restoreTracking();
    }
  }, 1000);

  return () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };
}, [isAuthenticated, user?.id, ordenEntrega]);
```

**Effort**: 1 day for both fixes

---

## Implementation Roadmap

### Week 1: Critical Security (5 days)
- [ ] Day 1-2: Implement encrypted storage (tokens + Redux)
- [ ] Day 3: Integrate Sentry crash reporting
- [ ] Day 4: Remove console.log, implement logger service
- [ ] Day 5: Add error boundaries

**Deliverable**: App with basic security hardening

### Week 2: Stability & Testing (5 days)
- [ ] Day 1-2: Set up testing infrastructure
- [ ] Day 2-3: Write critical path tests (auth, HTTP, geolocation)
- [ ] Day 4: Fix memory leaks (scanner modal, abort controllers)
- [ ] Day 5: SSL certificate pinning

**Deliverable**: App with test coverage and improved stability

### Week 3: Production Readiness (5 days)
- [ ] Day 1: Environment variable setup (react-native-config)
- [ ] Day 2: Migrate dev API to HTTPS, remove HTTP exceptions
- [ ] Day 3: Analytics integration (Firebase)
- [ ] Day 4: App Store compliance (permissions, privacy policy)
- [ ] Day 5: Final QA and production build testing

**Deliverable**: Production-ready application

### Week 4: Architecture Cleanup (5 days)
- [ ] Day 1: Standardize directory naming and module structure
- [ ] Day 2-3: Refactor settings module to React Query
- [ ] Day 3-4: Add path aliases, improve imports
- [ ] Day 4: Performance optimizations (React.memo, selectors)
- [ ] Day 5: Documentation updates (CLAUDE.md, README)

**Deliverable**: Clean, maintainable codebase

---

## Success Metrics

### Before Production Launch
- ✅ 0 critical security vulnerabilities
- ✅ Crash-free rate > 99.5% (via Sentry)
- ✅ 70%+ test coverage on critical paths
- ✅ All console.log removed from production builds
- ✅ App Store submission approved (iOS + Android)
- ✅ Location tracking reliability > 95%

### Post-Launch Monitoring
- Track: Daily active users, delivery completion rate
- Monitor: API error rates, app crashes, background tracking failures
- Alert: Crash rate > 1%, API errors > 5%
- Review: Weekly analytics and user feedback

---

## Conclusion

The Ruteo mobile application has a **solid architectural foundation** but requires **significant security and stability improvements** before production deployment. The modular architecture, proper use of modern React patterns, and well-implemented background geolocation service are strong positives.

**Critical blockers** (encrypted storage, error boundaries, crash reporting, console logging) can be resolved in 1-2 weeks. Additional testing, monitoring, and architectural cleanup will take another 2-3 weeks.

**Recommended Timeline**: 3-4 weeks to production-ready state with dedicated focus on security and stability.

---

## Files Requiring Immediate Attention

### Critical Files to Modify:
1. `src/shared/services/storage.service.ts` - Add encryption
2. `src/store/index.ts` - Add encrypted persistence
3. `src/config/environment.ts` - Add env variable support
4. `App.tsx` - Add error boundary, Sentry, proper service init error handling
5. `src/core/repositories/http-base.repository.ts` - Add AbortSignal support
6. `ios/ruteo/Info.plist` - Remove HTTP exception, cleanup permissions
7. `android/app/src/main/AndroidManifest.xml` - Set usesCleartextTraffic=false
8. `babel.config.js` - Add console removal plugin

### Files to Create:
1. `src/shared/components/error-boundary/error-boundary.component.tsx`
2. `src/shared/services/logger.service.ts`
3. `src/shared/services/analytics.service.ts`
4. `.env.production`, `.env.development`, `.env.example`
5. Test files for critical paths (15+ test files needed)

---

## Additional Resources Needed

1. **Dependencies to Install**:
   ```bash
   npm install react-native-encrypted-storage
   npm install redux-persist-transform-encrypt
   npm install @sentry/react-native
   npm install react-native-config
   npm install @react-native-firebase/analytics
   npm install react-native-ssl-pinning
   npm install async-mutex
   npm install react-native-logs
   npm install --save-dev babel-plugin-transform-remove-console
   npm install --save-dev @testing-library/react-native
   npm install --save-dev @testing-library/jest-native
   ```

2. **Backend Coordination Required**:
   - Enable HTTPS for development API
   - Provide SSL certificate for certificate pinning
   - Implement user data deletion endpoint
   - Implement data export endpoint
   - Review data retention policies

3. **Team Training**:
   - Security best practices (encrypted storage, no sensitive logging)
   - Testing strategies (unit, integration, E2E)
   - Error monitoring with Sentry
   - Analytics tracking and interpretation

---

**End of Report**

*This comprehensive audit provides a clear roadmap for improving the Ruteo mobile application to production-ready standards. Prioritize critical security issues first, followed by stability improvements and architectural cleanup.*
