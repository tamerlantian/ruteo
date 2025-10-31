import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import { VisitaResponse } from '../../interfaces/visita.interface'
import { useAppSelector, useAppDispatch } from '../../../../store/hooks'
import { selectIsVisitaSeleccionada } from '../../store/selector/visita.selector'
import { toggleVisitaSeleccion } from '../../store/slice/visita.slice'
import { visitaCardStyle } from './visita-card.style'

interface VisitaCardProps {
  visita: VisitaResponse;
  index: number;
}

const VisitaCardComponent = React.memo<VisitaCardProps>(({ visita }) => {
  const dispatch = useAppDispatch();
  const isSelected = useAppSelector(selectIsVisitaSeleccionada(visita.id));

  const handlePress = () => {
    dispatch(toggleVisitaSeleccion(visita.id));
  };

  return (
    <TouchableOpacity 
      style={[
        visitaCardStyle.container,
        isSelected && visitaCardStyle.containerSelected
      ]} 
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={visitaCardStyle.content}>
        <Text style={visitaCardStyle.title}>#{visita.numero || visita.id}</Text>
        <Text style={visitaCardStyle.subtitle}>
          {visita.destinatario || 'Destinatario no especificado'}
        </Text>
        {visita.destinatario_direccion && (
          <Text style={visitaCardStyle.address}>{visita.destinatario_direccion}</Text>
        )}
        <View style={visitaCardStyle.infoRow}>
          <Text style={visitaCardStyle.date}>{visita.fecha}</Text>
          <Text style={visitaCardStyle.weight}>Peso: {visita.peso}kg</Text>
        </View>
      </View>
      
      {/* Indicador visual de selección */}
      {isSelected && (
        <View style={visitaCardStyle.selectedIndicator}>
          <View style={visitaCardStyle.checkmark} />
        </View>
      )}
    </TouchableOpacity>
  )
})

VisitaCardComponent.displayName = 'VisitaCardComponent'

export default VisitaCardComponent