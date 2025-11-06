import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { RootNavigator } from './navigators';
import { navigationRef } from './navigators/RootNavigator';

/**
 * Navegador principal de la aplicación
 * Punto de entrada para toda la navegación
 */
export const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer ref={navigationRef}>
      <RootNavigator />
    </NavigationContainer>
  );
};
