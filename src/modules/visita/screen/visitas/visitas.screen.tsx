import React, { useCallback, useRef } from 'react';
import { Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import BottomSheet from '@gorhom/bottom-sheet';
import Toast from 'react-native-toast-message';

import CustomBottomSheet from '../../../../shared/components/bottom-sheet/bottom-sheet';
import {
  AppBar,
  AppBarAction,
} from '../../../../shared/components/ui/app-bar/app-bar.component';
import CargarOrdenComponent from '../../components/cargar-orden/cargar-orden.component';
import { MisOrdenesComponent } from '../../components/mis-ordenes/mis-ordenes.component';
import { visitasStyles } from './visitas.style';
import { Entrega } from '../../../vertical/interfaces/entrega.interface';
import { MainStackParamList } from '../../../../navigation/types';
import { useAppDispatch } from '../../../../store/hooks';
import { guardarSnapshotVisitas } from '../../store/slice/visita.slice';
import { guardarSnapshotNovedades } from '../../../novedad/store/slice/novedad.slice';
import { toastTextOneStyle } from '../../../../shared/styles/global.style';

type NavigationProp = NativeStackNavigationProp<MainStackParamList>;

/**
 * Pantalla principal del tab "Entregas": lista de ordenes asignadas.
 *
 * El conductor toca una orden y navega al detalle (push). Toda la logica
 * de trabajo (visitas, filtros, entregar, etc.) vive en EntregasDetalle.
 * Esta pantalla es solo seleccion + fallback "Cargar por codigo".
 */
export const VisitasScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const dispatch = useAppDispatch();
  const cargarOrdenSheetRef = useRef<BottomSheet>(null);

  const openCargarOrdenSheet = useCallback(() => {
    cargarOrdenSheetRef.current?.expand();
  }, []);
  const closeCargarOrdenSheet = useCallback(() => {
    cargarOrdenSheetRef.current?.close();
  }, []);

  const irAlDetalle = useCallback(
    (entrega: Entrega) => {
      navigation.navigate('EntregasDetalle', { entrega });
    },
    [navigation],
  );

  const onEntregaResueltaPorCodigo = useCallback(
    (entrega: Entrega) => {
      closeCargarOrdenSheet();
      // Agregamos a la lista (sin navegar) creando un snapshot vacio con la
      // metadata de la entrega — MisOrdenes hace el surfacing via `entrega`.
      // El conductor ve la card aparecer en su lista y decide cuando tocarla
      // para entrar al detalle (donde recien se carga visitas del server).
      dispatch(guardarSnapshotVisitas({ entregaId: entrega.id, entrega }));
      dispatch(guardarSnapshotNovedades({ entregaId: entrega.id, entrega }));
      Toast.show({
        type: 'success',
        text1: `Orden #${entrega.id} agregada a tu lista`,
        text1Style: toastTextOneStyle,
      });
    },
    [closeCargarOrdenSheet, dispatch],
  );

  const handleCargarOrdenDismiss = useCallback(() => {
    Keyboard.dismiss();
  }, []);

  return (
    <SafeAreaView style={visitasStyles.container}>
      <AppBar
        title="Entregas"
        actions={
          <AppBarAction
            icon="add-outline"
            label="Agregar orden por código"
            onPress={openCargarOrdenSheet}
          />
        }
      />
      <MisOrdenesComponent
        onCargarPorCodigo={openCargarOrdenSheet}
        onSeleccionOrden={irAlDetalle}
      />
      <CustomBottomSheet
        ref={cargarOrdenSheetRef}
        enableDynamicSizing={false}
        initialSnapPoints={['45%']}
        onDismiss={handleCargarOrdenDismiss}
      >
        <CargarOrdenComponent onEntregaResuelta={onEntregaResueltaPorCodigo} />
      </CustomBottomSheet>
    </SafeAreaView>
  );
};
