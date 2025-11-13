// Solution hooks with separated responsibilities
export { useSolucionApi } from './use-solucion-api.hook';
export { useSolucionCreation } from './use-solucion-creation.hook';
export { useRetrySoluciones } from './use-retry-soluciones.hook';

// Re-export types
export type { 
  UseSolucionApiConfig,
  SolucionFormData,
  SolucionProcessingResult,
  SolucionBatchProcessingResult
} from './use-solucion-api.hook';
export type { UseSolucionCreationConfig } from './use-solucion-creation.hook';
