import { useMutation, useQueryClient } from '@tanstack/react-query';
import { RegisterCredentials } from '../models/Auth';
import { authController } from '../controllers/auth.controller';
import { authKeys } from '../constants/auth-keys';
import { ApiErrorResponse } from '../../../core/interfaces/api.interface';
import Toast from 'react-native-toast-message';
import { toastTextOneStyle } from '../../../shared/styles/global.style';

// Hook para manejar el registro
export const useRegister = () => {
  const queryClient = useQueryClient();

  const registerMutation = useMutation({
    mutationFn: (userData: RegisterCredentials) => authController.register(userData),
    onSuccess: () => {
      // Actualizar el estado de autenticación y usuario
      queryClient.invalidateQueries({ queryKey: authKeys.session() });
      queryClient.invalidateQueries({ queryKey: authKeys.user() });
      // TODO: redirigir a la pantalla de login
      // router.replace('/(auth)/login');
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
    register: registerMutation.mutate,
    isLoading: registerMutation.isPending,
    isError: registerMutation.isError,
    error: registerMutation.error,
  };
};
