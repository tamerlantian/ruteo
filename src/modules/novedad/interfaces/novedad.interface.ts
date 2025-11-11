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
  estado_error: boolean;
  estado_sincronizado?: boolean;
  estado_solucion_error?: boolean;
  estado_solucion_sincronizado?: boolean;

  // no se usan
  estado_entregado?: boolean;
  estado_sincronizado_codigo?: number;
  estado_sincronizada_error?: boolean;
  estado_sincronizada_error_mensaje?: string;
}

export interface NovedadTipo extends SeleccionarResponse {}


export interface NovedadFormData {
  tipo: string;
  descripcion: string;
  foto: PhotoData[];
}
