// Interfaces del módulo de autenticación — API v2 (/api/v2/auth/).

// Credenciales de login (v2 no usa 'proyecto').
export interface LoginCredentials {
  username: string;
  password: string;
}

// Datos que se envían al registro v2. nombre/telefono/empresa_nombre son
// opcionales pero ayudan al super-admin a aprobar y asignar al conductor.
export interface RegisterCredentials {
  username: string;
  password: string;
  nombre?: string;
  telefono?: string;
  empresa_nombre?: string;
}

// Usuario que devuelve la API v2 (UsuarioMovilSerializer).
export interface AuthUser {
  id: number;
  username: string;
  correo: string | null;
  nombre: string | null;
  apellido: string | null;
  nombre_corto: string | null;
  telefono: string | null;
  numero_identificacion: string | null;
  imagen: string;
  verificado: boolean;
  is_active: boolean;
  /** Estado de aprobación del registro: 'pendiente' | 'aprobado' | 'rechazado'. */
  estado: string;
  /** true si el usuario tiene acceso a la app móvil en algún contenedor. */
  acceso_movil: boolean;
}

// Respuesta del login v2: tokens estándar + usuario.
export interface LoginResponse {
  access: string;
  refresh: string;
  usuario: AuthUser;
}

// El registro v2 devuelve el usuario creado.
export type RegisterResponse = AuthUser;

// Estado de autenticación.
export interface AuthState {
  isAuthenticated: boolean;
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
}

// Respuesta del refresh v2: access nuevo (y refresh nuevo por rotación).
export interface RefreshTokenResponse {
  access: string;
  refresh?: string;
}

export type ForgotPasswordFormValues = {
  username: string;
};
