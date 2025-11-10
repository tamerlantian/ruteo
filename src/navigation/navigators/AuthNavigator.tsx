import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LoginScreen } from '../../modules/auth/screens/login.screen';
import { RegisterScreen } from '../../modules/auth/screens/register.screen';
import { ForgotPasswordScreen } from '../../modules/auth/screens/forgot-password.screen';
import { AuthStackParamList } from '../types';

const AuthStack = createNativeStackNavigator<AuthStackParamList>();

/**
 * Navegador del módulo de autenticación
 * Contiene todas las pantallas relacionadas con auth
 */
export const AuthNavigator: React.FC = () => {
  return (
    <AuthStack.Navigator 
      initialRouteName="Login"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <AuthStack.Screen 
        name="Login" 
        component={LoginScreen}
        options={{
          title: 'Iniciar Sesión',
        }}
      />
      <AuthStack.Screen 
        name="Register" 
        component={RegisterScreen}
        options={{
          title: 'Crear Cuenta',
        }}
      />
      <AuthStack.Screen 
        name="ForgotPassword" 
        component={ForgotPasswordScreen}
        options={{
          title: 'Recuperar Contraseña',
        }}
      />
    </AuthStack.Navigator>
  );
};
