import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Novedad } from '../../interfaces/novedad.interface';
import { generateTempId } from '../../../../shared/utils/id-generator.util';

interface NovedadState {
  novedades: Novedad[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  seleccionadas: number[];
}

const initialState: NovedadState = {
  novedades: [],
  status: 'idle',
  seleccionadas: [],
};

/**
 * Tipo para crear novedad sin ID (se genera automáticamente)
 */
type NovedadInput = Omit<Novedad, 'id'>;

const novedadSlice = createSlice({
  name: 'novedad',
  initialState,
  reducers: {
    guardarNovedad: (state, action: PayloadAction<NovedadInput>) => {
      const novedadConId: Novedad = {
        ...action.payload,
        id: generateTempId('novedad'),
      };
      state.novedades.push(novedadConId);
    },
    marcarNovedadConError: (state, action: PayloadAction<string>) => {
      const novedad = state.novedades.find(n => n.id === action.payload);
      if (novedad) {
        novedad.estado_error = true;
      }
    },
    desmarcarNovedadConError: (state, action: PayloadAction<string>) => {
      const novedad = state.novedades.find(n => n.id === action.payload);
      if (novedad) {
        novedad.estado_error = false;
      }
    },
  },
  extraReducers() {
  },
});

export const { guardarNovedad, marcarNovedadConError, desmarcarNovedadConError } = novedadSlice.actions;
export default novedadSlice.reducer;