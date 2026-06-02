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

// Google Maps JS API — usada por el mapa de ruta (WebView). Misma key que la
// web (rutenio). El mapa carga dentro de un WebView.
export const GOOGLE_MAPS_API_KEY = 'AIzaSyABnddF-aGC5kNcSk74Brfqd4U0ZDlKAgM';

// Referrer (baseUrl del WebView) para que la key sea aceptada si está
// restringida por dominio. Ajustar al dominio web permitido en la consola de
// Google si el mapa sale gris ("For development purposes only").
export const GOOGLE_MAPS_REFERER = 'https://ruteo.co';

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
