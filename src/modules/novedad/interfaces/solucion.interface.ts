/**
 * Configuration for the useSolucionApi hook
 */
export interface UseSolucionApiConfig {
  showToasts?: boolean;
  logPrefix?: string;
  messagePrefix?: string;
}

/**
 * Data structure for solution submission
 */
export interface SolucionFormData {
  id: string;
  tempId: string;
  solucion: string;
}

/**
 * Result of a single solution processing
 */
export interface SolucionProcessingResult {
  success: boolean;
  novedadId: string;
  novedadTempId?: string;
  solucionData: SolucionFormData;
  error?: string;
  apiError?: any;
}

/**
 * Result of batch solution processing
 */
export interface SolucionBatchProcessingResult {
  successCount: number;
  errorCount: number;
  results: SolucionProcessingResult[];
}

/**
 * Configuration for the useSolucionCreation hook
 */
export interface UseSolucionCreationConfig extends UseSolucionApiConfig {
  clearSelectionsOnSuccess?: boolean;
}
