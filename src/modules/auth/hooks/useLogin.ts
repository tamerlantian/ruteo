import { useState } from 'react';
import { useAuth } from '../context/auth.context';
import { LoginCredentials } from '../models/Auth';
import { ApiErrorResponse } from '../../../core/interfaces/api.interface';
import Toast from 'react-native-toast-message';
import { toastTextOneStyle } from '../../../shared/styles/global.style';
import { networkService } from '../../../shared/services/network.service';

export const useLogin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { login: authLogin } = useAuth();

  const login = async (credentials: LoginCredentials) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Verificar conectividad antes de intentar login
      const isConnected = await networkService.isConnected();
      
      if (!isConnected) {
        throw new Error('NO_INTERNET_CONNECTION');
      }
      
      await authLogin(credentials);
      
      // El toast de éxito se maneja en el AuthContext
    } catch (err: any) {
      // Manejar error específico de conectividad
      if (err.message === 'NO_INTERNET_CONNECTION') {
        const errorMessage = 'Sin conexión a internet';
        setError(errorMessage);
        
        Toast.show({
          type: 'error',
          text1: errorMessage,
          text2: 'Verifica tu conexión e intenta nuevamente',
          text1Style: toastTextOneStyle,
        });
        
        throw err;
      }
      
      // Manejar otros errores usando la lógica existente
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
