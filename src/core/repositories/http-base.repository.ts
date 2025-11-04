import { AUTH_TOKEN_KEY } from '../../shared/constants/localstorage-keys';
import storageService from '../../shared/services/storage.service';
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { environment } from '../../config/environment';
import { handleErrorResponse } from '../interceptors/error.interceptor';
import {
  ApiConfig,
  ApiErrorResponse,
  ApiQueryParametros,
  RequestOptions,
} from '../interfaces/api.interface';
import tokenService from '../services/token.service';

/**
 * Base repository for HTTP communications using Axios
 */
export class HttpBaseRepository {
  private axiosInstance: AxiosInstance;
  private configBaseUrl?: string; // URL base fija del config (si se proporciona)
  private isRefreshingToken = false;
  private failedQueue: {
    resolve: (_value: unknown) => void;
    reject: (_reason?: any) => void;
    config: AxiosRequestConfig;
  }[] = [];

  constructor(config?: ApiConfig) {
    // Guardar la URL base del config si se proporciona
    this.configBaseUrl = config?.baseUrl;

    this.axiosInstance = axios.create({
      // No establecer baseURL aquí, se establecerá dinámicamente
      timeout: config?.timeout || environment.timeout,
      headers: {
        'Content-Type': 'application/json',
        ...config?.headers,
      },
    });

    // Add request interceptor for handling tokens, etc.
    this.axiosInstance.interceptors.request.use(
      async config => {
        // Establecer la baseURL dinámicamente en cada request
        config.baseURL = this.getCurrentBaseUrl();
        // console.log('Current baseURL:', config.baseURL);
        const token = await storageService.getItem(AUTH_TOKEN_KEY);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      error => Promise.reject(error),
    );

    // Add response interceptor for handling errors
    // Interceptor para manejar errores de respuesta y renovar token si es necesario
    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error: AxiosError<ApiErrorResponse>) => {
        const originalRequest = error.config as AxiosRequestConfig & {
          _retry?: boolean;
        };

        // Si es un error 401 (Unauthorized) y no es un reintento
        if (error.response?.status === 401 && !originalRequest._retry) {
          // Si ya estamos renovando el token, ponemos la solicitud en cola
          if (this.isRefreshingToken) {
            return new Promise((resolve, reject) => {
              this.failedQueue.push({
                resolve,
                reject,
                config: originalRequest,
              });
            });
          }

          // Marcar que estamos renovando el token
          this.isRefreshingToken = true;
          originalRequest._retry = true;

          try {
            // Intentar renovar el token
            const newToken = await tokenService.refreshAccessToken();

            // Procesar la cola de solicitudes fallidas
            this.processQueue(null, newToken);

            // Actualizar el token en la solicitud original y reintentar
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
            }

            return this.axiosInstance(originalRequest);
          } catch (refreshError) {
            // Si falla la renovación del token, procesar la cola con el error
            this.processQueue(refreshError, null);

            // Redirigir al login (el tokenService ya se encarga de limpiar los tokens)
            await tokenService.handleAuthFailure();

            // Transformar el error para mantener consistencia
            const errorResponse = handleErrorResponse(error);
            return Promise.reject(errorResponse);
          } finally {
            this.isRefreshingToken = false;
          }
        }

        // Para otros errores, usar el manejador de errores existente
        const errorResponse = handleErrorResponse(error);
        return Promise.reject(errorResponse);
      },
    );
  }

  /**
   * Obtiene la URL base actual, priorizando el config fijo sobre el environment dinámico
   */
  private getCurrentBaseUrl(): string {
    return this.configBaseUrl || environment.apiBase;
  }

  /**
   * Procesa la cola de solicitudes fallidas después de renovar el token
   * @param error Error que ocurrió
   * @param token Token renovado
   */
  private processQueue(error: any, token: string | null) {
    this.failedQueue.forEach(({ resolve, reject, config }) => {
      if (error) {
        reject(error);
      } else if (token) {
        // Actualizar el token en la configuración de la solicitud
        if (config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        resolve(this.axiosInstance(config));
      }
    });

    // Limpiar la cola
    this.failedQueue = [];
  }

  /**
   * Determines if a URL is complete (starts with http:// or https://)
   * @param url URL or endpoint to check
   * @returns boolean indicating if it's a complete URL
   */
  private isFullUrl(url: string): boolean {
    return url.startsWith('http://') || url.startsWith('https://');
  }

  /**
   * Builds the complete URL if necessary
   * @param endpoint Endpoint or complete URL
   * @returns Complete URL for the request
   */
  private buildUrl(endpoint: string): string {
    if (this.isFullUrl(endpoint)) {
      return endpoint; // If it's already a complete URL, return it as is
    }
    // Normalize the path to avoid double slashes
    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
    const baseUrl = this.getCurrentBaseUrl();
    return `${baseUrl}/${normalizedEndpoint}`;
  }

  /**
   * GET method for retrieving data
   * @param endpoint API endpoint or complete URL
   * @param params Query parameters
   * @param options Additional request options
   * @returns Promise with the response data
   */
  public async get<T>(
    endpoint: string,
    params: ApiQueryParametros = {},
    options: RequestOptions = {},
  ): Promise<T> {
    const url = this.buildUrl(endpoint);
    const config: AxiosRequestConfig = {
      params,
      headers: options.headers,
      timeout: options.timeout,
    };

    const response = await this.axiosInstance.get<T>(url, config);
    return response.data;
  }

  /**
   * POST method for creating data
   * @param endpoint API endpoint or complete URL
   * @param data Request body data
   * @param options Additional request options
   * @returns Promise with the response data
   */
  public async post<T>(endpoint: string, data: any, options: RequestOptions = {}): Promise<T> {
    const url = this.buildUrl(endpoint);
    const config: AxiosRequestConfig = {
      headers: options.headers,
      params: options.params,
      timeout: options.timeout,
    };

    const response = await this.axiosInstance.post<T>(url, data, config);
    return response.data;
  }

  /**
   * PUT method for updating data
   * @param endpoint API endpoint or complete URL
   * @param data Request body data
   * @param options Additional request options
   * @returns Promise with the response data
   */
  public async put<T>(endpoint: string, data: any, options: RequestOptions = {}): Promise<T> {
    const url = this.buildUrl(endpoint);
    const config: AxiosRequestConfig = {
      headers: options.headers,
      params: options.params,
      timeout: options.timeout,
    };

    const response = await this.axiosInstance.put<T>(url, data, config);
    return response.data;
  }

  /**
   * PATCH method for partial updates
   * @param endpoint API endpoint or complete URL
   * @param data Request body data
   * @param options Additional request options
   * @returns Promise with the response data
   */
  public async patch<T>(endpoint: string, data: any, options: RequestOptions = {}): Promise<T> {
    const url = this.buildUrl(endpoint);
    const config: AxiosRequestConfig = {
      headers: options.headers,
      params: options.params,
      timeout: options.timeout,
    };

    const response = await this.axiosInstance.patch<T>(url, data, config);
    return response.data;
  }

  /**
   * DELETE method for removing data
   * @param endpoint API endpoint or complete URL
   * @param data Optional request body data
   * @param options Additional request options
   * @returns Promise with the response data
   */
  public async delete<T>(endpoint: string, data?: any, options: RequestOptions = {}): Promise<T> {
    const url = this.buildUrl(endpoint);
    const config: AxiosRequestConfig = {
      headers: options.headers,
      params: options.params,
      timeout: options.timeout,
      data, // For DELETE with request body
    };

    const response = await this.axiosInstance.delete<T>(url, config);
    return response.data;
  }

  /**
   * POST method for multipart/form-data uploads
   * @param endpoint API endpoint or complete URL
   * @param formData FormData object containing files and data
   * @param options Additional request options
   * @returns Promise with the response data
   */
  public async postMultipart<T>(endpoint: string, formData: FormData, options: RequestOptions = {}): Promise<T> {
    const url = this.buildUrl(endpoint);
    const config: AxiosRequestConfig = {
      headers: {
        'Content-Type': 'multipart/form-data',
        ...options.headers,
      },
      params: options.params,
      timeout: options.timeout || 30000, // Increased timeout for file uploads
    };

    const response = await this.axiosInstance.post<T>(url, formData, config);
    return response.data;
  }
}
