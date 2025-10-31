import { createSlice } from '@reduxjs/toolkit';
import { VisitaResponse } from '../../interfaces/visita.interface';
import { cargarVisitasThunk } from '../thunk/visita.thunk';

interface VisitaState {
  visitas: VisitaResponse[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  seleccionadas: number[];
}

const initialState: VisitaState = {
  visitas: [],
  status: 'idle',
  seleccionadas: [],
};

const visitaSlice = createSlice({
  name: 'visita',
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder.addCase(cargarVisitasThunk.pending, state => {
      state.status = 'loading';
    });
    builder.addCase(cargarVisitasThunk.fulfilled, (state, { payload }) => {
      state.status = 'succeeded';
      state.visitas = payload;
    });
    builder.addCase(cargarVisitasThunk.rejected, state => {
      state.status = 'failed';
    });
  },
});

export const {} = visitaSlice.actions;
export default visitaSlice.reducer;
