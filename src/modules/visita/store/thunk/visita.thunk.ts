import { createAsyncThunk } from '@reduxjs/toolkit';
import { visitaRepository } from '../../repositories/visita.repository';
import { updateSettingsThunk } from '../../../settings';

export const cargarVisitasThunk = createAsyncThunk(
  'visita/cargar-orden',
  async (
    { schemaName, despachoId, ordenCodigo }: { schemaName: string; despachoId: number; ordenCodigo?: string },
    { rejectWithValue, dispatch },
  ) => {
    try {
      const visitas = await visitaRepository.getVisitas(
        schemaName,
        despachoId,
        false,
        false,
      );

      if (visitas && visitas.length > 0) {
        // Save settings using the new settings slice
        await dispatch(updateSettingsThunk({
          subdominio: schemaName,
          despacho: `${despachoId}`,
          ...(ordenCodigo && { ordenEntrega: ordenCodigo })
        }));

        // TODO: await iniciarTareaSeguimientoUbicacion();
      }

      return visitas || [];
    } catch (error: any) {
        return rejectWithValue(error);
    }
  },
);
