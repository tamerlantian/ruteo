import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '../../../shared/hooks/use-toast.hook';
// import { useRouter } from 'expo-router';
import { RegisterCredentials } from '../models/Auth';
import { authController } from '../controllers/auth.controller';
import { authKeys } from '../constants/auth-keys';
import { ApiErrorResponse } from '../../../core/interfaces/api.interface';

// Hook para manejar el registro
export const useRegister = () => {
  const queryClient = useQueryClient();
  const toast = useToast();
  // const router = useRouter();

  const registerMutation = useMutation({
    mutationFn: (userData: RegisterCredentials) => authController.register(userData),
    onSuccess: () => {
      // Actualizar el estado de autenticación y usuario
      queryClient.invalidateQueries({ queryKey: authKeys.session() });
      queryClient.invalidateQueries({ queryKey: authKeys.user() });
      // router.replace('/(auth)/login');
    },
    onError: (error: any) => {
      const errorData = error as ApiErrorResponse;
      toast.error(errorData?.mensaje || 'Error al iniciar sesión');
    },
  });

  return {
    register: registerMutation.mutate,
    isLoading: registerMutation.isPending,
    isError: registerMutation.isError,
    error: registerMutation.error,
  };
};
