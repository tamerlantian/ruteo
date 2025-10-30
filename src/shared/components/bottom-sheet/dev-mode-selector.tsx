import { updateApiBaseUrl } from '../../../config/environment';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useDevMode } from '../../context/dev-mode-context';

interface DevModeSelectorProps {
  onClose?: () => void;
}

export const DevModeSelector: React.FC<DevModeSelectorProps> = ({ onClose }) => {
  const { isDeveloperMode, toggleDeveloperMode, currentEndpoint } = useDevMode();

  const handleToggle = async () => {
    await toggleDeveloperMode();
    // Actualizar el endpoint en la configuración de entorno
    updateApiBaseUrl(!isDeveloperMode);
    if (onClose) {
      onClose();
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Modo desarrollador</Text>

      <View style={styles.infoContainer}>
        <Text style={styles.subtitle}>Estado actual:</Text>
        <Text style={[styles.status, isDeveloperMode ? styles.devMode : styles.prodMode]}>
          {isDeveloperMode ? 'ACTIVADO' : 'DESACTIVADO'}
        </Text>
      </View>

      <View style={styles.endpointContainer}>
        <Text style={styles.subtitle}>Endpoint:</Text>
        <Text style={styles.endpoint}>{currentEndpoint}</Text>
      </View>

      <TouchableOpacity
        style={[styles.button, isDeveloperMode ? styles.disableButton : styles.enableButton]}
        onPress={handleToggle}
      >
        <Text style={styles.buttonText}>
          {isDeveloperMode ? 'Desactivar modo desarrollador' : 'Activar modo desarrollador'}
        </Text>
      </TouchableOpacity>

      <Text style={styles.description}>
        El modo desarrollador te permite cambiar entre el endpoint de producción y desarrollo.
        {'\n\n'}• Modo normal: https://reddocapi.co/
        {'\n'}• Modo desarrollador: http://reddocapi.online/
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  status: {
    fontSize: 12,
    fontWeight: 'bold',
    padding: 5,
    borderRadius: 4,
  },
  devMode: {
    color: '#ffffff',
    backgroundColor: 'green',
  },
  prodMode: {
    color: '#ffffff',
    backgroundColor: 'gray',
  },
  endpointContainer: {
    marginBottom: 24,
  },
  endpoint: {
    fontSize: 14,
    backgroundColor: '#f0f0f0',
    padding: 8,
    borderRadius: 4,
    marginTop: 4,
  },
  button: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 24,
  },
  enableButton: {
    backgroundColor: '#2196F3',
  },
  disableButton: {
    backgroundColor: '#f44336',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  description: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
});
