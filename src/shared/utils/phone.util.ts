/**
 * Utilidades para manejo de números telefónicos
 */

/**
 * Extrae el primer número de teléfono de una cadena que puede contener múltiples números
 * separados por guiones, espacios, comas u otros separadores
 * 
 * @param phoneString - Cadena con uno o más números de teléfono
 * @returns El primer número de teléfono encontrado, o la cadena original si no se encuentra patrón
 * 
 * @example
 * getFirstPhoneNumber('31673437473 - 8348348344') // '31673437473'
 * getFirstPhoneNumber('3001234567-3109876543') // '3001234567'
 * getFirstPhoneNumber('300 123 4567, 310 987 6543') // '300 123 4567'
 * getFirstPhoneNumber('3001234567') // '3001234567'
 */
export const getFirstPhoneNumber = (phoneString: string): string => {
  if (!phoneString || typeof phoneString !== 'string') {
    return '';
  }

  // Limpiar la cadena de espacios extra
  const cleanString = phoneString.trim();
  
  // Patrones comunes de separadores
  const separators = [' - ', ' -', '- ', '-', ' , ', ' ,', ', ', ',', ' | ', ' |', '| ', '|'];
  
  // Buscar el primer separador que aparezca
  let firstSeparatorIndex = -1;
  
  for (const separator of separators) {
    const index = cleanString.indexOf(separator);
    if (index !== -1 && (firstSeparatorIndex === -1 || index < firstSeparatorIndex)) {
      firstSeparatorIndex = index;
    }
  }
  
  // Si no se encuentra separador, devolver la cadena completa
  if (firstSeparatorIndex === -1) {
    return cleanString;
  }
  
  // Extraer el primer número antes del separador
  const firstNumber = cleanString.substring(0, firstSeparatorIndex).trim();
  
  return firstNumber || cleanString;
};

/**
 * Formatea un número de teléfono para mostrar de forma consistente
 * 
 * @param phoneNumber - Número de teléfono a formatear
 * @returns Número formateado o cadena vacía si es inválido
 */
export const formatPhoneNumber = (phoneNumber: string): string => {
  if (!phoneNumber) return '';
  
  // Remover caracteres no numéricos excepto espacios
  const cleaned = phoneNumber.replace(/[^\d\s]/g, '');
  
  return cleaned.trim();
};

/**
 * Valida si una cadena contiene un número de teléfono válido
 * 
 * @param phoneNumber - Cadena a validar
 * @returns true si es un número válido, false en caso contrario
 */
export const isValidPhoneNumber = (phoneNumber: string): boolean => {
  if (!phoneNumber) return false;
  
  // Remover espacios y caracteres especiales
  const cleaned = phoneNumber.replace(/[\s\-()+ ]/g, '');
  
  // Validar que tenga entre 7 y 15 dígitos (estándar internacional)
  return /^\d{7,15}$/.test(cleaned);
};
