import React from 'react';
import { ScannerButton } from './components/scanner-button.component';
import { ScannerModalVision } from './components/scanner-modal-vision.component';
import { useScannerVision } from './hooks/use-scanner-vision.hook';
import { ScannerProps } from './interfaces/scanner.interface';

/**
 * Componente principal del scanner QR/Barcode usando react-native-vision-camera
 * Combina el botón y el modal de escaneo con Vision Camera
 */
export const ScannerVision: React.FC<ScannerProps> = ({
  onScanResult,
  disabled = false,
}) => {
  const {
    isModalVisible,
    isLoading,
    openScanner,
    closeScanner,
    handleScanResult,
  } = useScannerVision();

  /**
   * Maneja el resultado del escaneo y lo pasa al callback
   */
  const onScanComplete = (result: any) => {
    handleScanResult(result, onScanResult);
  };

  return (
    <>
      <ScannerButton
        onPress={openScanner}
        disabled={disabled || isLoading}
      />
      
      <ScannerModalVision
        visible={isModalVisible}
        onClose={closeScanner}
        onScanResult={onScanComplete}
      />
    </>
  );
};
