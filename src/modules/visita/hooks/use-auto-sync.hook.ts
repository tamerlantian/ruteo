import { useEffect, useRef } from 'react';
import Toast from 'react-native-toast-message';

import { useAppSelector } from '../../../store/hooks';
import { selectVisitasConErrorRetryables } from '../store/selector/visita.selector';
import { networkService } from '../../../shared/services';
import { useRetryVisitas } from './use-retry-visitas.hook';
import { toastTextOneStyle } from '../../../shared/styles/global.style';

/**
 * Reintenta automáticamente las entregas guardadas (retryables con datos
 * guardados) en cuanto vuelve la conexión. Es lo que el conductor ESPERA que
 * pase: dejó entregas "sin enviar" estando offline y, al recuperar internet,
 * se sincronizan solas sin que tenga que entrar al filtro y reintentar a mano.
 *
 * Detalles:
 * - Solo dispara en la transición offline -> online (no en cada evento ni en
 *   la suscripción inicial), para no reintentar de más.
 * - Usa refs para leer el estado más reciente sin re-suscribirse al listener.
 * - No dispara si ya hay un reintento en curso.
 */
export const useAutoSync = () => {
  const retryables = useAppSelector(selectVisitasConErrorRetryables);
  const { reintentarVisitasConError, isRetryLoading } = useRetryVisitas();

  // Snapshot del último estado conocido para detectar la transición. Empieza
  // en null: el primer evento (que NetInfo emite al suscribirse) solo
  // inicializa, no dispara.
  const wasConnectedRef = useRef<boolean | null>(null);
  const retryablesRef = useRef(retryables);
  const isRetryLoadingRef = useRef(isRetryLoading);

  retryablesRef.current = retryables;
  isRetryLoadingRef.current = isRetryLoading;

  useEffect(() => {
    const unsubscribe = networkService.subscribeToNetworkChanges(state => {
      const online =
        state.isConnected && state.isInternetReachable !== false;
      const wasConnected = wasConnectedRef.current;
      wasConnectedRef.current = online;

      // Solo nos interesa el flanco offline -> online.
      if (wasConnected !== false || !online) {
        return;
      }

      if (isRetryLoadingRef.current) {
        return;
      }

      const pendientes = retryablesRef.current.filter(
        visita => !!visita.datos_formulario_guardados,
      );
      if (pendientes.length === 0) {
        return;
      }

      Toast.show({
        type: 'info',
        text1: 'Conexión restaurada',
        text2: `Sincronizando ${pendientes.length} entrega(s)…`,
        text1Style: toastTextOneStyle,
      });

      reintentarVisitasConError(pendientes.map(v => v.id)).catch(error => {
        console.error('Auto-sync falló:', error);
      });
    });

    return unsubscribe;
  }, [reintentarVisitasConError]);
};
