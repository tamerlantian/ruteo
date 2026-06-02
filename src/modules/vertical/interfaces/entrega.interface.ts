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
  /** Nombre comercial de la empresa transportadora de la orden (back v1.6.4+).
   *  Opcional/nullable: snapshots viejos o respuestas sin empresa caen al
   *  prettify del schema_name. */
  empresa_nombre?: string | null;
}
