import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { visitasStyles } from '../../../visita/screen/visitas/visitas.style';
import { NovedadesBody } from '../../components/novedades-body/novedades-body.component';
import { AppBar } from '../../../../shared/components/ui/app-bar/app-bar.component';

export const NovedadesScreen = () => {
  return (
    <SafeAreaView style={visitasStyles.container}>
      <AppBar title="Novedades" />
      <NovedadesBody />
    </SafeAreaView>
  );
};
