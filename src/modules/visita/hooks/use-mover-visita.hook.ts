import { useCallback } from 'react';
import { Alert } from 'react-native';
import Toast from 'react-native-toast-message';

import { useAppDispatch } from '../../../store/hooks';
import { moverVisitaLocal } from '../store/slice/visita.slice';
import { toastTextOneStyle } from '../../../shared/styles/global.style';
import { VisitaResponse } from '../interfaces/visita.interface';

type Posicion = 'primero' | 'ultimo' | 'arriba' | 'abajo';

/**
 * Reordena la visita en el orden de entrega del conductor. Es una decision
 * 100% local del telefono: nada se envia al server. El orden persiste via
 * redux-persist y sobrevive a recargas (ver merge en cargarVisitasThunk).
 * Esto resuelve el escenario offline trivialmente — no hay nada que
 * sincronizar.
 */
export const useMoverVisita = () => {
  const dispatch = useAppDispatch();

  const mover = useCallback(
    (visitaId: number, posicion: Posicion) => {
      dispatch(moverVisitaLocal({ visitaId, posicion }));
      Toast.show({
        type: 'success',
        text1: 'Orden actualizado',
        text1Style: toastTextOneStyle,
      });
    },
    [dispatch],
  );

  return useCallback(
    (visita: VisitaResponse) => {
      Alert.alert(
        `Visita ${visita.numero ? `#${visita.numero}` : `#${visita.id}`}`,
        '¿Cómo querés reordenarla en la ruta?',
        [
          { text: 'Entregar primero', onPress: () => mover(visita.id, 'primero') },
          { text: 'Subir una posición', onPress: () => mover(visita.id, 'arriba') },
          { text: 'Bajar una posición', onPress: () => mover(visita.id, 'abajo') },
          { text: 'Posponer al final', onPress: () => mover(visita.id, 'ultimo') },
          { text: 'Cancelar', style: 'cancel' },
        ],
      );
    },
    [mover],
  );
};
