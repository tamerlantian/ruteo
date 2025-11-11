/**
 * Utilidades para generación de IDs únicos
 */

/**
 * Genera un ID temporal único
 * Formato: "temp_[timestamp]_[random]"
 * 
 * @param prefix - Prefijo opcional para el ID (default: 'temp')
 * @returns ID temporal único
 * 
 * @example
 * generateTempId() // "temp_1699711234567_456"
 * generateTempId('novedad') // "novedad_1699711234567_456"
 */
export const generateTempId = (prefix: string = 'temp'): string => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `${prefix}_${timestamp}_${random}`;
};

/**
 * Verifica si un ID es temporal
 * @param id - ID a verificar
 * @param prefix - Prefijo a verificar (default: 'temp')
 * @returns true si el ID es temporal
 * 
 * @example
 * isTempId('temp_1699711234567_456') // true
 * isTempId('real_id_123') // false
 */
export const isTempId = (id: string, prefix: string = 'temp'): boolean => {
  return id.startsWith(`${prefix}_`);
};

/**
 * Extrae el timestamp de un ID temporal
 * @param tempId - ID temporal
 * @returns timestamp o null si no es válido
 * 
 * @example
 * extractTimestamp('temp_1699711234567_456') // 1699711234567
 */
export const extractTimestamp = (tempId: string): number | null => {
  const parts = tempId.split('_');
  if (parts.length >= 3) {
    const timestamp = parseInt(parts[1], 10);
    return isNaN(timestamp) ? null : timestamp;
  }
  return null;
};
