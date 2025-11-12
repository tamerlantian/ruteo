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
  estado: NovedadEstado;
  estado_solucion: NovedadEstadoSolucion;
}

export type NovedadEstado = 'sync' | 'pending' | 'error';
export type NovedadEstadoSolucion = 'sync' | 'pending' | 'error';

export interface NovedadTipo extends SeleccionarResponse {}
export interface NovedadFormData {
  tipo: string;
  descripcion: string;
  foto: PhotoData[];
}
