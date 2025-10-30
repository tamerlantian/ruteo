/**
 * Environment configuration for the application
 */

// Estas son las URLs base para los diferentes entornos
export const API_URLS = {
  PRODUCTION: 'https://reddocapi.co',
  DEVELOPMENT: 'http://reddocapi.online',
};

// La configuración del entorno con opciones para cambiar dinámicamente
export const environment = {
  production: false,
  apiBase: API_URLS.DEVELOPMENT, // Valor por defecto que puede ser reemplazado
  timeout: 30000, // Default timeout in milliseconds
};

// Función para actualizar la URL base de la API
export const updateApiBaseUrl = (isDeveloperMode: boolean): void => {
  environment.apiBase = isDeveloperMode ? API_URLS.DEVELOPMENT : API_URLS.PRODUCTION;
};
