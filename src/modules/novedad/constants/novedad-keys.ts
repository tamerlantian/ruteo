// Claves para las queries de React Query de novedad
export const novedadKeys = {
  all: ['novedad'] as const,
  tipos: (schemaName: string) => [...novedadKeys.all, 'tipos', schemaName] as const,
};
