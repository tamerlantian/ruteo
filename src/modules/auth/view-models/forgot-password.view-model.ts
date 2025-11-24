import { useMutation } from '@tanstack/react-query';
import { authController } from '../controllers/auth.controller';
import { ForgotPasswordFormValues } from '../models/Auth';
import Toast from 'react-native-toast-message';
import { ApiErrorResponse } from '../../../core/interfaces/api.interface';
import { useAuthNavigation } from '../../../navigation/hooks';
import { toastTextOneStyle } from '../../../shared/styles/global.style';
import { networkService } from '../../../shared/services/network.service';

// Hook para manejar la recuperación de contraseña
export const useForgotPassword = () => {
  const navigation = useAuthNavigation();

  const forgotPasswordMutation = useMutation({
    mutationFn: async (data: ForgotPasswordFormValues) => {
      // Verificar conectividad antes de intentar recuperación de contraseña
      const isConnected = await networkService.isConnected();
      
      if (!isConnected) {
        throw new Error('NO_INTERNET_CONNECTION');
      }
      
      return authController.forgotPassword(data);
    },
    onSuccess: () => {
      Toast.show({
        type: 'success',
        text1: 'Revisa tu correo para restablecer tu clave',
        text1Style: toastTextOneStyle
      });
      navigation.navigate('Login');
    },
    onError: (error: any) => {
      // Manejar error específico de conectividad
      if (error.message === 'NO_INTERNET_CONNECTION') {
        Toast.show({
          type: 'error',
          text1: 'Sin conexión a internet',
          text2: 'Verifica tu conexión e intenta nuevamente',
          text1Style: toastTextOneStyle,
        });
        return;
      }
      
      // Manejar otros errores usando la lógica existente
      const errorData = error as ApiErrorResponse;
      Toast.show({
        type: 'error',
        text1: errorData?.mensaje || 'Error al solicitar recuperación de contraseña',
        text1Style: toastTextOneStyle
      });
    },
  });

  return {
    forgotPassword: forgotPasswordMutation.mutate,
    isLoading: forgotPasswordMutation.isPending,
    isError: forgotPasswordMutation.isError,
    error: forgotPasswordMutation.error,
  };
};
