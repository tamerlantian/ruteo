import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../../modules/auth/screens/auth-provider';
import { AuthNavigator } from './AuthNavigator';
import { MainNavigator } from './MainNavigator';
import { RootStackParamList } from '../types';

const RootStack = createNativeStackNavigator<RootStackParamList>();

/**
 * Navegador raíz de la aplicación
 * Maneja la navegación entre Auth y Main basado en el estado de autenticación
 */
export const RootNavigator: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();

  // Mostrar loading mientras se verifica el estado de autenticación
  if (loading) {
    // Aquí podrías mostrar un splash screen o loading
    return null;
  }

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
