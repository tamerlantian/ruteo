import { useState, useCallback, useEffect } from 'react';
import { useCameraPermission } from 'react-native-vision-camera';
import { ScannerState, ScanResult } from '../interfaces/scanner.interface';

/**
 * Hook para manejar la lógica del scanner QR/Barcode con react-native-vision-camera
 * Incluye manejo avanzado de permisos y estados de carga
 */
export const useScannerVision = () => {
  const { hasPermission, requestPermission } = useCameraPermission();
  
  const [state, setState] = useState<ScannerState>({
    isModalVisible: false,
    isLoading: false,
    error: null,
    hasPermission: hasPermission,
  });

  // Actualizar estado de permisos cuando cambie
  useEffect(() => {
    setState(prev => ({ ...prev, hasPermission }));
  }, [hasPermission]);

  /**
   * Abre el modal del scanner, solicitando permisos si es necesario
   */
  const openScanner = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      // Si no tenemos permisos, solicitarlos
      if (!hasPermission) {
        console.log('Solicitando permisos de cámara...');
        const permissionResult = await requestPermission();
        
        if (!permissionResult) {
          setState(prev => ({ 
            ...prev, 
            isLoading: false, 
            error: 'Permisos de cámara denegados' 
          }));
          return;
        }
      }

      // Abrir modal
      setState(prev => ({ 
        ...prev, 
        isModalVisible: true, 
        isLoading: false,
        hasPermission: true 
      }));
      
    } catch (error) {
      console.error('Error al abrir scanner:', error);
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: 'Error al inicializar la cámara' 
      }));
    }
  }, [hasPermission, requestPermission]);

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
    console.log('Vision Camera scan result:', result);
    
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
