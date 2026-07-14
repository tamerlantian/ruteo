import { VisitaResponse } from '../interfaces/visita.interface';

/**
 * Definicion UNICA de "pendiente": una entrega que el conductor todavia debe
 * hacer. Es decir, NO entregada, SIN novedad y que NO este en la cola de
 * Sincronizar/Errores (`estado === 'error'`).
 *
 * IMPORTANTE: toda vista que hable de "pendientes" (la lista del detalle de la
 * orden, el resumen del Inicio y el reorden por drag) DEBE usar esta funcion.
 * Tener la definicion duplicada fue justo lo que causo el bug reportado: el
 * Inicio contaba "2 pendientes" (con esta logica amplia) mientras el detalle
 * exigia `estado === 'pending'` exacto y escondia las visitas con estado
 * "fantasma" (no entregada pero con `estado` 'sync'/undefined tras un drift),
 * mostrando la lista vacia.
 */
export const esVisitaPendiente = (visita: VisitaResponse): boolean =>
  !visita.estado_entregado &&
  !visita.estado_novedad &&
  visita.estado !== 'error';
