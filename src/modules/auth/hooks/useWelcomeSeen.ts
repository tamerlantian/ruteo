import { useEffect, useState } from 'react';
import { WELCOME_SEEN_KEY } from '../../../shared/constants/localstorage-keys';
import storageService from '../../../shared/services/storage.service';

/** Marca la pantalla de bienvenida como ya vista (persiste el flag). */
export const markWelcomeSeen = (): Promise<void> =>
  storageService.setItem(WELCOME_SEEN_KEY, true);

/**
 * Lee si el usuario ya vio la pantalla de bienvenida.
 * `loading` es true mientras se consulta el almacenamiento.
 */
export const useWelcomeSeen = () => {
  const [loading, setLoading] = useState(true);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    let active = true;

    storageService
      .getItem<boolean>(WELCOME_SEEN_KEY)
      .then(value => {
        if (active) {
          setSeen(value === true);
        }
      })
      .catch(() => {
        // Si falla la lectura no bloqueamos al usuario: lo tratamos como vista.
        if (active) {
          setSeen(true);
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  return { loading, seen };
};
