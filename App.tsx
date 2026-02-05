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
  // TODO: Log to crash reporting service (Sentry)
  // This error should be reported but shouldn't crash the app
  // Some services may still work even if initialization partially fails
});

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  const handleRootError = (error: Error, errorInfo: React.ErrorInfo) => {
    console.error('🚨 [Root Error Boundary] Critical error:', error);
    console.error('Component stack:', errorInfo.componentStack);
    // TODO: Log to Sentry when integrated
    // Sentry.captureException(error, { contexts: { react: errorInfo } });
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

export default App;
