import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ForgotPasswordFormValues,
  LoginCredentials,
  LoginResponse,
  RefreshTokenResponse,
  RegisterCredentials,
  RegisterResponse,
} from '../models/Auth';
import {
  AUTH_TOKEN_KEY,
  REFRESH_TOKEN_KEY,
  USER_DATA_KEY,
} from '../../../shared/constants/localstorage-keys';
import { AuthRepository } from '../repositories/auth.repository';

// Instancia del repositorio de autenticación

// Controlador para manejar las operaciones relacionadas con autenticación
export const authController = {
  // Realizar login de usuario
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    try {
      const response = await AuthRepository.getInstance().login(credentials);

      // Guardar tokens y datos del usuario en el almacenamiento local
      await AsyncStorage.setItem(AUTH_TOKEN_KEY, response.token);
      await AsyncStorage.setItem(REFRESH_TOKEN_KEY, response['refresh-token']);
      await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(response.user));

      return response;
    } catch (error) {
      throw error;
    }
  },

  // Registrar nuevo usuario
  register: async (userData: RegisterCredentials): Promise<RegisterResponse> => {
    try {
      const response = await AuthRepository.getInstance().register(userData);
      return response;
    } catch (error) {
      console.error('Error en registro:', error);
      throw error;
    }
  },

  // Refrescar token
  refreshToken: async (): Promise<RefreshTokenResponse | null> => {
    try {
      const refreshToken = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);

      if (!refreshToken) {
        return null;
      }

      const response = await AuthRepository.getInstance().refreshToken(refreshToken);

      // Actualizar token en almacenamiento local
      await AsyncStorage.setItem(AUTH_TOKEN_KEY, response.token);
      if (response.refreshToken) {
        await AsyncStorage.setItem(REFRESH_TOKEN_KEY, response.refreshToken);
      }

      return response;
    } catch (error) {
      console.error('Error al refrescar token:', error);
      throw error;
    }
  },

  // Cerrar sesión
  logout: async (): Promise<boolean> => {
    try {
      // await authRepository.logout();

      // Limpiar datos de autenticación del almacenamiento local
      await AsyncStorage.multiRemove([AUTH_TOKEN_KEY, REFRESH_TOKEN_KEY, USER_DATA_KEY]);

      return true;
    } catch (error) {
      console.error('Error en logout:', error);
      // Aún si falla la petición al servidor, limpiamos el almacenamiento local
      await AsyncStorage.multiRemove([AUTH_TOKEN_KEY, REFRESH_TOKEN_KEY, USER_DATA_KEY]);
      return true;
    }
  },

  // Verificar si hay un usuario autenticado
  isAuthenticated: async (): Promise<boolean> => {
    try {
      const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
      return !!token; // Simple: si hay token, está autenticado
    } catch {
      return false;
    }
  },

  // Obtener el token actual
  getToken: async (): Promise<string | null> => {
    return AsyncStorage.getItem(AUTH_TOKEN_KEY);
  },

  // Obtener datos del usuario actual
  getCurrentUser: async () => {
    try {
      const userData = await AsyncStorage.getItem(USER_DATA_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error al obtener datos del usuario:', error);
      return null;
    }
  },

  // Solicitar recuperación de contraseña
  forgotPassword: async (data: ForgotPasswordFormValues): Promise<boolean> => {
    try {
      return await AuthRepository.getInstance().forgotPassword(data.username);
    } catch (error) {
      console.error('Error al solicitar recuperación de contraseña:', error);
      throw error;
    }
  },
};
