import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeTabsNavigator } from '../../modules/home/navigation/home-tabs.navigator';
import { EntregaFormScreen } from '../../modules/visita/screen/entrega-form/entrega-form.screen';
import { MainStackParamList } from '../types';

const MainStack = createNativeStackNavigator<MainStackParamList>();

/**
 * Navegador principal de la aplicación autenticada
 * Contiene HomeTabs y pantallas modales/overlay
 */
export const MainNavigator: React.FC = () => {
  return (
    <MainStack.Navigator
      initialRouteName="HomeTabs"
      screenOptions={{
        headerShown: false,
      }}
    >
      <MainStack.Screen 
        name="HomeTabs" 
        component={HomeTabsNavigator}
        options={{
          title: 'Inicio',
        }}
      />
      <MainStack.Screen 
        name="EntregaForm" 
        component={EntregaFormScreen}
        options={{
          presentation: 'modal',
          gestureEnabled: true,
          title: 'Entregar Visitas',
          animation: 'slide_from_bottom',
        }}
      />
    </MainStack.Navigator>
  );
};
