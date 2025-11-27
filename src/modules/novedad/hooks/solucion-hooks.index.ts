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
} from '../interfaces/solucion.interface';
export type { UseSolucionCreationConfig } from '../interfaces/solucion.interface';
