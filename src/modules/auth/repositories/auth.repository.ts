import axios from 'axios';
import { HttpBaseRepository } from '../../../core/repositories/http-base.repository';
import {
  AuthUser,
  LoginCredentials,
  LoginResponse,
  RefreshTokenResponse,
  RegisterCredentials,
  RegisterResponse,
} from '../models/Auth';
import { IAuthService } from '../../../core/interfaces/auth-service.interface';
import { environment } from '../../../config/environment';

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
    return this.post<LoginResponse>('api/v2/auth/login/', credentials);
  }

  /**
   * Obtiene el usuario autenticado (estado de aprobación, acceso, etc.)
   * @returns Promise con el usuario actual
   */
  async me(): Promise<AuthUser> {
    return this.get<AuthUser>('api/v2/auth/me/');
  }

  /**
   * Registra un nuevo usuario
   * @param userData Datos del usuario a registrar
   * @returns Promise con la respuesta del registro
   */
  async register(userData: RegisterCredentials): Promise<RegisterResponse> {
    return this.post<RegisterResponse>('api/v2/auth/registro/', userData);
  }

  /**
   * Solicita el cambio de contraseña
   * @param email Correo electrónico del usuario
   * @returns Promise con la confirmación del cambio de contraseña
   */
  async forgotPassword(username: string): Promise<{ mensaje: string }> {
    return this.post<{ mensaje: string }>('api/v2/auth/clave/solicitar/', { username });
  }

  /**
   * Cierra la sesión del usuario
   * @returns Promise con la confirmación del logout
   */
  async logout(): Promise<{ mensaje: string }> {
    return this.post<{ mensaje: string }>('api/v2/auth/logout/', {});
  }

  async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
    try {
      // Crear una instancia de axios independiente para evitar ciclos
      const directAxios = axios.create({
        baseURL: environment.apiBase, // Usar la URL dinámica del environment
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      // Hacer la petición directamente sin pasar por apiService
      const response = await directAxios.post<RefreshTokenResponse>(
        '/api/v2/auth/token/refresh/',
        { refresh: refreshToken }
      );
      
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}