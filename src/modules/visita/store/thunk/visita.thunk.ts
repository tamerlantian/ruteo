import { createAsyncThunk } from '@reduxjs/toolkit';
import { visitaRepository } from '../../repositories/visita.repository';

export const cargarVisitasThunk = createAsyncThunk(
  'visita/cargar-orden',
  async (
    { schemaName, despachoId }: { schemaName: string; despachoId: number; },
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
    } catch (error: any) {
        return rejectWithValue(error);
    }
  },
);
