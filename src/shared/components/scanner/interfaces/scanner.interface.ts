/**
 * Tipos de códigos soportados por el scanner
 */
export type CodeType = 
  | 'qr'
  | 'ean13'
  | 'ean8'
  | 'code128'
  | 'code39'
  | 'code93'
  | 'codabar'
  | 'itf'
  | 'upca'
  | 'upce'
  | 'pdf417'
  | 'datamatrix'
  | 'aztec';

/**
 * Resultado del escaneo
 */
export interface ScanResult {
  value: string;
  type: CodeType;
  timestamp: number;
}

/**
 * Props para el componente ScannerButton
 */
export interface ScannerButtonProps {
  onPress: () => void;
  disabled?: boolean;
}

/**
 * Props para el componente ScannerModal
 */
export interface ScannerModalProps {
  visible: boolean;
  onClose: () => void;
  onScanResult: (result: ScanResult) => void;
}

/**
 * Props para el componente principal Scanner
 */
export interface ScannerProps {
  onScanResult: (result: ScanResult) => void;
  disabled?: boolean;
}

/**
 * Estado del hook useScanner
 */
export interface ScannerState {
  isModalVisible: boolean;
  isLoading: boolean;
  error: string | null;
  hasPermission: boolean | null;
}
