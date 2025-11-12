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
      action: PayloadAction<{ visitaId: number; estado: VisitaEstado }>,
    ) => {
      const { visitaId, estado } = action.payload;
      const index = state.visitas.findIndex(visita => visita.id === visitaId);
      if (index > -1) {
        state.visitas[index].estado = estado;
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
      }
    },
  },
  extraReducers(builder) {
    builder.addCase(cargarVisitasThunk.pending, state => {
      state.status = 'loading';
    });
    builder.addCase(cargarVisitasThunk.fulfilled, (state, { payload }) => {
      state.status = 'succeeded';
      // Inicializar propiedades adicionales que no vienen de la API
      state.visitas = payload.map(visita => ({
        ...visita,
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
  marcarVisitaConNovedad,
  cambiarEstadoVisita,
  guardarDatosFormularioEnVisita,
  limpiarDatosFormularioDeVisita,
} = visitaSlice.actions;
export default visitaSlice.reducer;
