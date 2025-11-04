// TODO: visitaresponse is the plane response from the api
// visita is our client-side object for managing the data
export interface VisitaResponse {
  id: number;
  numero: number;
  fecha: string;
  documento: string;
  remitente: any;
  destinatario: string;
  destinatario_direccion: string;
  destinatario_direccion_formato: string;
  destinatario_telefono: string;
  destinatario_correo: any;
  unidades: number;
  peso: number;
  volumen: number;
  cobro: number;
  tiempo: number;
  tiempo_servicio: number;
  tiempo_trayecto: number;
  latitud: number;
  longitud: number;
  orden: number;
  distancia: number;
  despacho_id: number;
  franja_id: any;
  franja_codigo: any;
  estado_novedad: boolean;
  estado_devolucion: boolean;
  estado_entregado: boolean;
  estado_despacho: boolean;
}

export interface Visita {
  id: number;
  guia: any;
  numero: number;
  fecha: string;
  documento: string;
  destinatario: string;
  destinatario_direccion: string;
  destinatario_direccion_formato: string;
  ciudad?: number;
  ciudad__nombre: string;
  destinatario_telefono: string;
  destinatario_correo: any;
  peso: number;
  cobro: number;
  volumen: number;
  tiempo: number;
  tiempo_servicio: number;
  tiempo_trayecto: number;
  estado_decodificado: boolean;
  estado_decodificado_alerta: boolean;
  estado_despacho: boolean;
  estado_entregado: boolean;
  estado_sincronizado: boolean;
  estado_novedad: boolean;
  estado_novedad_solucion: boolean;
  entregada_sincronizada_error?: boolean;
  entregada_sincronizada_error_mensaje?: string;
  entregada_sincronizada_codigo: number;
  novedad_sincronizada_error?: boolean;
  novedad_sincronizada_error_mensaje?: string;
  estado_error: boolean;
  mensaje_error: string;
  novedad_tipo: string;
  novedad_id: number;
  novedad_descripcion: string;
  solucion_novedad: string;
  fecha_entrega: string;
  latitud: number;
  longitud: number;
  orden: number;
  distancia: number;
  franja_id: any;
  datosAdicionales: DatosAdicionales;
  franja_codigo: any;
  despacho: number;
  resultados: Resultado[];
  seleccionado: boolean;
  arrImagenes: { uri: string }[];
  firmarBase64: string | null;
}

export interface Resultado {
  types: string[];
  geometry: Geometry;
  place_id: string;
  partial_match?: boolean;
  formatted_address: string;
  navigation_points?: NavigationPoint[];
  address_components: AddressComponent[];
  plus_code?: PlusCode;
}

export interface Geometry {
  location: Location;
  viewport: Viewport;
  location_type: string;
  bounds?: Bounds;
}

export interface Location {
  lat: number;
  lng: number;
}

export interface Viewport {
  northeast: Northeast;
  southwest: Southwest;
}

export interface Northeast {
  lat: number;
  lng: number;
}

export interface Southwest {
  lat: number;
  lng: number;
}

export interface Bounds {
  northeast: Northeast2;
  southwest: Southwest2;
}

export interface Northeast2 {
  lat: number;
  lng: number;
}

export interface Southwest2 {
  lat: number;
  lng: number;
}

export interface NavigationPoint {
  location: Location2;
  road_name: string;
}

export interface Location2 {
  latitude: number;
  longitude: number;
}

export interface AddressComponent {
  types: string[];
  long_name: string;
  short_name: string;
}

export interface PlusCode {
  global_code: string;
  compound_code: string;
}

export interface DatosAdicionales {
  recibe: string;
  recibeParentesco: string;
  recibeNumeroIdentificacion: string;
  recibeCelular: string;
}

export interface CrearVisita {
  id: number;
  fecha_entrega: string;
  imagenes: Media[];
  firmas: Media[];
  datos_adicionales: DatosAdicionales;
}

export interface Media {
  uri: string;
  name: string;
  type: string;
}

export interface PhotoData {
  uri: string;
  fileName?: string;
  type?: string;
  fileSize?: number;
  width?: number;
  height?: number;
  timestamp: number;
}

export interface EntregaFormData {
  recibe: string;
  numeroIdentificacion: string;
  celular: string;
  parentesco: string;
  firma: string; // Base64 de la firma
  fotos: PhotoData[];
}