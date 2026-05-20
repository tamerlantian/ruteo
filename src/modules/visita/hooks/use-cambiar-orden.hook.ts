import { useCallback } from 'react';
import { Alert } from 'react-native';
import Toast from 'react-native-toast-message';

import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { Entrega } from '../../vertical/interfaces/entrega.interface';
import { useCargarOrden } from './use-cargar-orden.hook';
import { backgroundGeolocationService } from '../../../shared/services';
import {
  removerVisitas,
  limpiarSeleccionVisitas,
} from '../store/slice/visita.slice';
import {
  limpiarNovedades,
  limpiarSeleccionNovedades,
} from '../../novedad/store/slice/novedad.slice';
import { resetSettings } from '../../settings';
import {
  selectPuedeDesvincular,
  selectConteoVisitasQueImpidenDesvinculacion,
} from '../store/selector/visita.selector';
import { toastTextOneStyle } from '../../../shared/styles/global.style';

/**
 * Carga una orden manejando el caso "ya hay otra orden cargada":
 *   - Misma orden -> no-op (devuelve false).
 *   - Sin orden cargada -> carga directa.
 *   - Orden distinta -> valida que no haya visitas/novedades con error sin
 *     sincronizar, pide confirmacion al conductor, limpia el estado de la
 *     orden actual (visitas, novedades, settings, geolocation) y carga la
 *     nueva.
 *
 * Devuelve true si la nueva orden quedo cargada; false si se cancelo o
 * bloqueo. El caller usa eso para cerrar el bottom sheet, etc.
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

      if (ordenActualId === null) {
        try {
          await cargarOrden(entrega);
          return true;
        } catch {
          return false;
        }
      }

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

      const confirmado = await new Promise<boolean>((resolve) => {
        Alert.alert(
          '¿Cambiar de orden?',
          `Se cerrará la orden actual y se cargará la Orden #${entrega.id}.`,
          [
            { text: 'Cancelar', style: 'cancel', onPress: () => resolve(false) },
            { text: 'Cambiar', onPress: () => resolve(true) },
          ],
          { cancelable: true, onDismiss: () => resolve(false) },
        );
      });
      if (!confirmado) {
        return false;
      }

      try {
        await backgroundGeolocationService.cleanup();
      } catch (geoError) {
        console.warn('Error deteniendo background geolocation:', geoError);
      }
      dispatch(removerVisitas());
      dispatch(limpiarNovedades());
      dispatch(limpiarSeleccionVisitas());
      dispatch(limpiarSeleccionNovedades());
      dispatch(resetSettings());

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
