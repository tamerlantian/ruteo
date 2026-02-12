// Main component (now using Vision Camera)
export { Scanner } from './scanner.component';

// Vision Camera components
export { ScannerVision } from './scanner-vision.component';
export { ScannerModalVision } from './components/scanner-modal-vision.component';

// Individual components
export { ScannerButton } from './components/scanner-button.component';

// Hooks
export { useScannerVision } from './hooks/use-scanner-vision.hook';

// Interfaces and types
export type {
  ScanResult,
  CodeType,
  ScannerProps,
  ScannerButtonProps,
  ScannerModalProps,
  ScannerState,
} from './interfaces/scanner.interface';
