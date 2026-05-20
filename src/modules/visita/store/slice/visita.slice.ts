import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  VisitaResponse,
  EntregaFormData,
  VisitaEstado,
} from '../../interfaces/visita.interface';
import { cargarVisitasThunk } from '../thunk/visita.thunk';

/**
 * Snapshot del estado de una orden cuando se pausa para abrir otra.
 * Preserva visitas (con su orden local, estado de sync y datos de formulario
 * guardados) y la seleccion. Al volver, restauramos esto y el merge de
 * cargarVisitasThunk.fulfilled actualiza solo los campos del server.
 */
interface VisitaSnapshot {
  visitas: VisitaResponse[];
  seleccionadas: number[];
}

interface VisitaState {
  visitas: VisitaResponse[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  seleccionadas: number[];
  isSyncing: boolean;
  /** Snapshots de ordenes pausadas, indexados por despacho_id. */
  snapshotsByDespacho: Record<number, VisitaSnapshot>;
}

const initialState: VisitaState = {
  visitas: [],
  status: 'idle',
  seleccionadas: [],
  isSyncing: false,
  snapshotsByDespacho: {},
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
    /**
     * Guarda el estado actual de visitas como snapshot del despacho indicado.
     * Se llama justo antes de cambiar a otra orden, para que al volver el
     * conductor encuentre su trabajo local (reorden + entregas pendientes de
     * sync + selecciones) tal como lo dejo.
     */
    guardarSnapshotVisitas: (state, action: PayloadAction<number>) => {
      state.snapshotsByDespacho[action.payload] = {
        visitas: state.visitas,
        seleccionadas: state.seleccionadas,
      };
    },
    /**
     * Restaura el snapshot guardado del despacho (o limpia si no hay).
     * El refetch posterior (cargarVisitasThunk.fulfilled) mergeara campos del
     * server sin pisar lo local.
     */
    restaurarSnapshotVisitas: (state, action: PayloadAction<number | null>) => {
      if (action.payload === null) {
        state.visitas = [];
        state.seleccionadas = [];
        return;
      }
      const snap = state.snapshotsByDespacho[action.payload];
      state.visitas = snap?.visitas ?? [];
      state.seleccionadas = snap?.seleccionadas ?? [];
    },
    /** Descarta el snapshot de un despacho (ej. al terminar/anular). */
    descartarSnapshotVisitas: (state, action: PayloadAction<number>) => {
      delete state.snapshotsByDespacho[action.payload];
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
      // Merge server <- local: por cada visita que ya estaba en estado (o
      // recien restaurada desde un snapshot), preservamos los campos que
      // SOLO el cliente gobierna — orden manual, estado de sync, datos de
      // formulario guardados, info de error. Los demas vienen del server.
      // Visitas nuevas (ids que no estaban en local) parten en `pending`.
      const localPorId = new Map<number, VisitaResponse>();
      state.visitas.forEach(v => localPorId.set(v.id, v));

      state.visitas = payload.map(visita => {
        const local = localPorId.get(visita.id);
        if (local) {
          return {
            ...visita,
            orden: local.orden,
            estado: local.estado,
            error_mensaje: local.error_mensaje,
            es_error_retryable: local.es_error_retryable,
            datos_formulario_guardados: local.datos_formulario_guardados,
          };
        }
        return {
          ...visita,
          datos_formulario_guardados: undefined,
          estado: 'pending',
        };
      });
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
  guardarSnapshotVisitas,
  restaurarSnapshotVisitas,
  descartarSnapshotVisitas,
} = visitaSlice.actions;
export default visitaSlice.reducer;
