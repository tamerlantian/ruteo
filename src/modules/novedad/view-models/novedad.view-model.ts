import { useQuery } from '@tanstack/react-query';
import { novedadKeys } from '../constants/novedad-keys';
import { novedadRepository } from '../repositories/novedad.repository';

/**
 * Hook para obtener los tipos de novedad
 * @param schemaName Nombre del schema
 * @param enabled Si la query debe ejecutarse
 * @returns Query con los tipos de novedad
 */
export const useNovedadTipos = (schemaName: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: novedadKeys.tipos(schemaName),
    queryFn: () => novedadRepository.getNovedadTipo(schemaName),
    enabled: enabled && !!schemaName, // Solo ejecutar si está habilitado y hay schemaName
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos (antes cacheTime)
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};
