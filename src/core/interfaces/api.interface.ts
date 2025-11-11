export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface ApiConfig {
  baseUrl: string;
  headers?: Record<string, string>;
  timeout?: number;
}

export interface RequestOptions {
  method?: HttpMethod;
  headers?: Record<string, string>;
  params?: Record<string, any>;
  data?: any;
  timeout?: number;
}

export interface ApiErrorResponse {
  titulo: string;
  mensaje: string;
  codigo: number;
  validaciones?: any;
  error?: string;
  status?: number;
}

export interface ApiResponse<T> {
  count: number;
  next: any;
  previous: any;
  results: T[];
}

export interface ApiQueryParametros {
  [key: string]: string | number | boolean;
}

export interface SeleccionarResponse {
  id: number;
  nombre: string;
}
