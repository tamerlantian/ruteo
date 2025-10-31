export interface Entrega {
  id: number;
  fecha: string;
  peso: number;
  volumen: number;
  tiempo_servicio: number;
  tiempo_trayecto: number;
  tiempo: number;
  visitas: number;
  visitas_entregadas: number;
  despacho_id: number;
  contenedor_id: number;
  schema_name: string;
  usuario_id: any;
}
