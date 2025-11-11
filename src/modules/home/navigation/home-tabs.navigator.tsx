import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from '@react-native-vector-icons/ionicons';
import { MainTabParamList } from '../../../navigation/types';
import { DashboardScreen } from '../screens/dashboard.screen';
import { VisitasScreen } from '../../visita/screen/visitas/visitas.screen';
import { NovedadesScreen } from '../../novedad/screen/novedades/novedades.screen';
import { SettingsScreen } from '../../settings/screens/settings.screen';

const Tab = createBottomTabNavigator<MainTabParamList>();

const getTabBarIcon = (route: any, focused: boolean, color: string, size: number) => {
  let iconName: string;

  switch (route.name) {
    case 'Dashboard':
      iconName = focused ? 'home' : 'home-outline';
      break;
    case 'Visitas':
      iconName = focused ? 'cube' : 'cube-outline';
      break;
    case 'Novedades':
      iconName = focused ? 'alert-circle' : 'alert-circle-outline';
      break;
    case 'Settings':
      iconName = focused ? 'settings' : 'settings-outline';
      break;
    default:
      iconName = 'home-outline';
  }

  return <Ionicons name={iconName as any} size={size} color={color} />;
};

export const HomeTabsNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => getTabBarIcon(route, focused, color, size),
        tabBarActiveTintColor: '#007aff',
        tabBarInactiveTintColor: '#8e8e93',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#e5e5ea',
          paddingBottom: 8,
          paddingTop: 8,
          height: 88,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen}
        options={{
          tabBarLabel: 'Inicio',
        }}
      />
      <Tab.Screen 
        name="Visitas" 
        component={VisitasScreen}
        options={{
          tabBarLabel: 'Entregas',
        }}
      />
      <Tab.Screen 
        name="Novedades" 
        component={NovedadesScreen}
        options={{
          tabBarLabel: 'Novedades',
        }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{
          tabBarLabel: 'Ajustes',
        }}
      />
    </Tab.Navigator>
  );
};
