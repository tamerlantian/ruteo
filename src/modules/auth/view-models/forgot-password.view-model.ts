import { useMutation } from '@tanstack/react-query';
import { authController } from '../controllers/auth.controller';
import { ForgotPasswordFormValues } from '../models/Auth';
import Toast from 'react-native-toast-message';
import { ApiErrorResponse } from '../../../core/interfaces/api.interface';
import { useAuthNavigation } from '../../../navigation/hooks';
import { toastTextOneStyle } from '../../../shared/styles/global.style';

// Hook para manejar la recuperación de contraseña
export const useForgotPassword = () => {
  const navigation = useAuthNavigation();

  const forgotPasswordMutation = useMutation({
    mutationFn: (data: ForgotPasswordFormValues) => authController.forgotPassword(data),
    onSuccess: () => {
      Toast.show({
        type: 'success',
        text1: 'Revisa tu correo para restablecer tu clave',
        text1Style: toastTextOneStyle
      });
      navigation.navigate('Login');
    },
    onError: (error: any) => {
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
