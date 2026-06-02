/**
 * Environment configuration for the application
 */

// Estas son las URLs base para los diferentes entornos
export const API_URLS = {
  PRODUCTION: 'https://ruteoapi.co',
  DEVELOPMENT: 'http://ruteoapi.online',
};

// Configuración de contacto
export const WHATSAPP_NUMBER = '3106097801';

// Código de país por defecto para construir enlaces de WhatsApp (Colombia = 57).
// Los teléfonos de los clientes vienen en formato nacional, sin indicativo.
export const DEFAULT_COUNTRY_CODE = '57';

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
