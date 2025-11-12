import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Novedad } from '../../interfaces/novedad.interface';
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

/**
 * Tipo para crear novedad sin ID (se genera automáticamente)
 */
type NovedadInput = Omit<Novedad, 'id'>;

const novedadSlice = createSlice({
  name: 'novedad',
  initialState,
  reducers: {
    limpiarNovedades: (state) => {
      state.novedades = [];
    },
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
    // === ACCIONES DE SELECCIÓN ===
    toggleNovedadSeleccion: (state, action: PayloadAction<string>) => {
      const novedadId = action.payload;
      const index = state.seleccionadas.indexOf(novedadId);
      
      if (index > -1) {
        // Si está seleccionada, la removemos
        state.seleccionadas.splice(index, 1);
      } else {
        // Si no está seleccionada, la agregamos
        state.seleccionadas.push(novedadId);
      }
    },
    seleccionarTodasNovedades: (state) => {
      // Seleccionar todas las novedades actuales
      state.seleccionadas = state.novedades.map(novedad => novedad.id);
    },
    limpiarSeleccionNovedades: (state) => {
      // Limpiar todas las selecciones
      state.seleccionadas = [];
    },
    seleccionarMultiplesNovedades: (state, action: PayloadAction<string[]>) => {
      // Agregar múltiples IDs a la selección
      const idsToAdd = action.payload.filter(id => !state.seleccionadas.includes(id));
      state.seleccionadas.push(...idsToAdd);
    },
  },
  extraReducers() {
  },
});

export const { 
  guardarNovedad, 
  marcarNovedadConError, 
  desmarcarNovedadConError,
  toggleNovedadSeleccion,
  seleccionarTodasNovedades,
  limpiarSeleccionNovedades,
  seleccionarMultiplesNovedades,
  limpiarNovedades
} = novedadSlice.actions;
export default novedadSlice.reducer;