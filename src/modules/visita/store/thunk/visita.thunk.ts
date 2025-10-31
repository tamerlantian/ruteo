import { createAsyncThunk } from '@reduxjs/toolkit';
import { visitaRepository } from '../../repositories/visita.repository';

export const cargarVisitasThunk = createAsyncThunk(
  'visita/cargar-orden',
  async (
    { schemaName, despachoId }: { schemaName: string; despachoId: number },
    { rejectWithValue },
  ) => {
    try {
      const visitas = await visitaRepository.getVisitas(
        schemaName,
        despachoId,
        false,
        false,
      );

      return visitas || [];

      //     if (visitas.length > 0) {
      //       await storageService.setItem(STORAGE_KEYS.subdominio, schema_name);
      //       await storageService.setItem(STORAGE_KEYS.despacho, `${despacho_id}`);
      //       await storageService.setItem(
      //         STORAGE_KEYS.ordenEntrega,
      //         `${payload.codigo}`
      //       );

      //       await iniciarTareaSeguimientoUbicacion();
      //     }

      //     return visitas;
      //   }

      //   return [];
    } catch (error: any) {
        return rejectWithValue(error);
    }
  },
);
