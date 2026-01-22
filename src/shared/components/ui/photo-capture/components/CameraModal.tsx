import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  StatusBar,
  Alert,
} from 'react-native';
import { Camera, useCameraDevice } from 'react-native-vision-camera';
import Ionicons from '@react-native-vector-icons/ionicons';

interface CameraModalProps {
  visible: boolean;
  onClose: () => void;
  onTakePhoto: () => Promise<void>;
  cameraRef: React.RefObject<Camera | null>;
  isLoading: boolean;
}

/**
 * Modal de cámara integrado usando Vision Camera
 * COMPONENTE PARALELO - No afecta la funcionalidad actual
 */
export const CameraModal: React.FC<CameraModalProps> = ({
  visible,
  onClose,
  onTakePhoto,
  cameraRef,
  isLoading,
}) => {
  const [cameraReady, setCameraReady] = useState(false);
  const device = useCameraDevice('back');

  useEffect(() => {
    if (visible) {
      // Pequeño delay para asegurar que la cámara se inicialice correctamente
      const timer = setTimeout(() => {
        setCameraReady(true);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setCameraReady(false);
    }
  }, [visible]);

  const handleTakePhoto = async () => {
    try {
      await onTakePhoto();
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'No se pudo tomar la foto. Inténtalo de nuevo.');
    }
  };

  if (!device) {
    return (
      <Modal visible={visible} animationType="slide">
        <View style={styles.errorContainer}>
          <Ionicons name="camera-outline" size={64} color="#8e8e93" />
          <Text style={styles.errorText}>Cámara no disponible</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Cerrar</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} animationType="slide" statusBarTranslucent>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <View style={styles.container}>
        {/* Cámara */}
        {cameraReady ? (
          <Camera
            ref={cameraRef}
            style={styles.camera}
            device={device}
            isActive={visible}
            photo={true}
            outputOrientation="device"
          />
        ) : (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Iniciando cámara...</Text>
          </View>
        )}

        {/* Overlay con controles */}
        <View style={styles.overlay}>
          {/* Header con botón cerrar */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Indicadores de esquina para área de captura */}
          <View style={styles.captureArea}>
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
          </View>

          {/* Footer con controles */}
          <View style={styles.footer}>
            <Text style={styles.instructionText}>
              Posiciona el objeto dentro del marco
            </Text>
            
            {/* Botón de captura */}
            <TouchableOpacity
              style={[
                styles.captureButton,
                (isLoading || !cameraReady) && styles.captureButtonDisabled,
              ]}
              onPress={handleTakePhoto}
              disabled={isLoading || !cameraReady}
            >
              <View style={styles.captureButtonInner}>
                {isLoading ? (
                  <Ionicons name="hourglass-outline" size={24} color="#fff" />
                ) : (
                  <Ionicons name="camera" size={24} color="#fff" />
                )}
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 16,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  captureArea: {
    position: 'absolute',
    top: '25%',
    left: '10%',
    right: '10%',
    bottom: '35%',
  },
  corner: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderColor: '#007AFF',
    borderWidth: 3,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderBottomWidth: 0,
    borderRightWidth: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    borderBottomWidth: 0,
    borderLeftWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderTopWidth: 0,
    borderRightWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderTopWidth: 0,
    borderLeftWidth: 0,
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 50,
    paddingHorizontal: 20,
  },
  instructionText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#fff',
  },
  captureButtonDisabled: {
    backgroundColor: '#8e8e93',
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#8e8e93',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 32,
  },
});
