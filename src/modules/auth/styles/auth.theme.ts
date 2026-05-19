/**
 * Paleta del rediseno de autenticacion (rama feature/nuevo-diseno).
 * Alineada al logo de Ruteo (pin de ubicacion azul + amarillo).
 */
export const authColors = {
  /** Azul de marca (logo). Acentos, foco y bordes — no para texto blanco encima. */
  brand: '#1B9BD7',
  /** Azul profundo accesible: relleno de botones y enlaces (texto blanco AA). */
  brandInk: '#0E7BB0',
  /** Amarillo de marca (logo). Reservado para detalles puntuales. */
  accent: '#F4C24B',
  ink: '#0F172A',
  inkSoft: '#475569',
  inkMuted: '#94A3B8',
  border: '#E2E8F0',
  field: '#FFFFFF',
  background: '#F8FAFC',
  danger: '#DC2626',
  disabled: '#CBD5E1',
} as const;
