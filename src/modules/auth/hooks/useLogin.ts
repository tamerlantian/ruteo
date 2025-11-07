import { useState } from 'react';
import { useAuth } from '../context/auth.context';
import { LoginCredentials } from '../models/Auth';
import { ApiErrorResponse } from '../../../core/interfaces/api.interface';
import Toast from 'react-native-toast-message';
import { toastTextOneStyle } from '../../../shared/styles/global.style';

export const useLogin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { login: authLogin } = useAuth();

  const login = async (credentials: LoginCredentials) => {
    try {
      setIsLoading(true);
      setError(null);
      
      await authLogin(credentials);
      
      // El toast de éxito se maneja en el AuthContext
    } catch (err) {
      const errorData = err as ApiErrorResponse;
      const errorMessage = errorData?.mensaje || 'Error al iniciar sesión';
      
      setError(errorMessage);
      
      Toast.show({
        type: 'error',
        text1: errorMessage,
        text1Style: toastTextOneStyle,
      });
      
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    login,
    isLoading,
    error,
  };
};
