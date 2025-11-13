import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { Novedad } from '../../interfaces/novedad.interface';
import { useAppSelector, useAppDispatch } from '../../../../store/hooks';
import { selectIsNovedadSeleccionada, selectNovedadConVisita } from '../../store/selector/novedad.selector';
import { toggleNovedadSeleccion } from '../../store/slice/novedad.slice';
import { getFirstPhoneNumber } from '../../../../shared/utils/phone.util';

interface NovedadCardProps {
  novedad: Novedad;
}

export const NovedadCardComponent: React.FC<NovedadCardProps> = ({ novedad }) => {
  const dispatch = useAppDispatch();
  const isSelected = useAppSelector(selectIsNovedadSeleccionada(novedad.id));
  const novedadConVisita = useAppSelector(selectNovedadConVisita(novedad.id));


  const handlePress = () => {
    dispatch(toggleNovedadSeleccion(novedad.id));
  };

  const handlePhonePress = (event: any) => {
    event.stopPropagation();
    if (novedadConVisita?.visita?.destinatario_telefono) {
      const firstPhone = getFirstPhoneNumber(novedadConVisita.visita.destinatario_telefono);
      Linking.openURL(`tel:${firstPhone}`);
    }
  };

  const visita = novedadConVisita?.visita;
  const displayPhone = visita?.destinatario_telefono 
    ? getFirstPhoneNumber(visita.destinatario_telefono)
    : '';

  return (
    <TouchableOpacity 
      style={[
        styles.container,
        isSelected && styles.containerSelected
      ]} 
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        {/* Header con número y documento */}
        {visita && (
          <View style={styles.header}>
            <View style={styles.badgeContainer}>
              <View style={styles.numberBadge}>
                <Text style={styles.numberText}>{visita.id} - #{visita.numero}</Text>
              </View>
              {novedad.estado_solucion !== 'pending' && (
                <View style={styles.solvedBadge}>
                  <Ionicons name="checkmark-circle" size={14} color="#ffffff" />
                  <Text style={styles.solvedText}>Solucionado</Text>
                </View>
              )}
            </View>
            <Text style={styles.document}>DOC: {visita.documento}</Text>
          </View>
        )}

        {/* Información de la visita */}
        {visita && (
          <>

            {/* Destinatario */}
            <View style={styles.destinatarioContainer}>
              <Ionicons name="person-outline" size={14} color="#8e8e93" />
              <Text style={styles.destinatario}>
                {visita.destinatario || 'Destinatario no especificado'}
              </Text>
            </View>

            {/* Dirección */}
            {visita.destinatario_direccion && (
              <View style={styles.addressContainer}>
                <Ionicons name="location-outline" size={14} color="#007aff" />
                <Text style={styles.address}>{visita.destinatario_direccion}</Text>
              </View>
            )}
          </>
        )}

        {/* Descripción de la novedad */}
        <View style={styles.novedadContainer}>
          <Ionicons name="document-text-outline" size={14} color="#ff6b35" />
          <Text style={styles.description}>
            {novedad.descripcion}
          </Text>
        </View>
        
        {/* Información adicional y teléfono */}
        <View style={styles.infoRow}>
          <View style={styles.leftInfo}>
            {/* Espacio para información futura */}
          </View>

          <View style={styles.rightInfo}>
            {/* Botón de teléfono */}
            {displayPhone && (
              <TouchableOpacity 
                style={styles.phoneButton}
                onPress={handlePhonePress}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="call" size={16} color="#007aff" />
                <Text style={styles.phoneText}>
                  {displayPhone}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Badge de error */}
        {novedad.estado === 'error' && (
          <View style={styles.errorBadge}>
            <Ionicons name="warning" size={12} color="#ffffff" />
            <Text style={styles.errorText}>Error de sincronización</Text>
          </View>
        )}
      </View>
      
      {/* Indicador visual de selección */}
      {isSelected && (
        <View style={styles.selectedIndicator}>
          <View style={styles.checkmark} />
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginVertical: 6,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
    minHeight: 120,
    borderWidth: 0.5,
    borderColor: '#f0f0f0',
  },
  content: {
    padding: 16,
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  numberBadge: {
    backgroundColor: '#4698f0ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  numberText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
  document: {
    fontSize: 11,
    fontWeight: '500',
    color: '#646467ff',
  },
  destinatarioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  destinatario: {
    fontSize: 14,
    color: '#676769ff',
    flex: 1,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginBottom: 8,
  },
  address: {
    fontSize: 12,
    color: '#007aff',
    lineHeight: 14,
    flexShrink: 1,
    flex: 1,
  },
  novedadContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginBottom: 8,
    backgroundColor: '#fff5f0',
    padding: 8,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#ff6b35',
  },
  description: {
    fontSize: 13,
    color: '#3c3c43',
    lineHeight: 18,
    flex: 1,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: 6,
    flexWrap: 'wrap',
  },
  leftInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  rightInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  phoneButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#e5e5ea',
    flexShrink: 0,
  },
  phoneText: {
    fontSize: 10,
    color: '#007aff',
    fontWeight: '500',
    marginLeft: 3,
    flexShrink: 1,
  },
  errorBadge: {
    backgroundColor: '#ff3b30',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  errorText: {
    fontSize: 11,
    color: '#fff',
    fontWeight: '600',
  },
  containerSelected: {
    backgroundColor: '#f0f8ff',
    borderWidth: 2,
    borderColor: '#007aff',
    shadowColor: '#007aff',
    shadowOpacity: 0.2,
    elevation: 6,
  },
  selectedIndicator: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#007aff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  checkmark: {
    width: 8,
    height: 12,
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderColor: '#fff',
    transform: [{ rotate: '45deg' }],
    marginTop: -2,
    marginLeft: 2,
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  solvedBadge: {
    backgroundColor: '#34c759',
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  solvedText: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '600',
  },
});
