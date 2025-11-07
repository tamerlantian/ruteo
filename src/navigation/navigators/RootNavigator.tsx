import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../../modules/auth/context/auth.context';
import { AuthNavigator } from './AuthNavigator';
import { MainNavigator } from './MainNavigator';
import { RootStackParamList } from '../types';
import { SplashScreen } from '../../components/SplashScreen';

const RootStack = createNativeStackNavigator<RootStackParamList>();

import { createNavigationContainerRef } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef();

export function navigate(name: string, params?: object) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name as never, params as never);
  }
}

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

  return (
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
  );
};
