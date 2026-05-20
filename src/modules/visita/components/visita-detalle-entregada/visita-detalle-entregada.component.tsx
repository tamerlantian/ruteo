import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';

import { authColors } from '../../../auth/styles/auth.theme';
import { VisitaResponse } from '../../interfaces/visita.interface';

interface VisitaDetalleEntregadaProps {
  visita: VisitaResponse | null;
}

const formatearFechaHora = (iso: string | null | undefined) => {
  if (!iso) {
    return '—';
  }
  try {
    const d = new Date(iso);
    const fecha = d.toLocaleDateString('es', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
    const hora = d.toLocaleTimeString('es', {
      hour: '2-digit',
      minute: '2-digit',
    });
    return `${fecha} · ${hora}`;
  } catch {
    return iso;
  }
};

const capitalizar = (texto: string) =>
  texto ? texto.charAt(0).toUpperCase() + texto.slice(1) : '';

/**
 * Vista de "qué entregué" para una visita ya cerrada. Muestra los datos
 * basicos que la app tiene cacheados de la entrega. Foto, firma y datos
 * adicionales del receptor viven en el server — para verlos haria falta un
 * endpoint dedicado (fase aparte).
 */
export const VisitaDetalleEntregadaComponent: React.FC<
  VisitaDetalleEntregadaProps
> = ({ visita }) => {
  if (!visita) {
    return null;
  }
  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.heroIcon}>
        <Ionicons name="checkmark-circle" size={32} color="#1F7A38" />
      </View>
      <Text style={styles.titulo}>Entregada</Text>
      <Text style={styles.fecha}>
        {capitalizar(formatearFechaHora(visita.fecha_entrega))}
      </Text>

      <View style={styles.bloque}>
        <Text style={styles.bloqueLabel}>Visita</Text>
        <Text style={styles.bloqueValor}>
          #{visita.numero || visita.id} · DOC {visita.documento || '—'}
        </Text>
      </View>

      <View style={styles.bloque}>
        <Text style={styles.bloqueLabel}>Destinatario</Text>
        <Text style={styles.bloqueValor}>
          {visita.destinatario || '—'}
        </Text>
        {!!visita.destinatario_telefono && (
          <Text style={styles.bloqueSecundario}>
            {visita.destinatario_telefono}
          </Text>
        )}
      </View>

      <View style={styles.bloque}>
        <Text style={styles.bloqueLabel}>Dirección</Text>
        <Text style={styles.bloqueValor}>
          {visita.destinatario_direccion || '—'}
        </Text>
        {!!visita.destinatario_direccion_complemento && (
          <Text style={styles.bloqueSecundario}>
            {visita.destinatario_direccion_complemento}
          </Text>
        )}
      </View>

      {!!visita.observacion && (
        <View style={styles.bloque}>
          <Text style={styles.bloqueLabel}>Observación</Text>
          <Text style={styles.bloqueValor}>{visita.observacion}</Text>
        </View>
      )}

      <Text style={styles.nota}>
        Foto, firma y datos del receptor quedan registrados en el servidor.
      </Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 4,
    paddingBottom: 24,
    alignItems: 'stretch',
  },
  heroIcon: {
    alignSelf: 'center',
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(31, 122, 56, 0.10)',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 8,
  },
  titulo: {
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '800',
    color: authColors.ink,
    letterSpacing: -0.2,
  },
  fecha: {
    textAlign: 'center',
    fontSize: 13.5,
    color: authColors.inkSoft,
    marginTop: 2,
    marginBottom: 20,
  },
  bloque: {
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: authColors.border,
  },
  bloqueLabel: {
    fontSize: 11.5,
    fontWeight: '700',
    color: authColors.inkMuted,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  bloqueValor: {
    fontSize: 14.5,
    color: authColors.ink,
    fontWeight: '500',
  },
  bloqueSecundario: {
    fontSize: 13,
    color: authColors.inkSoft,
    marginTop: 2,
  },
  nota: {
    fontSize: 12,
    color: authColors.inkMuted,
    textAlign: 'center',
    marginTop: 18,
    fontStyle: 'italic',
  },
});
