import { useMutation, useQueryClient } from '@tanstack/react-query';
import { LoginCredentials } from '../models/Auth';
import { authController } from '../controllers/auth.controller';
import { authKeys } from '../constants/auth-keys';
import Toast from 'react-native-toast-message';
import { toastTextOneStyle } from '../../../shared/styles/global.style';
import { AuthErrorMapperService } from '../services/auth-error-mapper.service';
import { networkService } from '../../../shared/services/network.service';
import { reportMutationError } from '../../../shared/utils/sentry-helpers';

// Hook para manejar el login
export const useLogin = () => {
  const queryClient = useQueryClient();

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      // Verificar conectividad antes de intentar login
      const isConnected = await networkService.isConnected();
      
      if (!isConnected) {
        throw new Error('NO_INTERNET_CONNECTION');
      }
      
      return authController.login(credentials);
    },
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
    onError: (error: any, variables: LoginCredentials) => {
      // Manejar error específico de conectividad (NO reportar a Sentry)
      if (error.message === 'NO_INTERNET_CONNECTION') {
        Toast.show({
          type: 'error',
          text1: 'Sin conexión a internet',
          text2: 'Verifica tu conexión e intenta nuevamente',
          text1Style: toastTextOneStyle,
        });
        return;
      }

      // Report to Sentry BEFORE showing toast
      reportMutationError('login', error, {
        module: 'auth',
        operation: 'login',
        location: 'login-view-model',
        email: variables.username, // Safe to include email (no password!)
      });

      // Manejar otros errores usando el mapper existente
      const mappedError = AuthErrorMapperService.mapError(error, 'login');

      Toast.show({
        type: 'error',
        text1: mappedError.title,
        text2: mappedError.message,
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
