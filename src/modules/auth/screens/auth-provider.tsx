import React, { createContext, useContext, ReactNode } from 'react';
// import { useAuthState } from '../view-models/auth.view-model';
import { AuthState, LoginCredentials } from '../models/Auth';
import { useLogin } from '../view-models/login.view-model';
import { useLogout } from '../view-models/logout.view-model';
import { useAuthState } from '../view-models/auth.view-model';
// import { useLogout } from '../view-models/logout.view-model';

// Interfaz para el contexto de autenticación
interface AuthContextType extends AuthState {
  login: (_credentials: LoginCredentials) => void;
  logout: () => void;
}

// Crear el contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Props para el proveedor de autenticación
interface AuthProviderProps {
  children: ReactNode;
}

// Proveedor de autenticación
export const AuthProvider = ({ children }: AuthProviderProps) => {
  // Obtener el estado de autenticación
  const authState = useAuthState();
  // Hooks para login y logout
  const { login } = useLogin();
  const { logout } = useLogout();

  // Valor del contexto
  const contextValue: AuthContextType = {
    ...authState,
    login,
    logout,
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

// Hook personalizado para usar el contexto de autenticación
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};
