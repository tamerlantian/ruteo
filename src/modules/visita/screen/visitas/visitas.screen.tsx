import React, { useCallback, useRef } from 'react';
import { Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import BottomSheet from '@gorhom/bottom-sheet';

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
      irAlDetalle(entrega);
    },
    [closeCargarOrdenSheet, irAlDetalle],
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
            icon="keypad-outline"
            label="Cargar orden por código"
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
