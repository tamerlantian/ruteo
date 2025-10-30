import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from '@react-native-vector-icons/ionicons';
import { MainTabParamList } from '../../../navigation/types';
import { DashboardScreen } from '../screens/dashboard.screen';
import { RoutesScreen } from '../screens/routes.screen';
import { ProfileScreen } from '../screens/profile.screen';

const Tab = createBottomTabNavigator<MainTabParamList>();

const getTabBarIcon = (route: any, focused: boolean, color: string, size: number) => {
  let iconName: string;

  switch (route.name) {
    case 'Dashboard':
      iconName = focused ? 'home' : 'home-outline';
      break;
    case 'Routes':
      iconName = focused ? 'map' : 'map-outline';
      break;
    case 'Profile':
      iconName = focused ? 'person' : 'person-outline';
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
        name="Routes" 
        component={RoutesScreen}
        options={{
          tabBarLabel: 'Rutas',
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Perfil',
        }}
      />
    </Tab.Navigator>
  );
};
