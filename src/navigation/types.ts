/**
 * Tipos de navegación para toda la aplicación
 */
import type { Entrega } from '../modules/vertical/interfaces/entrega.interface';

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
    /**
     * Entrega completa (lo que el conductor llama "orden"). Va el objeto
     * entero porque se guarda en el snapshot para poder surfacearla en la
     * lista aunque no este en las asignadas del server.
     */
    entrega: Entrega;
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
  Settings: undefined;
};