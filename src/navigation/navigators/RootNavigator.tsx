import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../../modules/auth/context/auth.context';
import { AuthNavigator } from './AuthNavigator';
import { MainNavigator } from './MainNavigator';
import { RootStackParamList } from '../types';
import { SplashScreen } from '../../components/SplashScreen';
import { ErrorBoundary } from '../../shared/components/error-boundary';
import * as Sentry from '@sentry/react-native';

const RootStack = createNativeStackNavigator<RootStackParamList>();

import { createNavigationContainerRef } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef();

/**
 * Navegador raíz de la aplicación
 * Maneja la navegación entre Auth y Main basado en el estado de autenticación
 */
export const RootNavigator: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  // Mostrar splash screen mientras se verifica el estado de autenticación
  if (isLoading) {
    return <SplashScreen />;
  }

  console.log('🔍 RootNavigator: isAuthenticated:', isAuthenticated);

  const handleNavigationError = (error: Error, errorInfo: React.ErrorInfo) => {
    console.error('🚨 [Navigation Error Boundary] Navigation error:', error);
    console.error('Component stack:', errorInfo.componentStack);

    // Log to Sentry
    Sentry.captureException(error, {
      level: 'error',
      tags: {
        error_boundary: 'navigation',
        location: 'root_navigator',
      },
      contexts: {
        react: {
          componentStack: errorInfo.componentStack,
        },
        navigation: {
          authenticated: isAuthenticated,
        },
      },
    });
  };

  return (
    <ErrorBoundary level="navigation" onError={handleNavigationError}>
      <RootStack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'fade',
        }}
      >
        {isAuthenticated ? (
          <RootStack.Screen
            name="Main"
            component={MainNavigator}
            options={{
              title: 'Aplicación Principal',
            }}
          />
        ) : (
          <RootStack.Screen
            name="Auth"
            component={AuthNavigator}
            options={{
              title: 'Autenticación',
            }}
          />
        )}
      </RootStack.Navigator>
    </ErrorBoundary>
  );
};
