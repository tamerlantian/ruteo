import React, {useState} from 'react';
import {HomeScreen} from '../screens/main/HomeScreen';
import { LoginScreen } from '../modules/auth/screens/login.screen';

export type Screen = 'Login' | 'Home';

interface NavigationState {
  currentScreen: Screen;
  isAuthenticated: boolean;
}

interface AppNavigatorProps {
  initialScreen?: Screen;
}

export const AppNavigator: React.FC<AppNavigatorProps> = ({
  initialScreen = 'Login',
}) => {
  const [navigationState, setNavigationState] = useState<NavigationState>({
    currentScreen: initialScreen,
    isAuthenticated: false,
  });

  const navigate = (screen: Screen) => {
    setNavigationState(prev => ({
      ...prev,
      currentScreen: screen,
    }));
  };

  const login = () => {
    setNavigationState({
      currentScreen: 'Home',
      isAuthenticated: true,
    });
  };

  const logout = () => {
    setNavigationState({
      currentScreen: 'Login',
      isAuthenticated: false,
    });
  };

  const renderScreen = () => {
    switch (navigationState.currentScreen) {
      case 'Login':
        return <LoginScreen />;
      case 'Home':
        return <HomeScreen onLogout={logout} navigate={navigate} />;
      default:
        return <LoginScreen />;
    }
  };

  return <>{renderScreen()}</>;
};
