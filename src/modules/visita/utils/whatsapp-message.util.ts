/**
 * Construcción del mensaje de WhatsApp que el conductor le envía al cliente.
 *
 * Criterios UX (primer contacto desde un número desconocido):
 *  - Identificarse de inmediato (empresa + nombre) para generar confianza y
 *    evitar el "¿quién es?" que mata la tasa de respuesta.
 *  - Decir el propósito en lenguaje del CLIENTE ("tu pedido", no "entrega #").
 *  - Un único CTA claro (confirmar disponibilidad).
 *  - Breve, cálido y profesional. Un emoji sutil sube la tasa de respuesta.
 * Todas las partes son opcionales: el mensaje se adapta a lo que haya.
 */

const primerNombre = (nombre?: string | null): string =>
  (nombre ?? '').trim().split(/\s+/)[0] ?? '';

/** Convierte un subdominio/slug en un nombre presentable: "mi-tienda" -> "Mi Tienda". */
export const prettifyEmpresa = (slug?: string | null): string => {
  if (!slug) return '';
  return slug
    .trim()
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map(p => p.charAt(0).toUpperCase() + p.slice(1))
    .join(' ');
};

export interface EntregaWhatsAppParams {
  /** Nombre del cliente (destinatario). Se usa solo el primer nombre. */
  clienteNombre?: string | null;
  /** Nombre de la empresa (idealmente real; hoy: subdominio prettificado). */
  empresaNombre?: string | null;
  /** Nombre del conductor que escribe (genera confianza). */
  conductorNombre?: string | null;
  /** Número del pedido visible para el cliente (no el id interno). */
  numero?: number | string | null;
}

export const buildEntregaWhatsAppMensaje = ({
  clienteNombre,
  empresaNombre,
  conductorNombre,
  numero,
}: EntregaWhatsAppParams): string => {
  const cliente = primerNombre(clienteNombre);
  const conductor = primerNombre(conductorNombre);
  const empresa = (empresaNombre ?? '').trim();

  // Saludo personalizado al cliente.
  const saludo = cliente ? `Hola ${cliente} 👋` : 'Hola 👋';

  // Presentación: "soy {conductor} de {empresa}" con degradación elegante.
  let presentacion: string;
  if (conductor && empresa) {
    presentacion = `soy ${conductor}, de ${empresa}`;
  } else if (empresa) {
    presentacion = `te escribo de ${empresa}`;
  } else if (conductor) {
    presentacion = `soy ${conductor}, tu repartidor`;
  } else {
    presentacion = 'soy tu repartidor';
  }

  // Propósito en lenguaje del cliente + referencia opcional del pedido.
  const refPedido = numero ? ` #${numero}` : '';
  const proposito = `estoy en ruta con tu pedido${refPedido}`;

  // CTA único y concreto.
  const cta = '¿Me confirmas que te encuentras disponible para recibirlo? ¡Gracias!';

  return `${saludo}, ${presentacion}. Te aviso que ${proposito}. ${cta}`;
};
