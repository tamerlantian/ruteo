import { useMutation, useQueryClient } from '@tanstack/react-query';
import { RegisterCredentials } from '../models/Auth';
import { authController } from '../controllers/auth.controller';
import { authKeys } from '../constants/auth-keys';
import Toast from 'react-native-toast-message';
import { toastTextOneStyle } from '../../../shared/styles/global.style';
import { AuthErrorMapperService } from '../services/auth-error-mapper.service';
import { useAuthNavigation } from '../../../navigation/hooks/useTypedNavigation';

// Hook para manejar el registro
export const useRegister = () => {
  const queryClient = useQueryClient();
  const navigation = useAuthNavigation();

  const registerMutation = useMutation({
    mutationFn: (userData: RegisterCredentials) => authController.register(userData),
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
    onError: (error: any) => {
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
