export interface LoginFormValues {
  username: string;
  password: string;
}

export interface RegisterFormValues {
  username: string;
  password: string;
  confirmarPassword: string;
  aceptarTerminosCondiciones: boolean;
  nombre: string;
  telefono: string;
  empresa_nombre: string;
}

export interface RefreshTokenResponse {
  access: string;
  refresh?: string;
}
