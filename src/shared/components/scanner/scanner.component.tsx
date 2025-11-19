import React from 'react';
import { ScannerButton } from './components/scanner-button.component';
import { ScannerModal } from './components/scanner-modal.component';
import { useScanner } from './hooks/use-scanner.hook';
import { ScannerProps } from './interfaces/scanner.interface';

/**
 * Componente principal del scanner QR/Barcode
 * Combina el botón y el modal de escaneo
 */
export const Scanner: React.FC<ScannerProps> = ({
  onScanResult,
  disabled = false,
}) => {
  const {
    isModalVisible,
    isLoading,
    openScanner,
    closeScanner,
    handleScanResult,
  } = useScanner();

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
      
      <ScannerModal
        visible={isModalVisible}
        onClose={closeScanner}
        onScanResult={onScanComplete}
      />
    </>
  );
};
