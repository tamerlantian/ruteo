import { useCallback } from 'react';
import { Alert } from 'react-native';
import Toast from 'react-native-toast-message';

import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { Entrega } from '../../vertical/interfaces/entrega.interface';
import { useCargarOrden } from './use-cargar-orden.hook';
import { backgroundGeolocationService } from '../../../shared/services';
import {
  guardarSnapshotVisitas,
  restaurarSnapshotVisitas,
} from '../store/slice/visita.slice';
import {
  guardarSnapshotNovedades,
  restaurarSnapshotNovedades,
} from '../../novedad/store/slice/novedad.slice';
import {
  selectPuedeDesvincular,
  selectConteoVisitasQueImpidenDesvinculacion,
} from '../store/selector/visita.selector';
import { toastTextOneStyle } from '../../../shared/styles/global.style';

/**
 * Cambio de orden con memoria local (Opcion A, fase 1).
 *
 * - Misma orden -> no-op.
 * - Sin orden cargada -> restaura el snapshot del target (si existe) y carga.
 * - Distinta orden y SIN pendientes de sync -> guarda snapshot de la actual,
 *   restaura snapshot del target y carga. Sin confirmacion: con snapshots
 *   no se pierde nada al saltar, asi que la friccion deja de tener sentido.
 * - Distinta orden y CON pendientes -> bloqueamos (igual que desvincular).
 *   Una orden "Pausada" tiene cero pending por contrato; si tiene errores
 *   el conductor los resuelve antes de moverse.
 *
 * Devuelve true si la nueva orden quedo cargada; false si se cancelo/bloqueo.
 */
export const useCambiarOrden = () => {
  const dispatch = useAppDispatch();
  const cargarOrden = useCargarOrden();
  const puedeDesvincular = useAppSelector(selectPuedeDesvincular);
  const conteoQueImpiden = useAppSelector(
    selectConteoVisitasQueImpidenDesvinculacion,
  );

  return useCallback(
    async (entrega: Entrega, ordenActualId: number | null): Promise<boolean> => {
      if (ordenActualId !== null && ordenActualId === entrega.id) {
        return false;
      }

      // Sin orden cargada: solo restaurar (no-op si no hay snapshot) y cargar.
      if (ordenActualId === null) {
        dispatch(restaurarSnapshotVisitas(entrega.id));
        dispatch(restaurarSnapshotNovedades(entrega.id));
        try {
          await cargarOrden(entrega);
          return true;
        } catch (error: any) {
          Toast.show({
            type: 'error',
            text1: error?.titulo || 'Error al cargar la orden',
            text2: error?.mensaje || 'Inténtalo nuevamente.',
            text1Style: toastTextOneStyle,
          });
          return false;
        }
      }

      // Bloqueo: errores pendientes en la orden actual.
      if (!puedeDesvincular) {
        const { visitasConError, novedadesConError } = conteoQueImpiden;
        const partes: string[] = [];
        if (visitasConError > 0) {
          partes.push(
            `${visitasConError} visita${visitasConError === 1 ? '' : 's'} con error`,
          );
        }
        if (novedadesConError > 0) {
          partes.push(
            `${novedadesConError} novedad${novedadesConError === 1 ? '' : 'es'} con error`,
          );
        }
        const detalle = partes.length
          ? partes.join(' y ')
          : 'entregas pendientes de sincronizar';
        Alert.alert(
          'No podés cambiar de orden',
          `Tenés ${detalle}. Reintentá o resolvelas antes de cambiar.`,
          [{ text: 'Entendido', style: 'cancel' }],
        );
        return false;
      }

      // Cambio "limpio": snapshot de la actual -> restaurar la nueva.
      dispatch(guardarSnapshotVisitas(ordenActualId));
      dispatch(guardarSnapshotNovedades(ordenActualId));

      try {
        await backgroundGeolocationService.cleanup();
      } catch (geoError) {
        console.warn('Error deteniendo background geolocation:', geoError);
      }

      dispatch(restaurarSnapshotVisitas(entrega.id));
      dispatch(restaurarSnapshotNovedades(entrega.id));

      try {
        await cargarOrden(entrega);
        return true;
      } catch (error: any) {
        Toast.show({
          type: 'error',
          text1: error?.titulo || 'Error al cargar la orden',
          text2: error?.mensaje || 'Inténtalo nuevamente.',
          text1Style: toastTextOneStyle,
        });
        return false;
      }
    },
    [cargarOrden, dispatch, puedeDesvincular, conteoQueImpiden],
  );
};
