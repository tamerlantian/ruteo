import { useQuery } from '@tanstack/react-query';
import { authKeys } from '../constants/auth-keys';
import { authController } from '../controllers/auth.controller';
import { AuthState } from '../models/Auth';

// Hook simple para verificar el estado de autenticación
export const useAuthStatus = () => {
  return useQuery({
    queryKey: authKeys.session(),
    queryFn: authController.isAuthenticated,
    staleTime: Infinity, // No refetch automáticamente
    refetchOnWindowFocus: false,
    retry: false,
  });
};

// Hook para obtener el usuario actual
export const useCurrentUser = () => {
  const { data: isAuthenticated } = useAuthStatus();

  return useQuery({
    queryKey: authKeys.user(),
    queryFn: authController.getCurrentUser,
    staleTime: Infinity,
    enabled: isAuthenticated,
    refetchOnWindowFocus: false,
    retry: false,
  });
};

// Hook simplificado para manejar el estado global de autenticación
export const useAuthState = (): AuthState => {
  const { data: isAuthenticated = false, isLoading: isAuthLoading } = useAuthStatus();
  const { data: user = null, isLoading: isUserLoading } = useCurrentUser();

  return {
    isAuthenticated,
    user,
    loading: isAuthLoading || (isAuthenticated && isUserLoading),
    error: null, // Simplificado: no manejamos errores complejos
  };
};
