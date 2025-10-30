import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export const VisitasScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <Text style={styles.title}>Visitas</Text>
        
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No hay rutas disponibles</Text>
          <Text style={styles.emptySubtitle}>
            Las rutas aparecerán aquí cuando estén disponibles
          </Text>
        </View>

        {/* Placeholder para futuras rutas */}
        <View style={styles.routeCard}>
          <Text style={styles.routeTitle}>Ruta de ejemplo</Text>
          <Text style={styles.routeDescription}>
            Esta es una ruta de ejemplo que se mostrará cuando implementemos la funcionalidad
          </Text>
          <View style={styles.routeInfo}>
            <Text style={styles.routeInfoText}>Distancia: 15.2 km</Text>
            <Text style={styles.routeInfoText}>Tiempo: 45 min</Text>
          </View>
        </View>
      </ScrollView>
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
