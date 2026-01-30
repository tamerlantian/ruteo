import { SeleccionarResponse } from '../../../core/interfaces/api.interface';
import { PhotoData } from '../../visita/interfaces/visita.interface';

export interface Novedad {
  id: string;
  visita_id: number;
  novedad_tipo_id: number;
  fecha: string;
  descripcion: string | null;
  solucion?: string;
  imagenes: { uri: string }[];
  // campos para tracking local
  id_real?: string;
  estado: NovedadEstado;
  estado_solucion: NovedadEstadoSolucion;
  movil_token: string;
  // Datos del formulario guardados para reintento
  datos_formulario_guardados?: NovedadFormData;
  // Mensaje de error cuando estado === 'error'
  error_mensaje?: string;
  // Clasificación de error: true si es retryable, false si no lo es
  es_error_retryable?: boolean;
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
  descripcion: string | null;
  foto: PhotoData[];
  movil_token: string;
}
