// New architecture with separated responsibilities
export { useNovedadApi } from './use-novedad-api.hook';
export { useNovedadCreation } from './use-novedad-creation.hook';
export { useRetryNovedades } from './use-retry-novedades.hook';

// Legacy hook (deprecated - use specific hooks above)

// Re-export types
export type { UseNovedadApiConfig } from './use-novedad-api.hook';
export type { UseNovedadCreationConfig } from './use-novedad-creation.hook';
