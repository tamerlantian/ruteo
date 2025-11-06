import axios from 'axios';
import { HttpBaseRepository } from '../../../core/repositories/http-base.repository';
import {
  LoginCredentials,
  LoginResponse,
  RefreshTokenResponse,
  RegisterCredentials,
  RegisterResponse,
} from '../models/Auth';
import { IAuthService } from '../../../core/interfaces/auth-service.interface';

/**
 * Repositorio para manejar las operaciones de API relacionadas con autenticación
 * Implementa el patrón Singleton para evitar múltiples instancias
 */
export class AuthRepository extends HttpBaseRepository implements IAuthService {
  private static instance: AuthRepository;

  /**
   * Constructor privado para evitar instanciación directa
   */
  private constructor() {
    super();
  }

  /**
   * Obtiene la instancia única del repositorio
   * @returns La instancia única de AuthRepository
   */
  public static getInstance(): AuthRepository {
    if (!AuthRepository.instance) {
      AuthRepository.instance = new AuthRepository();
    }
    return AuthRepository.instance;
  }

  /**
   * Realiza el login del usuario
   * @param credentials Credenciales de login (email y password)
   * @returns Promise con la respuesta del login
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    return this.post<LoginResponse>('seguridad/login/', credentials);
  }

  /**
   * Registra un nuevo usuario
   * @param userData Datos del usuario a registrar
   * @returns Promise con la respuesta del registro
   */
  async register(userData: RegisterCredentials): Promise<RegisterResponse> {
    return this.post<RegisterResponse>('seguridad/usuario/nuevo/', userData);
  }

  /**
   * Solicita el cambio de contraseña
   * @param email Correo electrónico del usuario
   * @returns Promise con la confirmación del cambio de contraseña
   */
  async forgotPassword(username: string): Promise<boolean> {
    return this.post<boolean>('seguridad/usuario/cambio-clave-solicitar/', { username });
  }

  /**
   * Cierra la sesión del usuario
   * @returns Promise con la confirmación del logout
   */
  async logout(): Promise<boolean> {
    return this.post<boolean>('seguridad/logout/', {});
  }

  async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
    try {
      // Crear una instancia de axios independiente para evitar ciclos
      const directAxios = axios.create({
        baseURL: 'http://reddocapi.online',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      // Hacer la petición directamente sin pasar por apiService
      const response = await directAxios.post<RefreshTokenResponse>(
        '/seguridad/token/refresh/',
        { refresh: refreshToken }
      );
      
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}