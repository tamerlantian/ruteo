import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  VisitaResponse,
  EntregaFormData,
  VisitaEstado,
} from '../../interfaces/visita.interface';
import { cargarVisitasThunk } from '../thunk/visita.thunk';

interface VisitaState {
  visitas: VisitaResponse[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  seleccionadas: number[];
  isSyncing: boolean;
}

const initialState: VisitaState = {
  visitas: [],
  status: 'idle',
  seleccionadas: [],
  isSyncing: false,
};

const visitaSlice = createSlice({
  name: 'visita',
  initialState,
  reducers: {
    removerVisitas: state => {
      state.visitas = [];
    },
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
    seleccionarTodasVisitas: state => {
      // Seleccionar todas las visitas actuales
      state.seleccionadas = state.visitas.map(visita => visita.id);
    },
    limpiarSeleccionVisitas: state => {
      // Limpiar todas las selecciones
      state.seleccionadas = [];
    },
    seleccionarMultiplesVisitas: (state, action: PayloadAction<number[]>) => {
      // Agregar múltiples IDs a la selección
      const idsToAdd = action.payload.filter(
        (id: number) => !state.seleccionadas.includes(id),
      );
      state.seleccionadas.push(...idsToAdd);
    },
    marcarVisitaComoEntregada: (state, action: PayloadAction<number>) => {
      const visitaId = action.payload;
      const index = state.visitas.findIndex(visita => visita.id === visitaId);
      if (index > -1) {
        state.visitas[index].estado_entregado = true;
        state.visitas[index].estado = 'sync';
      }
    },
    revertirEntregaOptimista: (
      state,
      action: PayloadAction<{
        visitaId: number;
        datosFormulario: EntregaFormData;
        error: string;
        esErrorRetryable: boolean; // ✅ Ahora recibimos el valor real del error interceptor
      }>,
    ) => {
      const { visitaId, datosFormulario, error, esErrorRetryable } = action.payload;
      const visita = state.visitas.find(v => v.id === visitaId);

      if (visita) {
        // Revertir el optimistic update
        visita.estado_entregado = false;
        visita.estado = 'error';
        visita.error_mensaje = error;

        // Restaurar datos del formulario para retry SOLO si es retryable
        if (esErrorRetryable) {
          visita.datos_formulario_guardados = datosFormulario;
        } else {
          // Si no es retryable, limpiar datos guardados
          visita.datos_formulario_guardados = undefined;
        }

        // Usar el valor real del error interceptor
        visita.es_error_retryable = esErrorRetryable;
      }
    },
    marcarVisitaConNovedad: (state, action: PayloadAction<number>) => {
      const visitaId = action.payload;
      const index = state.visitas.findIndex(visita => visita.id === visitaId);
      if (index > -1) {
        state.visitas[index].estado_novedad = true;
      }
    },
    desmarcarVisitaConNovedad: (state, action: PayloadAction<number>) => {
      const visitaId = action.payload;
      const index = state.visitas.findIndex(visita => visita.id === visitaId);
      if (index > -1) {
        state.visitas[index].estado_novedad = false;
      }
    },
    cambiarEstadoVisita: (
      state,
      action: PayloadAction<{
        visitaId: number;
        estado: VisitaEstado;
        errorMensaje?: string;
        esErrorRetryable?: boolean;
      }>,
    ) => {
      const { visitaId, estado, errorMensaje, esErrorRetryable } = action.payload;
      const index = state.visitas.findIndex(visita => visita.id === visitaId);
      if (index > -1) {
        state.visitas[index].estado = estado;
        if (errorMensaje !== undefined) {
          state.visitas[index].error_mensaje = errorMensaje;
        }
        if (esErrorRetryable !== undefined) {
          state.visitas[index].es_error_retryable = esErrorRetryable;
        }
      }
    },
    guardarDatosFormularioEnVisita: (
      state,
      action: PayloadAction<{
        visitaId: number;
        datosFormulario: EntregaFormData;
      }>,
    ) => {
      const { visitaId, datosFormulario } = action.payload;
      const index = state.visitas.findIndex(visita => visita.id === visitaId);
      if (index > -1) {
        state.visitas[index].datos_formulario_guardados = datosFormulario;
        console.log(
          `💾 Datos de formulario guardados para visita ${visitaId}:`,
          datosFormulario,
        );
      } else {
        console.error(
          `❌ No se pudo guardar datos para visita ${visitaId} - visita no encontrada`,
        );
      }
    },
    limpiarDatosFormularioDeVisita: (state, action: PayloadAction<number>) => {
      const visitaId = action.payload;
      const index = state.visitas.findIndex(visita => visita.id === visitaId);
      if (index > -1) {
        state.visitas[index].datos_formulario_guardados = undefined;
        state.visitas[index].estado = 'sync';
        state.visitas[index].error_mensaje = undefined;
      }
    },
    setSyncing: (state, action: PayloadAction<boolean>) => {
      state.isSyncing = action.payload;
    },
    /**
     * Reordena una visita LOCALMENTE (sin tocar el server).
     * El orden manual del conductor sobrevive a cargarVisitas (ver el
     * extraReducer .fulfilled que preserva orden por id). Visitas ya
     * entregadas o con novedad se ignoran.
     */
    moverVisitaLocal: (
      state,
      action: PayloadAction<{
        visitaId: number;
        posicion: 'primero' | 'ultimo' | 'arriba' | 'abajo';
      }>,
    ) => {
      const { visitaId, posicion } = action.payload;
      const ordenadas = [...state.visitas].sort((a, b) => a.orden - b.orden);
      const idx = ordenadas.findIndex(v => v.id === visitaId);
      if (idx === -1) {
        return;
      }
      const visita = ordenadas[idx];
      if (visita.estado_entregado || visita.estado_novedad) {
        return;
      }

      let nuevas: typeof ordenadas;
      if (posicion === 'primero') {
        if (idx === 0) {
          return;
        }
        nuevas = [visita, ...ordenadas.filter((_, i) => i !== idx)];
      } else if (posicion === 'ultimo') {
        if (idx === ordenadas.length - 1) {
          return;
        }
        nuevas = [...ordenadas.filter((_, i) => i !== idx), visita];
      } else if (posicion === 'arriba') {
        if (idx === 0) {
          return;
        }
        nuevas = [
          ...ordenadas.slice(0, idx - 1),
          ordenadas[idx],
          ordenadas[idx - 1],
          ...ordenadas.slice(idx + 1),
        ];
      } else {
        if (idx === ordenadas.length - 1) {
          return;
        }
        nuevas = [
          ...ordenadas.slice(0, idx),
          ordenadas[idx + 1],
          ordenadas[idx],
          ...ordenadas.slice(idx + 2),
        ];
      }

      // Renumerar 1..N preservando referencias en state.visitas.
      const nuevoOrden = new Map<number, number>();
      nuevas.forEach((v, i) => nuevoOrden.set(v.id, i + 1));
      state.visitas.forEach(v => {
        const nuevo = nuevoOrden.get(v.id);
        if (nuevo !== undefined && v.orden !== nuevo) {
          v.orden = nuevo;
        }
      });
    },
    anularVisitasNoRetryables: (state, action: PayloadAction<number[]>) => {
      const visitaIds = action.payload;
      visitaIds.forEach(visitaId => {
        const index = state.visitas.findIndex(visita => visita.id === visitaId);
        if (index > -1) {
          const visita = state.visitas[index];
          // Solo anular si es un error no-retryable
          if (visita.estado === 'error' && visita.es_error_retryable === false) {
            // Resetear la visita a estado pending
            state.visitas[index].estado = 'pending';
            state.visitas[index].error_mensaje = undefined;
            state.visitas[index].es_error_retryable = undefined;
            state.visitas[index].datos_formulario_guardados = undefined;
            state.visitas[index].estado_entregado = false;
            state.visitas[index].estado_novedad = false;
            console.log(`🔄 Visita ${visitaId} anulada y reseteada a pending`);
          }
        }
      });
      // Limpiar selección después de anular
      state.seleccionadas = [];
    },
  },
  extraReducers(builder) {
    builder.addCase(cargarVisitasThunk.pending, state => {
      state.status = 'loading';
    });
    builder.addCase(cargarVisitasThunk.fulfilled, (state, { payload }) => {
      state.status = 'succeeded';
      // Preserva el orden local del conductor (modificado via moverVisitaLocal)
      // a traves de las recargas: si la visita ya estaba en estado, mantengo
      // su `orden` aunque el server haya devuelto otro. Visitas nuevas usan
      // el orden del server.
      const ordenLocal = new Map<number, number>();
      state.visitas.forEach(v => ordenLocal.set(v.id, v.orden));

      state.visitas = payload.map(visita => ({
        ...visita,
        orden: ordenLocal.has(visita.id)
          ? (ordenLocal.get(visita.id) as number)
          : visita.orden,
        datos_formulario_guardados: undefined,
        estado: 'pending',
      }));
    });
    builder.addCase(cargarVisitasThunk.rejected, state => {
      state.status = 'failed';
    });
  },
});

export const {
  removerVisitas,
  desmarcarVisitaConNovedad,
  toggleVisitaSeleccion,
  seleccionarTodasVisitas,
  limpiarSeleccionVisitas,
  seleccionarMultiplesVisitas,
  marcarVisitaComoEntregada,
  revertirEntregaOptimista,
  marcarVisitaConNovedad,
  cambiarEstadoVisita,
  guardarDatosFormularioEnVisita,
  limpiarDatosFormularioDeVisita,
  anularVisitasNoRetryables,
  setSyncing,
  moverVisitaLocal,
} = visitaSlice.actions;
export default visitaSlice.reducer;
