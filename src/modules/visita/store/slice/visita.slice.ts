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
  reducers: {
    toggleVisitaSeleccion: (state, action) => {
      const visitaId = action.payload;
      const index = state.seleccionadas.indexOf(visitaId);
      
      if (index > -1) {
        // Si está seleccionada, la removemos
        state.seleccionadas.splice(index, 1);
      } else {
        // Si no está seleccionada, la agregamos
        state.seleccionadas.push(visitaId);
      }
    },
    seleccionarTodasVisitas: (state) => {
      // Seleccionar todas las visitas actuales
      state.seleccionadas = state.visitas.map(visita => visita.id);
    },
    limpiarSeleccionVisitas: (state) => {
      // Limpiar todas las selecciones
      state.seleccionadas = [];
    },
    seleccionarMultiplesVisitas: (state, action) => {
      // Agregar múltiples IDs a la selección
      const idsToAdd = action.payload.filter((id: number) => !state.seleccionadas.includes(id));
      state.seleccionadas.push(...idsToAdd);
    },
  },
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

export const { 
  toggleVisitaSeleccion, 
  seleccionarTodasVisitas, 
  limpiarSeleccionVisitas, 
  seleccionarMultiplesVisitas 
} = visitaSlice.actions;
export default visitaSlice.reducer;
