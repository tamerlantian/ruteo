// Main component
export { Scanner } from './scanner.component';

// Individual components
export { ScannerButton } from './components/scanner-button.component';
export { ScannerModal } from './components/scanner-modal.component';

// Hook
export { useScanner } from './hooks/use-scanner.hook';

// Interfaces and types
export type {
  ScanResult,
  CodeType,
  ScannerProps,
  ScannerButtonProps,
  ScannerModalProps,
  ScannerState,
} from './interfaces/scanner.interface';
