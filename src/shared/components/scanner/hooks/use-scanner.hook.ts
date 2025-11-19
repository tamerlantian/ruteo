import { useState, useCallback } from 'react';
import { ScannerState, ScanResult } from '../interfaces/scanner.interface';

/**
 * Hook para manejar la lógica del scanner QR/Barcode
 * react-native-camera-kit maneja los permisos automáticamente
 */
export const useScanner = () => {
  const [state, setState] = useState<ScannerState>({
    isModalVisible: false,
    isLoading: false,
    error: null,
    hasPermission: true, // react-native-camera-kit maneja permisos automáticamente
  });

  /**
   * Abre el modal del scanner
   */
  const openScanner = useCallback(() => {
    setState(prev => ({ ...prev, isModalVisible: true, error: null }));
  }, []);

  /**
   * Cierra el modal del scanner
   */
  const closeScanner = useCallback(() => {
    setState(prev => ({ ...prev, isModalVisible: false, error: null }));
  }, []);

  /**
   * Maneja el resultado del escaneo
   */
  const handleScanResult = useCallback((result: ScanResult, onScanResult?: (result: ScanResult) => void) => {
    console.log('Scan result:', result);
    
    // Cerrar el modal
    closeScanner();
    
    // Llamar al callback si existe
    if (onScanResult) {
      onScanResult(result);
    }
  }, [closeScanner]);

  /**
   * Limpia errores
   */
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    // Estado
    isModalVisible: state.isModalVisible,
    isLoading: state.isLoading,
    error: state.error,
    hasPermission: state.hasPermission,
    
    // Acciones
    openScanner,
    closeScanner,
    handleScanResult,
    clearError,
  };
};
