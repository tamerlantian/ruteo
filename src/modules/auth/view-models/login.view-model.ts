import { useToast } from '../../../shared/hooks/use-toast.hook';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { LoginCredentials } from '../models/Auth';
import { authController } from '../controllers/auth.controller';
import { authKeys } from '../constants/auth-keys';
import { ApiErrorResponse } from '../../../core/interfaces/api.interface';
// import { useNavigation } from '@react-navigation/native';

// Hook para manejar el login
export const useLogin = () => {
  const queryClient = useQueryClient();
  const toast = useToast();
  // const navigation = useNavigation();

  const loginMutation = useMutation({
    mutationFn: (credentials: LoginCredentials) => authController.login(credentials),
    onSuccess: (response) => {
      // Actualizar el estado de autenticación inmediatamente
      queryClient.setQueryData(authKeys.session(), true);
      queryClient.setQueryData(authKeys.user(), response.user);
      
      // Invalidar queries para refrescar datos
      queryClient.invalidateQueries({ queryKey: authKeys.session() });
      queryClient.invalidateQueries({ queryKey: authKeys.user() });
      
      toast.success('Inicio de sesión exitoso');
    },
    onError: (error: any) => {
      const errorData = error as ApiErrorResponse;
      toast.error(errorData?.mensaje || 'Error al iniciar sesión');
    },
  });

  return {
    login: loginMutation.mutate,
    isLoading: loginMutation.isPending,
    isError: loginMutation.isError,
    error: loginMutation.error,
  };
};
