import React, { useCallback, useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Alert,
  AppState,
} from 'react-native';
import { Camera, useCameraDevice, useCodeScanner } from 'react-native-vision-camera';
import Ionicons from '@react-native-vector-icons/ionicons';
import { ScannerModalProps, ScanResult, CodeType } from '../interfaces/scanner.interface';

/**
 * Modal con cámara para escanear códigos QR y códigos de barras usando react-native-vision-camera
 */
export const ScannerModalVision: React.FC<ScannerModalProps> = ({
  visible,
  onClose,
  onScanResult,
}) => {
  const [cameraReady, setCameraReady] = useState(false);
  const [isScanning, setIsScanning] = useState(true);
  
  const device = useCameraDevice('back');

  // Configurar el scanner de códigos
  const codeScanner = useCodeScanner({
    codeTypes: [
      'qr',
      'ean-13',
      'ean-8', 
      'code-128',
      'code-39',
      'code-93',
      'codabar',
      'itf',
      'upc-a',
      'upc-e',
      'pdf-417',
      'data-matrix',
      'aztec'
    ],
    onCodeScanned: (codes) => {
      if (!isScanning || codes.length === 0) return;
      
      const code = codes[0];
      if (code?.value) {
        handleBarCodeRead(code);
      }
    }
  });

  // Reinicializar cámara cuando el modal se abre
  useEffect(() => {
    if (visible) {
      setCameraReady(false);
      setIsScanning(true);
      
      // Delay para permitir que el modal se abra completamente
      const timer = setTimeout(() => {
        setCameraReady(true);
      }, 300);
      
      return () => clearTimeout(timer);
    } else {
      setCameraReady(false);
      setIsScanning(true);
    }
  }, [visible]);

  // Listener para detectar cuando la app vuelve del background (después de conceder permisos)
  useEffect(() => {
    if (!visible) return;

    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'active') {
        // La app volvió al foreground, reinicializar cámara
        setCameraReady(false);
        setTimeout(() => {
          setCameraReady(true);
          setIsScanning(true);
        }, 300);
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    
    return () => {
      subscription?.remove();
    };
  }, [visible]);

  /**
   * Maneja el resultado del escaneo
   */
  const handleBarCodeRead = useCallback((code: any) => {
    if (!isScanning) return;
    
    try {
      setIsScanning(false); // Prevenir múltiples escaneos
      
      const { value, type } = code;
      
      if (value && value.trim()) {
        // Mapear el tipo de código a nuestro formato
        const codeType: CodeType = mapCodeType(type);
        
        const result: ScanResult = {
          value: value.trim(),
          type: codeType,
          timestamp: Date.now(),
        };
        
        console.log('Vision Camera scan result:', result);
        onScanResult(result);
      }
    } catch (error) {
      console.error('Error processing scan result:', error);
      Alert.alert(
        'Error de Escaneo',
        'Hubo un problema al procesar el código escaneado. Inténtalo de nuevo.',
        [{ 
          text: 'OK',
          onPress: () => setIsScanning(true) // Reactivar escaneo
        }]
      );
    }
  }, [isScanning, onScanResult]);

  /**
   * Mapea el tipo de código nativo al tipo de nuestra interfaz
   */
  const mapCodeType = (nativeType: string): CodeType => {
    const typeMap: Record<string, CodeType> = {
      'qr': 'qr',
      'ean-13': 'ean13',
      'ean-8': 'ean8',
      'code-128': 'code128',
      'code-39': 'code39',
      'code-93': 'code93',
      'codabar': 'codabar',
      'itf': 'itf',
      'upc-a': 'upca',
      'upc-e': 'upce',
      'pdf-417': 'pdf417',
      'data-matrix': 'datamatrix',
      'aztec': 'aztec',
    };
    
    return typeMap[nativeType] || 'qr';
  };

  /**
   * Maneja el cierre del modal
   */
  const handleClose = useCallback(() => {
    setIsScanning(false);
    setCameraReady(false);
    onClose();
  }, [onClose]);

  // Verificar si tenemos dispositivo de cámara
  if (!device) {
    return (
      <Modal
        visible={visible}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={handleClose}
      >
        <SafeAreaView style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Escanear Código</Text>
            <View style={styles.headerSpacer} />
          </View>
          
          <View style={styles.errorContainer}>
            <Ionicons name="camera-outline" size={64} color="#8e8e93" />
            <Text style={styles.errorText}>
              No se pudo acceder a la cámara
            </Text>
            <Text style={styles.errorSubtext}>
              Verifica que tu dispositivo tenga cámara disponible
            </Text>
          </View>
        </SafeAreaView>
      </Modal>
    );
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={handleClose}
    >
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleClose}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="close" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Escanear Código</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Camera */}
        <View style={styles.cameraContainer}>
          {cameraReady ? (
            <Camera
              style={styles.camera}
              device={device}
              isActive={visible && cameraReady}
              codeScanner={codeScanner}
            />
          ) : (
            <View style={styles.loadingContainer}>
              {/* <Text style={styles.loadingText}>Iniciando cámara...</Text> */}
            </View>
          )}
          
          {/* Overlay */}
          <View style={styles.overlay}>
            {/* Top overlay */}
            <View style={styles.overlayTop} />
            
            {/* Middle section with scan area */}
            <View style={styles.overlayMiddle}>
              <View style={styles.overlaySide} />
              <View style={styles.scanArea}>
                {/* Corner indicators */}
                <View style={[styles.corner, styles.cornerTopLeft]} />
                <View style={[styles.corner, styles.cornerTopRight]} />
                <View style={[styles.corner, styles.cornerBottomLeft]} />
                <View style={[styles.corner, styles.cornerBottomRight]} />
              </View>
              <View style={styles.overlaySide} />
            </View>
            
            {/* Bottom overlay */}
            <View style={styles.overlayBottom} />
          </View>
        </View>

        {/* Instructions */}
        <View style={styles.instructions}>
          <Text style={styles.instructionsText}>
            Apunta la cámara hacia el código QR o código de barras
          </Text>
          <Text style={styles.instructionsSubtext}>
            El escaneo se realizará automáticamente
          </Text>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  headerSpacer: {
    width: 40,
  },
  cameraContainer: {
    flex: 1,
    position: 'relative',
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 14,
    color: '#8e8e93',
    textAlign: 'center',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  overlayTop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  overlayMiddle: {
    flexDirection: 'row',
    height: 250,
  },
  overlaySide: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  scanArea: {
    width: 250,
    height: 250,
    position: 'relative',
  },
  overlayBottom: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  corner: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderColor: '#007aff',
    borderWidth: 3,
  },
  cornerTopLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  cornerTopRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  cornerBottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  cornerBottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  instructions: {
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    alignItems: 'center',
  },
  instructionsText: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  instructionsSubtext: {
    fontSize: 14,
    color: '#8e8e93',
    textAlign: 'center',
  },
});
