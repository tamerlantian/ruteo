export interface Novedad {
  id: string;
  visita_id: number;
  novedad_tipo_id: number;
  fecha: string;
  descripcion: string;
  imagenes: { uri: string }[];
  estado_sincronizado: boolean;
  estado_entregado: boolean;
  estado_sincronizado_codigo: number;
  estado_sincronizada_error: boolean;
  estado_sincronizada_error_mensaje: string;
}
