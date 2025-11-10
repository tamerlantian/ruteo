import { View, Text, TouchableOpacity, Linking } from 'react-native'
import React from 'react'
import Ionicons from '@react-native-vector-icons/ionicons'
import { VisitaResponse } from '../../interfaces/visita.interface'
import { useAppSelector, useAppDispatch } from '../../../../store/hooks'
import { selectIsVisitaSeleccionada } from '../../store/selector/visita.selector'
import { toggleVisitaSeleccion } from '../../store/slice/visita.slice'
import { visitaCardStyle } from './visita-card.style'
import { getFirstPhoneNumber } from '../../../../shared/utils/phone.util'

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

  const handlePhonePress = (event: any) => {
    event.stopPropagation();
    if (visita.destinatario_telefono) {
      // Usar el primer número para la llamada
      const firstPhone = getFirstPhoneNumber(visita.destinatario_telefono);
      Linking.openURL(`tel:${firstPhone}`);
    }
  };

  // Obtener el primer número para mostrar
  const displayPhone = visita.destinatario_telefono 
    ? getFirstPhoneNumber(visita.destinatario_telefono)
    : '';

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
        {/* Header con número y documento */}
        <View style={visitaCardStyle.header}>
          <Text style={visitaCardStyle.title}>#{visita.numero}</Text>
          <Text style={visitaCardStyle.document}>DOC: {visita.documento}</Text>
        </View>

        {/* Destinatario */}
        <Text style={visitaCardStyle.subtitle}>
          {visita.destinatario || 'Destinatario no especificado'}
        </Text>

        {/* Dirección */}
        {visita.destinatario_direccion && (
          <Text style={visitaCardStyle.address}>{visita.destinatario_direccion}</Text>
        )}

        {/* Información compacta */}
        <View style={visitaCardStyle.infoRow}>
          <View style={visitaCardStyle.leftInfo}>
            <Text style={visitaCardStyle.infoText}>
              {visita.unidades} und • {visita.peso}kg
            </Text>
            {visita.cobro > 0 && (
              <Text style={visitaCardStyle.cobro}>
                ${visita.cobro.toLocaleString()}
              </Text>
            )}
          </View>

          {/* Botón de teléfono */}
          {displayPhone && (
            <TouchableOpacity 
              style={visitaCardStyle.phoneButton}
              onPress={handlePhonePress}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="call" size={16} color="#007aff" />
              <Text style={visitaCardStyle.phoneText}>
                {displayPhone}
              </Text>
            </TouchableOpacity>
          )}
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