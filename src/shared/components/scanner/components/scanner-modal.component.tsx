import React, { useCallback } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import { Camera } from 'react-native-camera-kit';
import Ionicons from '@react-native-vector-icons/ionicons';
import { ScannerModalProps, ScanResult, CodeType } from '../interfaces/scanner.interface';

/**
 * Modal con cámara para escanear códigos QR y códigos de barras
 */
export const ScannerModal: React.FC<ScannerModalProps> = ({
  visible,
  onClose,
  onScanResult,
}) => {
  /**
   * Maneja el resultado del escaneo
   */
  const handleBarCodeRead = useCallback((event: any) => {
    try {
      const { codeStringValue, type } = event.nativeEvent;
      
      if (codeStringValue && codeStringValue.trim()) {
        // Mapear el tipo de código a nuestro formato
        const codeType: CodeType = mapCodeType(type);
        
        const result: ScanResult = {
          value: codeStringValue.trim(),
          type: codeType,
          timestamp: Date.now(),
        };
        
        console.log('Scanner result:', result);
        onScanResult(result);
      }
    } catch (error) {
      console.error('Error processing scan result:', error);
      Alert.alert(
        'Error de Escaneo',
        'Hubo un problema al procesar el código escaneado. Inténtalo de nuevo.',
        [{ text: 'OK' }]
      );
    }
  }, [onScanResult]);

  /**
   * Mapea el tipo de código nativo al tipo de nuestra interfaz
   */
  const mapCodeType = (nativeType: string): CodeType => {
    const typeMap: Record<string, CodeType> = {
      'QR_CODE': 'qr',
      'EAN_13': 'ean13',
      'EAN_8': 'ean8',
      'CODE_128': 'code128',
      'CODE_39': 'code39',
      'CODE_93': 'code93',
      'CODABAR': 'codabar',
      'ITF': 'itf',
      'UPC_A': 'upca',
      'UPC_E': 'upce',
      'PDF_417': 'pdf417',
      'DATA_MATRIX': 'datamatrix',
      'AZTEC': 'aztec',
    };
    
    return typeMap[nativeType] || 'qr';
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="close" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Escanear Código</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Camera */}
        <View style={styles.cameraContainer}>
          <Camera
            style={styles.camera}
            scanBarcode={true}
            onReadCode={handleBarCodeRead}
            showFrame={true}
            laserColor="#007aff"
            frameColor="#fff"
          />
          
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
