// ============================================
// TIPOS DE NAVEGACIÓN GLOBAL
// ============================================

/**
 * Stack principal de la aplicación
 * Maneja la navegación entre Auth y Main
 */
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

// ============================================
// MÓDULO DE AUTENTICACIÓN
// ============================================

/**
 * Stack de autenticación
 * Contiene Login, Register, ForgotPassword
 */
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

// ============================================
// MÓDULO PRINCIPAL (MAIN)
// ============================================

/**
 * Stack principal de la aplicación autenticada
 * Contiene HomeTabs y pantallas modales
 */
export type MainStackParamList = {
  HomeTabs: undefined;
  EntregaForm: {
    visitasSeleccionadas: string[];
  };
};

/**
 * Tabs del home principal
 * Contiene Dashboard, Visitas, Settings
 */
export type MainTabParamList = {
  Dashboard: undefined;
  Visitas: undefined;
  Settings: undefined;
};

// ============================================
// TIPOS COMPUESTOS PARA NAVEGACIÓN ANIDADA
// ============================================

/**
 * Tipo compuesto para navegación desde Auth a Main
 */
export type AuthToMainNavigationProp = {
  navigate(name: 'Main'): void;
  navigate(name: 'HomeTabs'): void;
};

/**
 * Tipo para navegación dentro del Main Stack
 */
export type MainStackNavigationProp = {
  navigate<K extends keyof MainStackParamList>(
    name: K,
    params: MainStackParamList[K]
  ): void;
  navigate<K extends keyof MainStackParamList>(
    name: K,
    ...args: MainStackParamList[K] extends undefined ? [] : [MainStackParamList[K]]
  ): void;
};
