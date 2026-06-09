import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MainTabParamList } from '../../../navigation/types';
import { DashboardScreen } from '../screens/dashboard.screen';
import { VisitasScreen } from '../../visita/screen/visitas/visitas.screen';
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
    case 'Settings':
      iconName = focused ? 'settings' : 'settings-outline';
      break;
    default:
      iconName = 'home-outline';
  }

  return <Ionicons name={iconName as any} size={size} color={color} />;
};

export const HomeTabsNavigator = () => {
  const insets = useSafeAreaInsets();
  
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
          paddingBottom: Math.max(insets.bottom, 8),
          paddingTop: 8,
          height: 60 + Math.max(insets.bottom, 8),
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
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: 'Ajustes',
        }}
      />
    </Tab.Navigator>
  );
};
