import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LoginScreen } from '../modules/auth/screens/login.screen';
import { RegisterScreen } from '../modules/auth/screens/register.screen';
import { HomeTabsNavigator } from '../modules/home/navigation/home-tabs.navigator';
import { AuthStackParamList, MainStackParamList, RootStackParamList } from './types';
import { useAuth } from '../modules/auth/screens/auth-provider';

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const MainStack = createNativeStackNavigator<MainStackParamList>();
const RootStack = createNativeStackNavigator<RootStackParamList>();

const AuthNavigator = () => {
  return (
    <AuthStack.Navigator 
      initialRouteName="Login"
      screenOptions={{
        headerShown: false, // Ocultar header por defecto
      }}
    >
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
    </AuthStack.Navigator>
  );
};

const MainNavigator = () => {
  return (
    <MainStack.Navigator
      initialRouteName="HomeTabs"
      screenOptions={{
        headerShown: false, // Ocultar header por defecto
      }}
    >
      <MainStack.Screen name="HomeTabs" component={HomeTabsNavigator} />
    </MainStack.Navigator>
  );
};

const AppNavigatorContent: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <RootStack.Screen name="Main" component={MainNavigator} />
      ) : (
        <RootStack.Screen name="Auth" component={AuthNavigator} />
      )}
    </RootStack.Navigator>
  );
};

export const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <AppNavigatorContent />
    </NavigationContainer>
  );
};
