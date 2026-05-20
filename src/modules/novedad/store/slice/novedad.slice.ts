import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Novedad, NovedadEstado, NovedadEstadoSolucion, NovedadFormData } from '../../interfaces/novedad.interface';
import { Entrega } from '../../../vertical/interfaces/entrega.interface';

interface NovedadSnapshot {
  novedades: Novedad[];
  seleccionadas: string[];
  /** Metadata de la entrega para el surfacing en la lista (ver visita.slice). */
  entrega?: Entrega;
}

interface NovedadState {
  novedades: Novedad[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  seleccionadas: string[];
  /** Snapshots por despacho_id, para pausar/restaurar al cambiar de orden. */
  snapshotsByDespacho: Record<number, NovedadSnapshot>;
}

const initialState: NovedadState = {
  novedades: [],
  status: 'idle',
  seleccionadas: [],
  snapshotsByDespacho: {},
};

const novedadSlice = createSlice({
  name: 'novedad',
  initialState,
  reducers: {
    limpiarNovedades: (state) => {
      state.novedades = [];
    },
    /** Guarda novedades + seleccionadas como snapshot del despacho actual. */
    guardarSnapshotNovedades: (
      state,
      action: PayloadAction<{ entregaId: number; entrega?: Entrega }>,
    ) => {
      if (!state.snapshotsByDespacho) {
        state.snapshotsByDespacho = {};
      }
      const { entregaId, entrega } = action.payload;
      state.snapshotsByDespacho[entregaId] = {
        novedades: state.novedades,
        seleccionadas: state.seleccionadas,
        entrega: entrega ?? state.snapshotsByDespacho[entregaId]?.entrega,
      };
    },
    /** Crea snapshot VACIO con solo la metadata. Ver visita.slice. */
    agregarOrdenALaListaNovedad: (
      state,
      action: PayloadAction<{ entregaId: number; entrega: Entrega }>,
    ) => {
      if (!state.snapshotsByDespacho) {
        state.snapshotsByDespacho = {};
      }
      const { entregaId, entrega } = action.payload;
      const existente = state.snapshotsByDespacho[entregaId];
      state.snapshotsByDespacho[entregaId] = existente
        ? { ...existente, entrega }
        : { novedades: [], seleccionadas: [], entrega };
    },
    /** Restaura el snapshot del despacho (o limpia si no hay). */
    restaurarSnapshotNovedades: (state, action: PayloadAction<number | null>) => {
      if (action.payload === null) {
        state.novedades = [];
        state.seleccionadas = [];
        return;
      }
      const snap = state.snapshotsByDespacho?.[action.payload];
      state.novedades = snap?.novedades ?? [];
      state.seleccionadas = snap?.seleccionadas ?? [];
    },
    /** Descarta el snapshot (ej. al terminar/anular esa orden). */
    descartarSnapshotNovedades: (state, action: PayloadAction<number>) => {
      if (!state.snapshotsByDespacho) {
        return;
      }
      delete state.snapshotsByDespacho[action.payload];
    },
    /** Mantiene solo snapshots de las ordenes vigentes (ver visita.slice). */
    descartarSnapshotsNovedadesExcepto: (
      state,
      action: PayloadAction<number[]>,
    ) => {
      if (!state.snapshotsByDespacho) {
        state.snapshotsByDespacho = {};
        return;
      }
      const idsAMantener = new Set(action.payload);
      for (const idStr of Object.keys(state.snapshotsByDespacho)) {
        const id = Number(idStr);
        if (!idsAMantener.has(id)) {
          delete state.snapshotsByDespacho[id];
        }
      }
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
  guardarSnapshotNovedades,
  restaurarSnapshotNovedades,
  descartarSnapshotNovedades,
  descartarSnapshotsNovedadesExcepto,
  agregarOrdenALaListaNovedad,
} = novedadSlice.actions;
export default novedadSlice.reducer;