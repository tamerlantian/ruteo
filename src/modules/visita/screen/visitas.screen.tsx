import React, { useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomSheet from '@gorhom/bottom-sheet';
import CustomBottomSheet from '../../../shared/components/bottom-sheet/bottom-sheet';
import CargarOrdenComponent from '../components/cargar-orden/cargar-orden.component';

export const VisitasScreen = () => {

   // Referencia al bottom sheet
  const bottomSheetRef = useRef<BottomSheet>(null);

  // Función para abrir el bottom sheet
  const handleOpenDevModeSheet = () => {
    bottomSheetRef.current?.expand();
  };

  // Función para cerrar el bottom sheet
  // const handleCloseDevModeSheet = () => {
  //   bottomSheetRef.current?.close();
  // };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <Text style={styles.title}>Visitas</Text>
        
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No tienes visitas cargadas</Text>
          <Text style={styles.emptySubtitle}>
            Las visitas aparecerán aquí cuando estén disponibles
          </Text>
          <TouchableOpacity style={styles.emptyButtonContainer} onPress={handleOpenDevModeSheet}>
            <Text style={styles.emptyButton}>Cargar orden</Text>
          </TouchableOpacity>
        </View>

        {/* Placeholder para futuras rutas */}
        {/* <View style={styles.routeCard}>
          <Text style={styles.routeTitle}>Ruta de ejemplo</Text>
          <Text style={styles.routeDescription}>
            Esta es una ruta de ejemplo que se mostrará cuando implementemos la funcionalidad
          </Text>
          <View style={styles.routeInfo}>
            <Text style={styles.routeInfoText}>Distancia: 15.2 km</Text>
            <Text style={styles.routeInfoText}>Tiempo: 45 min</Text>
          </View>
        </View> */}
      </ScrollView>

      {/* Bottom Sheet para el selector de modo desarrollador */}
      <CustomBottomSheet ref={bottomSheetRef} initialSnapPoints={['30%']}>
        <CargarOrdenComponent />
      </CustomBottomSheet>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1c1c1e',
    marginBottom: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1c1c1e',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#8e8e93',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  emptyButtonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyButton: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007aff',
    marginTop: 20,
  },
  routeCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  routeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1c1c1e',
    marginBottom: 4,
  },
  routeDescription: {
    fontSize: 14,
    color: '#8e8e93',
    marginBottom: 12,
  },
  routeInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  routeInfoText: {
    fontSize: 12,
    color: '#007aff',
    fontWeight: '500',
  },
});
