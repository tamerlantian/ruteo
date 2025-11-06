import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { FormButton } from '../../../../shared/components/ui/button/FormButton';

interface ConfirmacionDesvincularProps {
  onConfirmar: () => void;
  onCancelar: () => void;
  isLoading?: boolean;
}

export const ConfirmacionDesvincularComponent: React.FC<ConfirmacionDesvincularProps> = ({
  onConfirmar,
  onCancelar,
  isLoading = false,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons 
          name="warning" 
          size={48} 
          color="#ff9500" 
        />
      </View>
      
      <Text style={styles.title}>¿Desvincular orden?</Text>
      
      <Text style={styles.description}>
        Esta acción limpiará todas las visitas cargadas. 
        No podrás deshacer esta acción.
      </Text>

 

      <View style={styles.buttonContainer}>
        <FormButton
          title="Cancelar"
          variant="secondary"
          onPress={onCancelar}
          style={styles.cancelButton}
          disabled={isLoading}
        />
        <FormButton
          title="Desvincular"
          variant="danger"
          onPress={onConfirmar}
          style={styles.confirmButton}
          isLoading={isLoading}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 4,
    alignItems: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fff8f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1c1c1e',
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#8e8e93',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fff8f0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
    borderLeftWidth: 3,
    borderLeftColor: '#ff9500',
  },
  warningIcon: {
    marginRight: 8,
    marginTop: 1,
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    color: '#d1940c',
    lineHeight: 18,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  cancelButton: {
    flex: 1,
  },
  confirmButton: {
    flex: 1,
  },
});
