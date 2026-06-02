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
import { useWhatsApp } from '../../../../shared/hooks/use-whatsapp.hook'
import { useMoverVisita } from '../../hooks/use-mover-visita.hook'
import { buildEntregaWhatsAppMensaje } from '../../utils/whatsapp-message.util'

interface VisitaCardProps {
  visita: VisitaResponse;
  index: number;
  onVerDetalle?: (visita: VisitaResponse) => void;
  /** Habilita el reordenamiento por arrastre (solo filtro "Pendientes"). */
  draggable?: boolean;
  /** Inicia el gesto de arrastre (lo provee DraggableFlatList). */
  drag?: () => void;
  /** True mientras esta card es la que se esta arrastrando. */
  isDragging?: boolean;
  /** Nombre de la empresa DE LA ORDEN (no del usuario): para el msg de WhatsApp. */
  empresaNombre?: string;
  /** Nombre del conductor (usuario logueado): para el msg de WhatsApp. */
  conductorNombre?: string;
}

const VisitaCardComponent = React.memo<VisitaCardProps>(({
  visita,
  onVerDetalle,
  draggable = false,
  drag,
  isDragging = false,
  empresaNombre,
  conductorNombre,
}) => {
  const dispatch = useAppDispatch();
  const isSelected = useAppSelector(selectIsVisitaSeleccionada(visita.id));
  const { openLocationInMaps } = useMaps();
  const { openChat } = useWhatsApp();
  const mostrarMenuMover = useMoverVisita();

  const handlePress = () => {
    // Una visita ya entregada no se puede re-entregar. Si el caller registro
    // un onVerDetalle, redirigimos el tap a "ver que entregue"; si no, no
    // pasa nada (mejor que exponer la accion "Entregar" indebidamente).
    if (visita.estado_entregado) {
      onVerDetalle?.(visita);
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

  const handleWhatsAppPress = (event: any) => {
    event.stopPropagation();
    if (!visita.destinatario_telefono) {
      return;
    }
    // Abre el WhatsApp del conductor con un mensaje pre-cargado (editable) que
    // se identifica con empresa (DE LA ORDEN) + conductor para generar confianza.
    const mensaje = buildEntregaWhatsAppMensaje({
      clienteNombre: visita.destinatario,
      empresaNombre,
      conductorNombre,
      numero: visita.numero,
    });
    openChat(visita.destinatario_telefono, mensaje);
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
        isDragging && moverStyles.containerDragging,
      ]}
      onPress={handlePress}
      onLongPress={draggable ? drag : undefined}
      delayLongPress={180}
      activeOpacity={0.7}
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
            {visita.estado_novedad && (
              <View style={moverStyles.novedadBadge}>
                <Ionicons name="alert-circle" size={12} color="#FFFFFF" />
                <Text style={moverStyles.entregadaBadgeText}>Novedad</Text>
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
                <Ionicons name="cloud-offline-outline" size={12} color="#ffffff" />
                <Text style={visitaCardStyle.errorBadgeText}>Sin enviar</Text>
              </View>
            )}
            {draggable ? (
              <TouchableOpacity
                onPressIn={drag}
                onLongPress={drag}
                delayLongPress={120}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                style={moverStyles.dragHandle}
              >
                <Ionicons
                  name="reorder-three-outline"
                  size={22}
                  color={isDragging ? '#0E7BB0' : '#8e8e93'}
                />
              </TouchableOpacity>
            ) : (
              puedeMover && (
                <TouchableOpacity
                  onPress={handleMoverPress}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  style={moverStyles.kebab}
                >
                  <Ionicons name="ellipsis-vertical" size={18} color="#8e8e93" />
                </TouchableOpacity>
              )
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

        {/* Banner de "sin enviar": NO mostramos el error tecnico crudo
            (ej. "Servidor fuera de linea") porque asusta y no aporta. El
            conductor solo necesita saber que su entrega quedo guardada y
            se enviara sola. */}
        {isRetryableError && (
          <View style={visitaCardStyle.warningBanner}>
            <Ionicons name="cloud-upload-outline" size={16} color="#B45309" />
            <Text style={visitaCardStyle.warningText}>
              Entrega guardada · se sincronizará automáticamente
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

              {/* Botón de WhatsApp: abre el chat en el WhatsApp del conductor */}
              {displayPhone && (
                <TouchableOpacity
                  style={visitaCardStyle.whatsappButton}
                  onPress={handleWhatsAppPress}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  accessibilityRole="button"
                  accessibilityLabel="Chatear por WhatsApp"
                >
                  <Ionicons name="logo-whatsapp" size={16} color="#25D366" />
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
  dragHandle: {
    paddingHorizontal: 4,
    paddingVertical: 2,
    marginLeft: 4,
  },
  containerDragging: {
    // Card "levantada" mientras se arrastra: sombra mas marcada y borde de
    // acento para dejar claro que esta en modo reordenamiento.
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 8,
    borderColor: '#0E7BB0',
    borderWidth: 1.5,
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
  novedadBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: '#FB923C',
  },
  entregadaBadgeText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
});

export default VisitaCardComponent