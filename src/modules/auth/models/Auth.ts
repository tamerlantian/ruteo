// Interfaces para el módulo de autenticación

// Interfaz para las credenciales de login
export interface LoginCredentials {
  username: string;
  password: string;
  proyecto: string;
}

export interface RegisterCredentials {
  username: string;
  password: string;
  confirmarPassword: string;
  aceptarTerminosCondiciones: boolean;
  aplicacion: string;
}

// Interfaz para el usuario autenticado
export interface AuthUser {
  id: number;
  username: string;
  imagen: string;
  nombre_corto: string;
  nombre: string | null;
  apellido: string | null;
  telefono: string | null;
  correo: string;
  idioma: string | null;
  dominio: string;
  fecha_limite_pago: string;
  fecha_creacion: string;
  vr_saldo: number;
  verificado: boolean;
  es_socio: boolean;
  socio_id: string;
  is_active: boolean;
  numero_identificacion: string;
  cargo: string;
}

// Interfaz para la respuesta de login
export interface LoginResponse {
  user: AuthUser;
  token: string;
  'refresh-token': string;
}

export interface RegisterResponse {
  usuario: AuthUser;
}

// Interfaz para el estado de autenticación
export interface AuthState {
  isAuthenticated: boolean;
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
}

// Interfaz para la respuesta de token refresh
export interface RefreshTokenResponse {
 access: string;
}

export type ForgotPasswordFormValues = {
  username: string;
  aplicacion: string;
};
