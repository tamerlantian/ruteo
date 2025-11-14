import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Novedad, NovedadEstado, NovedadEstadoSolucion } from '../../interfaces/novedad.interface';

interface NovedadState {
  novedades: Novedad[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  seleccionadas: string[];
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
    limpiarNovedades: (state) => {
      state.novedades = [];
    },
    guardarNovedad: (state, action: PayloadAction<{ novedad: Novedad }>) => {
      state.novedades.push(action.payload.novedad);
    },
    limpiarNovedad: (state, action: PayloadAction<string>) => {
      const novedadId = action.payload;
      const index = state.novedades.findIndex(entidad => entidad.id === novedadId);
      if (index > -1) {
        state.novedades.splice(index, 1);
      }
    },
    guardarSolucionNovedad: (state, action: PayloadAction<{ id: string; solucion: string }>) => {
      const { id, solucion } = action.payload;
      const novedad = state.novedades.find(entidad => entidad.id === id);

      if (novedad) {
        novedad.solucion = solucion;
      }
    },
    cambiarEstadoNovedad: (state, action: PayloadAction<{ id: string; estado: NovedadEstado }>) => {
      const { id, estado } = action.payload;
      const novedad = state.novedades.find(entidad => entidad.id === id);

      if (novedad) {
        novedad.estado = estado;
      }
    },
    actualizarIdNovedad: (state, action: PayloadAction<{ id: string; nuevoId: string }>) => {
      const { id, nuevoId } = action.payload;
      const novedad = state.novedades.find(entidad => entidad.id === id);

      if (novedad) {
        novedad.id_real = nuevoId;
      }
    },
    cambiarEstadoSolucionNovedad: (state, action: PayloadAction<{ id: string; estado: NovedadEstadoSolucion }>) => {
      const { id, estado } = action.payload;
      const novedad = state.novedades.find(entidad => entidad.id === id);

      if (novedad) {
        novedad.estado_solucion = estado;
      }
    },
    toggleNovedadSeleccion: (state, action: PayloadAction<string>) => {
      const novedadId = action.payload;
      const index = state.seleccionadas.indexOf(novedadId);
      
      if (index > -1) {
        state.seleccionadas.splice(index, 1);
      } else {
        state.seleccionadas.push(novedadId);
      }
    },
    seleccionarTodasNovedades: (state) => {
      state.seleccionadas = state.novedades.map(novedad => novedad.id);
    },
    limpiarSeleccionNovedades: (state) => {
      state.seleccionadas = [];
    },
    seleccionarMultiplesNovedades: (state, action: PayloadAction<string[]>) => {
      const idsToAdd = action.payload.filter(id => !state.seleccionadas.includes(id));
      state.seleccionadas.push(...idsToAdd);
    },
  },
  extraReducers() {
  },
});

export const { 
  guardarNovedad, 
  toggleNovedadSeleccion,
  seleccionarTodasNovedades,
  limpiarSeleccionNovedades,
  seleccionarMultiplesNovedades,
  limpiarNovedades,
  limpiarNovedad,
  cambiarEstadoNovedad,
  actualizarIdNovedad,
  cambiarEstadoSolucionNovedad,
  guardarSolucionNovedad,
} = novedadSlice.actions;
export default novedadSlice.reducer;