import { useCallback } from 'react';
import { Linking } from 'react-native';
import Toast from 'react-native-toast-message';

import { toWhatsAppNumber } from '../utils/phone.util';
import { DEFAULT_COUNTRY_CODE } from '../../config/environment';
import { toastTextOneStyle } from '../styles/global.style';

export interface UseWhatsAppReturn {
  openChat: (phone: string, message?: string) => Promise<void>;
}

/**
 * Abre el WhatsApp LOCAL del conductor para chatear con el cliente.
 *
 * Usa el deep link click-to-chat (whatsapp:// con fallback a wa.me) — NO la
 * Cloud API de Meta. La Cloud API obliga a enviar plantillas y exige que el
 * cliente inicie la conversación; este enfoque deja al conductor escribir desde
 * su propio número sin restricciones ni costo.
 */
export const useWhatsApp = (): UseWhatsAppReturn => {
  const openChat = useCallback(async (phone: string, message?: string) => {
    const numero = toWhatsAppNumber(phone, DEFAULT_COUNTRY_CODE);
    if (!numero) {
      Toast.show({
        type: 'error',
        text1: 'Número de WhatsApp inválido',
        text1Style: toastTextOneStyle,
      });
      return;
    }

    const texto = message ? encodeURIComponent(message) : '';
    const appUrl = `whatsapp://send?phone=${numero}${
      texto ? `&text=${texto}` : ''
    }`;
    // Fallback universal: wa.me abre el navegador y redirige a WhatsApp. Cubre
    // el caso en que el esquema whatsapp:// no esté resoluble (visibilidad de
    // paquetes en Android, etc.).
    const webUrl = `https://wa.me/${numero}${texto ? `?text=${texto}` : ''}`;

    try {
      await Linking.openURL(appUrl);
    } catch {
      try {
        await Linking.openURL(webUrl);
      } catch {
        Toast.show({
          type: 'error',
          text1: 'No se pudo abrir WhatsApp',
          text2: 'Verifica que WhatsApp esté instalado',
          text1Style: toastTextOneStyle,
        });
      }
    }
  }, []);

  return { openChat };
};
