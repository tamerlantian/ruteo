import AsyncStorage from '@react-native-async-storage/async-storage';

// Configuración de endpoints base
export const BASE_ENDPOINTS = {
  PRODUCTION: 'reddocapi.co',
  DEVELOPMENT: 'reddocapi.online',
} as const;

const DEV_MODE_STORAGE_KEY = '@dev_mode_enabled';

/**
 * Obtiene el dominio base según el modo de desarrollo actual
 * @returns El dominio base (sin protocolo ni subdominios)
 */
export const getBaseDomain = async (): Promise<string> => {
  try {
    const savedMode = await AsyncStorage.getItem(DEV_MODE_STORAGE_KEY);
    const isDeveloperMode = savedMode !== null ? JSON.parse(savedMode) : false;

    return isDeveloperMode ? BASE_ENDPOINTS.DEVELOPMENT : BASE_ENDPOINTS.PRODUCTION;
  } catch (error) {
    console.error('Error getting base domain:', error);
    // Fallback a producción en caso de error
    return BASE_ENDPOINTS.PRODUCTION;
  }
};

/**
 * Obtiene el dominio base según el modo de desarrollo actual
 * @returns El dominio base (con protocolo y subdominio)
 */
export const getBaseCompleteDomain = async (): Promise<string> => {
  try {
    const savedMode = await AsyncStorage.getItem(DEV_MODE_STORAGE_KEY);
    const isDeveloperMode = savedMode !== null ? JSON.parse(savedMode) : false;

    return isDeveloperMode
      ? `http://subdomain.${BASE_ENDPOINTS.DEVELOPMENT}`
      : `https://subdomain.${BASE_ENDPOINTS.PRODUCTION}`;
  } catch (error) {
    console.error('Error getting base domain:', error);
    // Fallback a producción en caso de error
    return BASE_ENDPOINTS.PRODUCTION;
  }
};

/**
 * Construye una URL con subdominio dinámico respetando el modo de desarrollo
 * @param schema - El subdominio a usar (ej: 'api', 'admin', 'cdn')
 * @param path - La ruta del endpoint (opcional, por defecto '/')
 * @param protocol - El protocolo a usar (por defecto 'https')
 * @returns La URL completa construida
 */
export const buildUrlWithSubdomain = async (
  schema: string,
  path: string = '/',
): Promise<string> => {
  const baseDomain = await getBaseCompleteDomain();
  const baseWithSubdomain = replaceSubdomain(baseDomain, schema);
  const cleanPath = path.startsWith('/') ? path : `/${path}`;

  return `${baseWithSubdomain}${cleanPath}`;
};

/**
 * Reemplaza el subdominio en una URL
 * @param url - La URL original
 * @param schema - El nuevo subdominio
 * @returns La URL con el subdominio reemplazado
 */
export const replaceSubdomain = (url: string, schema: string): string => {
  return url.replace('subdomain', schema);
};

/**
 * Construye una URL con subdominio de forma síncrona usando el estado actual del dev-mode
 * Esta función requiere que el contexto de dev-mode ya esté inicializado
 * @param schema - El subdominio a usar
 * @param isDeveloperMode - El estado actual del modo desarrollador
 * @param path - La ruta del endpoint (opcional, por defecto '/')
 * @param protocol - El protocolo a usar (por defecto 'https')
 * @returns La URL completa construida
 */
export const buildUrlWithSubdomainSync = (
  schema: string,
  isDeveloperMode: boolean,
  path: string = '/',
  protocol: 'http' | 'https' = 'https',
): string => {
  const baseDomain = isDeveloperMode ? BASE_ENDPOINTS.DEVELOPMENT : BASE_ENDPOINTS.PRODUCTION;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;

  return `${protocol}://${schema}.${baseDomain}${cleanPath}`;
};

/**
 * Tipo para definir configuraciones de endpoints con subdominios
 */
export interface EndpointConfig {
  schema: string;
  path?: string;
  protocol?: 'http' | 'https';
}

/**
 * Construye múltiples URLs con diferentes subdominios
 * @param configs - Array de configuraciones de endpoints
 * @returns Promise con un objeto que mapea cada schema a su URL construida
 */
export const buildMultipleUrls = async (
  configs: EndpointConfig[],
): Promise<Record<string, string>> => {
  const baseDomain = await getBaseDomain();
  const urls: Record<string, string> = {};

  configs.forEach(({ schema, path = '/', protocol = 'https' }) => {
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    urls[schema] = `${protocol}://${schema}.${baseDomain}${cleanPath}`;
  });

  return urls;
};
