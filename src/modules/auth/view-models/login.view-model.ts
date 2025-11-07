import { useMutation, useQueryClient } from '@tanstack/react-query';
import { LoginCredentials } from '../models/Auth';
import { authController } from '../controllers/auth.controller';
import { authKeys } from '../constants/auth-keys';
import { ApiErrorResponse } from '../../../core/interfaces/api.interface';
import Toast from 'react-native-toast-message';
import { toastTextOneStyle } from '../../../shared/styles/global.style';

// Hook para manejar el login
export const useLogin = () => {
  const queryClient = useQueryClient();

  const loginMutation = useMutation({
    mutationFn: (credentials: LoginCredentials) => authController.login(credentials),
    onSuccess: (response) => {
      // Actualizar el estado de autenticación inmediatamente
      queryClient.setQueryData(authKeys.session(), true);
      queryClient.setQueryData(authKeys.user(), response.user);
      
      // Invalidar queries para refrescar datos
      queryClient.invalidateQueries({ queryKey: authKeys.session() });
      queryClient.invalidateQueries({ queryKey: authKeys.user() });
      
      Toast.show({
        type: 'success',
        text1: 'Inicio de sesión exitoso',
        text1Style: toastTextOneStyle,
      });
    },
    onError: (error: any) => {
      const errorData = error as ApiErrorResponse;
      Toast.show({
        type: 'error',
        text1: errorData?.mensaje || 'Error al iniciar sesión',
        text1Style: toastTextOneStyle,
      });
    },
  });

  return {
    login: loginMutation.mutateAsync,
    isLoading: loginMutation.isPending,
    isError: loginMutation.isError,
    error: loginMutation.error,
  };
};
