import { View, Text, StyleSheet } from 'react-native'
import React from 'react'
import { VisitaResponse } from '../../interfaces/visita.interface'

interface VisitaCardProps {
  visita: VisitaResponse;
  index: number;
}

const VisitaCardComponent = React.memo<VisitaCardProps>(({ visita }) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>#{visita.numero || visita.id}</Text>
        <Text style={styles.subtitle}>
          {visita.destinatario || 'Destinatario no especificado'}
        </Text>
        {visita.destinatario_direccion && (
          <Text style={styles.address}>{visita.destinatario_direccion}</Text>
        )}
        <View style={styles.infoRow}>
          <Text style={styles.date}>{visita.fecha}</Text>
          <Text style={styles.weight}>Peso: {visita.peso}kg</Text>
        </View>
      </View>
    </View>
  )
})

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginVertical: 6,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    height: 120, // Altura fija para getItemLayout
  },
  content: {
    padding: 16,
    flex: 1,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1c1c1e',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: '#8e8e93',
    marginBottom: 8,
  },
  address: {
    fontSize: 12,
    color: '#007aff',
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
    color: '#8e8e93',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  weight: {
    fontSize: 12,
    color: '#007aff',
    fontWeight: '500',
  },
})

VisitaCardComponent.displayName = 'VisitaCardComponent'

export default VisitaCardComponent