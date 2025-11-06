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
import { AuthProvider } from './src/modules/auth/screens/auth-provider';
import { Provider } from 'react-redux';
import { store } from './src/store';
import { initializeServices } from './src/core/services/init-services';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutos
    },
  },
});

// Inicializar servicios una sola vez al cargar la aplicación
initializeServices();

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <Provider store={store}>
      <GestureHandlerRootView style={styles.gestureHandler}>
        <QueryClientProvider client={queryClient}>
          <ToastProvider>
            <BottomSheetModalProvider>
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
            </BottomSheetModalProvider>
          </ToastProvider>
        </QueryClientProvider>
      </GestureHandlerRootView>
    </Provider>
  );
}

function AppContent() {
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
