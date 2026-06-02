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
  const separators = [' - ', ' -', '- ', '-', ' , ', ' ,', ', ', ',', ' | ', ' |', '| ', '|', '/'];
  
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
 * Normaliza un teléfono a formato internacional para WhatsApp (solo dígitos,
 * con código de país). Toma el primer número si vienen varios.
 *
 * @param phoneString - Teléfono(s) del cliente (formato libre/nacional)
 * @param countryCode - Indicativo a anteponer si el número es nacional (def. 57)
 * @returns Dígitos en formato internacional, o '' si no es válido
 *
 * @example
 * toWhatsAppNumber('3001234567')        // '573001234567'
 * toWhatsAppNumber('300 123 4567')      // '573001234567'
 * toWhatsAppNumber('573001234567')      // '573001234567' (ya tenía indicativo)
 * toWhatsAppNumber('3001234567-310...') // '573001234567' (toma el primero)
 */
export const toWhatsAppNumber = (
  phoneString: string,
  countryCode = '57',
): string => {
  const first = getFirstPhoneNumber(phoneString);
  if (!first) return '';

  let digits = first.replace(/\D/g, '');

  // Prefijo de marcación internacional "00" -> quitarlo
  if (digits.startsWith('00')) {
    digits = digits.slice(2);
  }

  if (digits.length < 7) return '';

  // Ya viene con el indicativo del país
  if (digits.startsWith(countryCode) && digits.length > 10) {
    return digits;
  }

  // Número nacional típico (Colombia: 10 dígitos) -> anteponer indicativo
  if (digits.length === 10) {
    return countryCode + digits;
  }

  // Fallback: si es largo asumimos que ya trae indicativo; si no, lo anteponemos
  return digits.length > 10 ? digits : countryCode + digits;
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
