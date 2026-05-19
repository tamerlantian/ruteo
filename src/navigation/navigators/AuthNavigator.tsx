import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LoginScreen } from '../../modules/auth/screens/login.screen';
import { RegisterScreen } from '../../modules/auth/screens/register.screen';
import { ForgotPasswordScreen } from '../../modules/auth/screens/forgot-password.screen';
import { WelcomeScreen } from '../../modules/auth/screens/welcome.screen';
import { useWelcomeSeen } from '../../modules/auth/hooks/useWelcomeSeen';
import { SplashScreen } from '../../components/SplashScreen';
import { AuthStackParamList } from '../types';

const AuthStack = createNativeStackNavigator<AuthStackParamList>();

/**
 * Navegador del módulo de autenticación
 * Contiene todas las pantallas relacionadas con auth
 */
export const AuthNavigator: React.FC = () => {
  // En la primera apertura se arranca en Welcome; luego, directo a Login.
  const { loading, seen } = useWelcomeSeen();

  if (loading) {
    return <SplashScreen />;
  }

  return (
    <AuthStack.Navigator
      initialRouteName={seen ? 'Login' : 'Welcome'}
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <AuthStack.Screen
        name="Welcome"
        component={WelcomeScreen}
        options={{
          title: 'Bienvenida',
          animation: 'fade',
        }}
      />
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
