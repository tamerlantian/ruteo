import { useMutation, useQueryClient } from '@tanstack/react-query';
import { RegisterCredentials } from '../models/Auth';
import { authController } from '../controllers/auth.controller';
import { authKeys } from '../constants/auth-keys';
import Toast from 'react-native-toast-message';
import { toastTextOneStyle } from '../../../shared/styles/global.style';
import { AuthErrorMapperService } from '../services/auth-error-mapper.service';
import { useAuthNavigation } from '../../../navigation/hooks/useTypedNavigation';
import { networkService } from '../../../shared/services/network.service';
import { reportMutationError } from '../../../shared/utils/sentry-helpers';

// Hook para manejar el registro
export const useRegister = () => {
  const queryClient = useQueryClient();
  const navigation = useAuthNavigation();

  const registerMutation = useMutation({
    mutationFn: async (userData: RegisterCredentials) => {
      // Verificar conectividad antes de intentar registro
      const isConnected = await networkService.isConnected();
      
      if (!isConnected) {
        throw new Error('NO_INTERNET_CONNECTION');
      }
      
      return authController.register(userData);
    },
    onSuccess: () => {
      // Actualizar el estado de autenticación y usuario
      queryClient.invalidateQueries({ queryKey: authKeys.session() });
      queryClient.invalidateQueries({ queryKey: authKeys.user() });
      
      // Mostrar mensaje de éxito
      Toast.show({
        type: 'success',
        text1: 'Registro exitoso',
        text1Style: toastTextOneStyle,
      });
      
      // Redirigir a la pantalla de login
      navigation.navigate('Login');
    },
    onError: (error: any, variables: RegisterCredentials) => {
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
      reportMutationError('register', error, {
        module: 'auth',
        operation: 'register',
        location: 'register-view-model',
        email: variables.username, // Safe to include email (no password!)
      });

      // Manejar otros errores usando el mapper existente
      const mappedError = AuthErrorMapperService.mapError(error, 'register');

      Toast.show({
        type: 'error',
        text1: mappedError.title,
        text2: mappedError.message,
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
