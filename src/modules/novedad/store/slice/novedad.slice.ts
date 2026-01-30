import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Novedad, NovedadEstado, NovedadEstadoSolucion, NovedadFormData } from '../../interfaces/novedad.interface';

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
      const index = state.novedades.findIndex(entidad => entidad.id === novedadId || entidad.id_real === novedadId);
      if (index > -1) {
        state.novedades.splice(index, 1);
      }
    },
    guardarSolucionNovedad: (state, action: PayloadAction<{ id: string; solucion: string }>) => {
      const { id, solucion } = action.payload;
      console.log(id, solucion);
      const novedad = state.novedades.find(entidad => entidad.id === id || entidad.id_real === id);
      console.log(novedad);
      
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
      const novedad = state.novedades.find(entidad => entidad.id === id || entidad.id_real === id);

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
    guardarDatosFormularioEnNovedad: (
      state,
      action: PayloadAction<{
        novedadId: string;
        datosFormulario: NovedadFormData;
      }>,
    ) => {
      const { novedadId, datosFormulario } = action.payload;
      const novedad = state.novedades.find(n => n.id === novedadId);
      if (novedad) {
        // Guardar datos del formulario en la novedad para posibles reintentos
        (novedad as any).datos_formulario_guardados = datosFormulario;
      }
    },
    revertirNovedadOptimista: (
      state,
      action: PayloadAction<{
        novedadId: string;
        datosFormulario: NovedadFormData;
        error: string;
        esErrorRetryable: boolean; // ✅ Ahora recibimos el valor real del error interceptor
      }>,
    ) => {
      const { novedadId, datosFormulario, error, esErrorRetryable } = action.payload;
      const novedad = state.novedades.find(n => n.id === novedadId);

      if (novedad) {
        // Revertir el optimistic update
        novedad.estado = 'error';
        (novedad as any).error_mensaje = error;
        (novedad as any).es_error_retryable = esErrorRetryable;

        // Restaurar datos del formulario para retry SOLO si es retryable
        if (esErrorRetryable) {
          (novedad as any).datos_formulario_guardados = datosFormulario;
        } else {
          // Si no es retryable, limpiar datos guardados
          (novedad as any).datos_formulario_guardados = undefined;
        }
      }
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
  guardarDatosFormularioEnNovedad,
  revertirNovedadOptimista,
} = novedadSlice.actions;
export default novedadSlice.reducer;