import { View, Text, TouchableOpacity, Linking, StyleSheet } from 'react-native'
import React from 'react'
import Ionicons from '@react-native-vector-icons/ionicons'
import { VisitaResponse } from '../../interfaces/visita.interface'
import { useAppSelector, useAppDispatch } from '../../../../store/hooks'
import { selectIsVisitaSeleccionada } from '../../store/selector/visita.selector'
import { toggleVisitaSeleccion } from '../../store/slice/visita.slice'
import { visitaCardStyle } from './visita-card.style'
import { getFirstPhoneNumber } from '../../../../shared/utils/phone.util'
import { useMaps } from '../../../../shared/hooks/use-maps.hook'
import { useMoverVisita } from '../../hooks/use-mover-visita.hook'

interface VisitaCardProps {
  visita: VisitaResponse;
  index: number;
}

const VisitaCardComponent = React.memo<VisitaCardProps>(({ visita }) => {
  const dispatch = useAppDispatch();
  const isSelected = useAppSelector(selectIsVisitaSeleccionada(visita.id));
  const { openLocationInMaps } = useMaps();
  const mostrarMenuMover = useMoverVisita();

  const handlePress = () => {
    // Una visita ya entregada no se puede re-entregar — no la dejamos
    // seleccionar para evitar exponer la accion "Entregar" desde abajo.
    if (visita.estado_entregado) {
      return;
    }
    dispatch(toggleVisitaSeleccion(visita.id));
  };

  const handleMoverPress = (event: any) => {
    event.stopPropagation();
    mostrarMenuMover(visita);
  };

  // Una visita ya entregada o con novedad no se reordena.
  const puedeMover = !visita.estado_entregado && !visita.estado_novedad;

  const handlePhonePress = (event: any) => {
    event.stopPropagation();
    if (visita.destinatario_telefono) {
      // Usar el primer número para la llamada
      const firstPhone = getFirstPhoneNumber(visita.destinatario_telefono);
      Linking.openURL(`tel:${firstPhone}`);
    }
  };

  const handleLocationPress = (event: any) => {
    event.stopPropagation();
    if (visita.latitud && visita.longitud) {
      openLocationInMaps({
        latitude: visita.latitud,
        longitude: visita.longitud,
        address: visita.destinatario_direccion
      });
    }
  };

  // Obtener el primer número para mostrar
  const displayPhone = visita.destinatario_telefono 
    ? getFirstPhoneNumber(visita.destinatario_telefono)
    : '';

  // Verificar si tiene coordenadas válidas
  const hasValidCoordinates = visita.latitud && visita.longitud &&
    visita.latitud !== 0 && visita.longitud !== 0;

  // Clasificar tipo de error
  const hasError = visita.estado === 'error';
  const isNonRetryableError = hasError && visita.es_error_retryable === false;
  const isRetryableError = hasError && visita.es_error_retryable !== false;

  return (
    <TouchableOpacity
      style={[
        visitaCardStyle.container,
        isSelected && visitaCardStyle.containerSelected,
        isNonRetryableError && visitaCardStyle.containerError,
        isRetryableError && visitaCardStyle.containerWarning,
        visita.estado_entregado && moverStyles.containerEntregada,
      ]}
      onPress={handlePress}
      activeOpacity={visita.estado_entregado ? 1 : 0.7}
    >
      <View style={visitaCardStyle.content}>
        {/* Header con número y documento */}
        <View style={visitaCardStyle.header}>
          <View style={moverStyles.ordenChip}>
            <Text style={moverStyles.ordenChipText}>{visita.orden}</Text>
          </View>
          <View style={visitaCardStyle.numberBadge}>
            <Text style={visitaCardStyle.numberText}>{visita.id} #{visita.numero}</Text>
          </View>
          <View style={visitaCardStyle.headerRight}>
            <Text style={visitaCardStyle.document}>DOC: {visita.documento}</Text>
            {visita.estado_entregado && (
              <View style={moverStyles.entregadaBadge}>
                <Ionicons name="checkmark-circle" size={12} color="#FFFFFF" />
                <Text style={moverStyles.entregadaBadgeText}>Entregada</Text>
              </View>
            )}
            {isNonRetryableError && (
              <View style={visitaCardStyle.errorBadge}>
                <Ionicons name="alert-circle" size={12} color="#ffffff" />
                <Text style={visitaCardStyle.errorBadgeText}>Error</Text>
              </View>
            )}
            {isRetryableError && (
              <View style={visitaCardStyle.warningBadge}>
                <Ionicons name="sync" size={12} color="#ffffff" />
                <Text style={visitaCardStyle.errorBadgeText}>Pendiente</Text>
              </View>
            )}
            {puedeMover && (
              <TouchableOpacity
                onPress={handleMoverPress}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                style={moverStyles.kebab}
              >
                <Ionicons name="ellipsis-vertical" size={18} color="#8e8e93" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Destinatario */}
        <View style={visitaCardStyle.destinatarioContainer}>
          <Ionicons name="person-outline" size={14} color="#8e8e93" />
          <Text style={visitaCardStyle.subtitle}>
            {visita.destinatario || 'Destinatario no especificado'}
          </Text>
        </View>

        {/* Dirección */}
        {visita.destinatario_direccion && (
          <View style={visitaCardStyle.addressContainer}>
            <Ionicons name="location-outline" size={14} color="#007aff" />
            <Text style={visitaCardStyle.address}>{visita.destinatario_direccion}</Text>
          </View>
        )}

        {/* Banner de error no-retryable */}
        {isNonRetryableError && (
          <View style={visitaCardStyle.errorBanner}>
            <Ionicons name="alert-circle" size={16} color="#ff3b30" />
            <Text style={visitaCardStyle.errorText}>
              {visita.error_mensaje || 'Error al procesar la entrega'}
            </Text>
          </View>
        )}

        {/* Banner de error retryable */}
        {isRetryableError && (
          <View style={visitaCardStyle.warningBanner}>
            <Ionicons name="sync" size={16} color="#ff9500" />
            <Text style={visitaCardStyle.warningText}>
              {visita.error_mensaje || 'Pendiente de reintento'}
            </Text>
          </View>
        )}

        {/* Información compacta */}
        <View style={visitaCardStyle.infoRow}>
          <View style={visitaCardStyle.leftInfo}>
            {visita.cobro > 0 && (
              <View style={visitaCardStyle.cobroContainer}>
                <Text style={visitaCardStyle.cobro}>
                  ${visita.cobro.toLocaleString()}
                </Text>
              </View>
            )}
          </View>

          {/* Información de carga y teléfono */}
          <View style={visitaCardStyle.rightInfo}>
            <View style={visitaCardStyle.weightContainer}>
              <Ionicons name="cube-outline" size={12} color="#8e8e93" />
              <Text style={visitaCardStyle.infoText}>
                {Math.round(visita.unidades)} und • {Math.round(visita.peso)} kg
              </Text>
            </View>
            
            {/* Botones de acción */}
            <View style={visitaCardStyle.actionButtons}>
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
              
              {/* Botón de ubicación */}
              {hasValidCoordinates && (
                <TouchableOpacity 
                  style={visitaCardStyle.locationButton}
                  onPress={handleLocationPress}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="location" size={16} color="#007aff" />
                </TouchableOpacity>
              )}
            </View>
          </View>
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

const moverStyles = StyleSheet.create({
  ordenChip: {
    minWidth: 28,
    height: 28,
    borderRadius: 14,
    paddingHorizontal: 8,
    backgroundColor: 'rgba(14, 123, 176, 0.10)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  ordenChipText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0E7BB0',
  },
  kebab: {
    paddingHorizontal: 4,
    paddingVertical: 2,
    marginLeft: 4,
  },
  containerEntregada: {
    // Atenuamos visualmente la card de una visita ya entregada: sigue
    // tappable para no romper la consistencia, pero queda claro que
    // esta cerrada (no hay accion sobre ella).
    opacity: 0.7,
  },
  entregadaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: '#1F7A38',
  },
  entregadaBadgeText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
});

export default VisitaCardComponent