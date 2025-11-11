import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Novedad } from '../../interfaces/novedad.interface';

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

const novedadSlice = createSlice({
  name: 'novedad',
  initialState,
  reducers: {
    guardarNovedad: (state, action: PayloadAction<Novedad>) => {
      state.novedades.push(action.payload);
    },
  },
  extraReducers() {
  },
});

export const { guardarNovedad } = novedadSlice.actions;
export default novedadSlice.reducer;