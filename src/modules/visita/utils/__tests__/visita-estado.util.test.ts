import { esVisitaPendiente } from '../visita-estado.util';
import { VisitaResponse } from '../../interfaces/visita.interface';

/**
 * Regresion del bug "con varias ordenes no se ven las pendientes": el Inicio
 * contaba una visita como pendiente (definicion amplia) mientras el detalle
 * exigia `estado === 'pending'` exacto y la escondia. esVisitaPendiente es
 * ahora la definicion UNICA; este test la fija.
 */
const base = (over: Partial<VisitaResponse>): VisitaResponse =>
  ({
    id: 1,
    estado_entregado: false,
    estado_novedad: false,
    estado: 'pending',
    orden: 1,
    ...over,
  } as VisitaResponse);

describe('esVisitaPendiente', () => {
  it('es pendiente una visita no entregada, sin novedad y en estado pending', () => {
    expect(esVisitaPendiente(base({ estado: 'pending' }))).toBe(true);
  });

  it('NO es pendiente una visita entregada', () => {
    expect(esVisitaPendiente(base({ estado_entregado: true, estado: 'sync' }))).toBe(false);
  });

  it('NO es pendiente una visita con novedad', () => {
    expect(esVisitaPendiente(base({ estado_novedad: true }))).toBe(false);
  });

  it('NO es pendiente una visita en error (cola de Sincronizar)', () => {
    expect(esVisitaPendiente(base({ estado: 'error' }))).toBe(false);
  });

  it('SI es pendiente una visita "fantasma": no entregada pero con estado sync (el bug)', () => {
    expect(esVisitaPendiente(base({ estado_entregado: false, estado: 'sync' }))).toBe(true);
  });

  it('SI es pendiente una visita no entregada con estado undefined', () => {
    expect(esVisitaPendiente(base({ estado: undefined }))).toBe(true);
  });
});
