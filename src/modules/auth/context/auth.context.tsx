import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { authController } from '../controllers/auth.controller';
import { LoginCredentials, AuthUser } from '../models/Auth';
import { useAuthActions } from '../hooks/useAuthActions';
import Toast from 'react-native-toast-message';
import { toastTextOneStyle } from '../../../shared/styles/global.style';
import { authEvents } from '../../../core/services/auth-events.service';

interface AuthContextType {
  // Estado
  isAuthenticated: boolean;
  user: AuthUser | null;
  isLoading: boolean;
  
  // Acciones
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  logoutTokenExpired: () => Promise<void>;
  checkAuthStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  console.log('🔍 AuthProvider: Inicializando...');
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  console.log('🔍 AuthProvider: Estado inicial - isAuthenticated:', isAuthenticated, 'isLoading:', isLoading);
  
  const { clearAppData } = useAuthActions();


  // Verificar estado de autenticación al inicializar
  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      const authenticated = await authController.isAuthenticated();
      
      if (authenticated) {
        const userData = await authController.getCurrentUser();
        setIsAuthenticated(true); 
        setUser(userData);
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Login
  const login = async (credentials: LoginCredentials) => {
    try {
      setIsLoading(true);
      const response = await authController.login(credentials);
      
      setIsAuthenticated(true);
      setUser(response.user);
      
      Toast.show({
        type: 'success',
        text1: 'Inicio de sesión exitoso',
        text1Style: toastTextOneStyle,
      });
    } catch (error) {
      setIsAuthenticated(false);
      setUser(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout completo - Usuario manual (limpia toda la data)
  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // 1. Logout del servidor y limpiar tokens
      await authController.logout();
      
      // 2. Limpiar datos de la aplicación (Redux, etc.)
      await clearAppData();
      
      // 3. Actualizar estado local
      setIsAuthenticated(false);
      setUser(null);
      
      console.log('🔵 AuthContext: Logout completo ejecutado - Data limpiada');
    } catch (error) {
      console.error('Error during logout:', error);
      // Forzar logout local incluso si falla el servidor
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [clearAppData]);

  // Logout por token expirado - Solo limpia autenticación (preserva data)
  const logoutTokenExpired = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // 1. Solo limpiar tokens del servidor (sin limpiar data local)
      await authController.logout();
      
      // 2. Actualizar estado local (SIN limpiar datos de la app)
      setIsAuthenticated(false);
      setUser(null);
      
      console.log('🟡 AuthContext: Logout por token expirado - Data preservada');
    } catch (error) {
      console.error('Error during token expired logout:', error);
      // Forzar logout local incluso si falla el servidor
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      Toast.show({
        type: 'error',
        text1: 'Sesión cerrada por expiración de token',
        text1Style: toastTextOneStyle,
      });
      setIsLoading(false);
    }
  }, []);

  // Verificar estado al montar el componente
  useEffect(() => {
    console.log('🔍 AuthProvider: useEffect ejecutándose...');
    checkAuthStatus();
  }, []);

  // Escuchar eventos de expiración de token
  useEffect(() => {
    const handleTokenExpired = () => {
      console.log('🔴 AuthContext: Token expirado - ejecutando logoutTokenExpired');
      logoutTokenExpired();
    };

    authEvents.on('TOKEN_EXPIRED', handleTokenExpired);
    
    return () => {
      authEvents.off('TOKEN_EXPIRED', handleTokenExpired);
    };
  }, [logoutTokenExpired]);

  const value: AuthContextType = {
    isAuthenticated,
    user,
    isLoading,
    login,
    logout,
    logoutTokenExpired,
    checkAuthStatus,
  };

  console.log('🔍 AuthProvider: Renderizando con valor:', value);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
