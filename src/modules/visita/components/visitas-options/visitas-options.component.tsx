import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';

interface VisitasOptionsProps {
  onDesvincular: () => void;
}

export const VisitasOptionsComponent: React.FC<VisitasOptionsProps> = ({
  onDesvincular,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Opciones</Text>
      
      <TouchableOpacity 
        style={styles.optionItem}
        onPress={onDesvincular}
        activeOpacity={0.7}
      >
        <View style={styles.optionIcon}>
          <Ionicons 
            name="unlink-outline" 
            size={24} 
            color="#ff3b30" 
          />
        </View>
        <View style={styles.optionContent}>
          <Text style={styles.optionTitle}>Desvincular orden</Text>
          <Text style={styles.optionDescription}>
            Limpiar todas las visitas
          </Text>
        </View>
        <Ionicons 
          name="chevron-forward" 
          size={20} 
          color="#c7c7cc" 
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1c1c1e',
    marginBottom: 14,
    textAlign: 'left',
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff2f2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1c1c1e',
    marginBottom: 2,
  },
  optionDescription: {
    fontSize: 14,
    color: '#8e8e93',
    lineHeight: 18,
  },
});
