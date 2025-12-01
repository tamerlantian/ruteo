import { useState, useCallback, useEffect } from 'react';
import { ScannerState, ScanResult } from '../interfaces/scanner.interface';
import { useCameraPermissionsService } from '../../../services/camera-permissions.service';

/**
 * Hook para manejar la lógica del scanner QR/Barcode con react-native-vision-camera
 * Incluye manejo avanzado de permisos y estados de carga
 */
export const useScannerVision = () => {
  const { hasPermission, checkAndRequest } = useCameraPermissionsService();
  
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
   * Ahora usa el servicio mejorado que maneja permisos denegados permanentemente
   */
  const openScanner = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      // Usar el servicio mejorado de permisos
      const permissionGranted = await checkAndRequest();
      
      if (!permissionGranted) {
        setState(prev => ({ 
          ...prev, 
          isLoading: false, 
          error: null // No mostrar error aquí, el servicio ya mostró el alert apropiado
        }));
        return;
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
  }, [checkAndRequest]);

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
