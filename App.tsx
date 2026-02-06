/**
 * Ruteo App - Aplicación con arquitectura modular
 * @format
 */

import React from 'react';
import { StatusBar, StyleSheet, useColorScheme, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from './src/navigation';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DevModeProvider } from './src/shared/context/dev-mode-context';
import { ToastProvider } from './src/shared/context';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { AuthProvider } from './src/modules/auth/context/auth.context';
import { Provider } from 'react-redux';
import { store } from './src/store';
import { initializeServices } from './src/core/services/init-services';
import Toast from 'react-native-toast-message';
import { KeyboardProvider } from "react-native-keyboard-controller";
import { useRestoreTracking } from './src/shared/hooks';
import { ErrorBoundary } from './src/shared/components/error-boundary';
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: 'https://9f2a19bc164341a90ae4e9a62354c106@o4510835022757888.ingest.us.sentry.io/4510835089014784',

  // Environment (development, staging, production)
  environment: __DEV__ ? 'development' : 'production',

  // Only enable in production (or enable in dev for testing)
  enabled: !__DEV__, // Cambia a true si quieres probar en desarrollo

  // Sample rate for performance monitoring (20% of transactions)
  tracesSampleRate: 0.2,

  // Attach stack traces to all messages
  attachStacktrace: true,

  // Normalize depth for better error context
  normalizeDepth: 10,

  // Enable automatic session tracking
  enableAutoSessionTracking: true,

  // Session tracking interval (30 seconds)
  sessionTrackingIntervalMillis: 30000,

  // Adds user context data (IP address, user agent, etc.)
  sendDefaultPii: true,

  // Enable native crash handling
  enableNativeCrashHandling: true,

  // Filter out sensitive data
  beforeSend(event) {
    // Don't send events with passwords or tokens in breadcrumbs
    if (event.breadcrumbs) {
      event.breadcrumbs = event.breadcrumbs.filter(breadcrumb => {
        const data = JSON.stringify(breadcrumb.data || {}).toLowerCase();
        return !data.includes('password') && !data.includes('token');
      });
    }
    return event;
  },

  // uncomment the line below to enable Spotlight in development
  // spotlight: __DEV__,
});


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutos
    },
  },
});

// Inicializar servicios una sola vez al cargar la aplicación
// IMPORTANTE: Incluye inicialización de BackgroundGeolocation
initializeServices().catch(error => {
  console.error('🚀 [App] Error inicializando servicios:', error);

  // Log to Sentry with context
  Sentry.captureException(error, {
    level: 'error',
    tags: {
      location: 'app_initialization',
      service: 'init_services',
    },
    contexts: {
      initialization: {
        phase: 'service_initialization',
        timestamp: new Date().toISOString(),
      },
    },
  });

  // This error should be reported but shouldn't crash the app
  // Some services may still work even if initialization partially fails
});

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  const handleRootError = (error: Error, errorInfo: React.ErrorInfo) => {
    console.error('🚨 [Root Error Boundary] Critical error:', error);
    console.error('Component stack:', errorInfo.componentStack);

    // Log to Sentry with full context
    Sentry.captureException(error, {
      level: 'fatal',
      tags: {
        error_boundary: 'root',
        location: 'app_root',
      },
      contexts: {
        react: {
          componentStack: errorInfo.componentStack,
        },
      },
    });
  };

  return (
    <ErrorBoundary level="root" onError={handleRootError}>
      <Provider store={store}>
        <GestureHandlerRootView style={styles.gestureHandler}>
          <QueryClientProvider client={queryClient}>
            <KeyboardProvider>
            <BottomSheetModalProvider>
              <ToastProvider>
                <DevModeProvider>
                  <AuthProvider>
                    <SafeAreaProvider>
                      <StatusBar
                        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
                      />
                      <AppContent />
                    </SafeAreaProvider>
                  </AuthProvider>
                </DevModeProvider>
              </ToastProvider>
            </BottomSheetModalProvider>
            </KeyboardProvider>
          </QueryClientProvider>
        </GestureHandlerRootView>
        <Toast visibilityTime={2000} />
      </Provider>
    </ErrorBoundary>
  );
}

function AppContent() {
  // Hook para restaurar tracking automáticamente después de REHYDRATE
  useRestoreTracking();

  return (
    <View style={styles.container}>
      <AppNavigator />
    </View>
  );
}

const styles = StyleSheet.create({
  gestureHandler: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
});

export default Sentry.wrap(App);