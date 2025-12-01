import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { FormButton } from '../../../../shared/components/ui/button/FormButton';

interface ConfirmacionDesvincularProps {
  onConfirmar: () => void;
  onCancelar: () => void;
  isLoading?: boolean;
  puedeDesvincular?: boolean;
  conteoVisitas?: {
    total: number;
    visitasConError: number;
    novedadesConError: number;
  };
}

export const ConfirmacionDesvincularComponent: React.FC<ConfirmacionDesvincularProps> = ({
  onConfirmar,
  onCancelar,
  isLoading = false,
  puedeDesvincular = true,
  conteoVisitas,
}) => {
  const getDescriptionText = () => {
    if (!puedeDesvincular && conteoVisitas && conteoVisitas.total > 0) {
      const { visitasConError, novedadesConError } = conteoVisitas;
      let mensaje = 'No puedes desvincular la orden porque tienes:\n\n';
      
      if (visitasConError > 0) {
        mensaje += `• ${visitasConError} visita${visitasConError > 1 ? 's' : ''} con error${visitasConError > 1 ? 'es' : ''}\n`;
      }
      
      if (novedadesConError > 0) {
        mensaje += `• ${novedadesConError} novedad${novedadesConError > 1 ? 'es' : ''} con error${novedadesConError > 1 ? 'es' : ''}\n`;
      }
      
      return mensaje;
    }
    
    return 'Esta acción limpiará todas las visitas cargadas. No podrás deshacer esta acción.';
  };

  const getWarningMessage = () => {
    if (!puedeDesvincular && conteoVisitas && conteoVisitas.total > 0) {
      return 'Tienes visitas y/o novedades con error. No puedes desvincular la orden.';
    }
    return null;
  };
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons 
          name="warning" 
          size={48} 
          color="#ff9500" 
        />
      </View>
      
      <Text style={styles.title}>
        {puedeDesvincular ? '¿Desvincular orden?' : 'No se puede desvincular'}
      </Text>
      
      <Text style={styles.description}>
        {getDescriptionText()}
      </Text>

      {getWarningMessage() && (
        <View style={styles.warningBox}>
          <Ionicons 
            name="alert-circle" 
            size={20} 
            color="#d1940c" 
            style={styles.warningIcon}
          />
          <Text style={styles.warningText}>
            {getWarningMessage()}
          </Text>
        </View>
      )}

      <View style={styles.buttonContainer}>
        <FormButton
          title="Cancelar"
          variant="secondary"
          onPress={onCancelar}
          style={styles.cancelButton}
          disabled={isLoading}
        />
        <FormButton
          title={puedeDesvincular ? "Desvincular" : "No disponible"}
          variant="danger"
          onPress={onConfirmar}
          style={styles.confirmButton}
          isLoading={isLoading}
          disabled={isLoading || !puedeDesvincular}
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
    marginBottom: 14,
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
