import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Novedad, NovedadEstado, NovedadEstadoSolucion } from '../../interfaces/novedad.interface';
import { generateTempId } from '../../../../shared/utils/id-generator.util';

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

type NovedadInput = Omit<Novedad, 'id'>;

const novedadSlice = createSlice({
  name: 'novedad',
  initialState,
  reducers: {
    limpiarNovedades: (state) => {
      state.novedades = [];
    },
    guardarNovedad: (state, action: PayloadAction<{ novedad: NovedadInput, novedadId?: string }>) => {
      const novedadConId: Novedad = {
        ...action.payload.novedad,
        id: action.payload.novedadId || generateTempId(),
      };
      state.novedades.push(novedadConId);
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
  cambiarEstadoSolucionNovedad,
  guardarSolucionNovedad,
} = novedadSlice.actions;
export default novedadSlice.reducer;