import { SeleccionarResponse } from '../../../core/interfaces/api.interface';
import { PhotoData } from '../../visita/interfaces/visita.interface';

export interface Novedad {
  id: string;
  visita_id: number;
  novedad_tipo_id: number;
  fecha: string;
  descripcion: string;
  solucion?: string;
  imagenes: { uri: string }[];
  // campos para tracking local
  id_real?: string;
  estado: NovedadEstado;
  estado_solucion: NovedadEstadoSolucion;
}

export interface NovedadCreada {
  id: number;
}

export type NovedadEstado = 'sync' | 'pending' | 'error';
export type NovedadEstadoSolucion = 'sync' | 'pending' | 'error';

export interface NovedadTipo extends SeleccionarResponse {}
export interface NovedadFormData {
  id: string;
  visitaId: number;
  tipo: string;
  descripcion: string;
  foto: PhotoData[];
}
