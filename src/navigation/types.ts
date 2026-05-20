/**
 * Tipos de navegación para toda la aplicación
 */

/**
 * Parámetros para el stack raíz de la aplicación
 */
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

/**
 * Parámetros para el stack de autenticación
 */
export type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

/**
 * Parámetros para el stack principal (aplicación autenticada)
 */
export type MainStackParamList = {
  HomeTabs: undefined;
  EntregasDetalle: {
    /** Identificador de la entrega (lo que el conductor llama "orden"). */
    entregaId: number;
    /** Despacho asociado, necesario para el load de visitas. */
    despachoId: number;
    /** Tenant schema (subdominio). */
    schemaName: string;
  };
  EntregaForm: {
    visitasSeleccionadas: string[];
  };
  NovedadForm: {
    visitasSeleccionadas: string[];
  };
  SolucionForm: {
    novedadesSeleccionadas: string[];
  };
  Profile: undefined;
  About: undefined;
};

/**
 * Parámetros para las tabs principales
 */
export type MainTabParamList = {
  Dashboard: undefined;
  Visitas: undefined;
  Novedades: undefined;
  Settings: undefined;
};