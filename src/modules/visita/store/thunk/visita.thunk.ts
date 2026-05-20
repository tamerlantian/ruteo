import { createAsyncThunk } from '@reduxjs/toolkit';
import { visitaRepository } from '../../repositories/visita.repository';

/**
 * Pide TODAS las visitas del despacho (entregadas + pendientes + novedad).
 * Antes pedia solo `estado_entregado=False&estado_novedad=False`, lo que
 * provocaba que al reentrar a una orden ya completada el server devolviera
 * lista vacia, el merge limpiaba state.visitas y el snapshot quedaba
 * mintiendo (sin manera local de saber que estaba completada).
 *
 * El filtrado por estado lo hace el detalle visualmente via los tabs
 * (pendientes / entregadas / novedades).
 */
export const cargarVisitasThunk = createAsyncThunk(
  'visita/cargar-orden',
  async (
    { schemaName, despachoId }: { schemaName: string; despachoId: number },
    { rejectWithValue },
  ) => {
    try {
      const visitas = await visitaRepository.getVisitas(schemaName, despachoId);
      return visitas || [];
    } catch (error: any) {
      return rejectWithValue(error);
    }
  },
);
