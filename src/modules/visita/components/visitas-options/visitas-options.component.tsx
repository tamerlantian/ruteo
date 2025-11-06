import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const VisitasOptionsComponent: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Opciones de Visitas</Text>
      <Text style={styles.subtitle}>
        Aquí aparecerán las opciones disponibles para gestionar las visitas.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1c1c1e',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#8e8e93',
    textAlign: 'center',
    lineHeight: 20,
  },
});
