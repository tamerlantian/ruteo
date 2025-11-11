import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Novedad } from '../../interfaces/novedad.interface';
import { dateUtil } from '../../../../shared/utils/date.util';
import { useAppSelector, useAppDispatch } from '../../../../store/hooks';
import { selectIsNovedadSeleccionada } from '../../store/selector/novedad.selector';
import { toggleNovedadSeleccion } from '../../store/slice/novedad.slice';

interface NovedadCardProps {
  novedad: Novedad;
}

export const NovedadCardComponent: React.FC<NovedadCardProps> = ({ novedad }) => {
  const dispatch = useAppDispatch();
  const isSelected = useAppSelector(selectIsNovedadSeleccionada(novedad.id));

  const formatDate = (dateString: string) => {
    try {
      return dateUtil.formatDate(dateString);
    } catch {
      return dateString;
    }
  };

  const handlePress = () => {
    dispatch(toggleNovedadSeleccion(novedad.id));
  };

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
        <View style={styles.header}>
          <Text style={styles.title}>
            Visita #{novedad.visita_id}
          </Text>
          <Text style={styles.date}>
            {formatDate(novedad.fecha)}
          </Text>
        </View>

        <Text style={styles.description}>
          {novedad.descripcion}
        </Text>
        
        {novedad.imagenes && novedad.imagenes.length > 0 && (
          <View style={styles.imageContainer}>
            <Text style={styles.imageLabel}>
              {novedad.imagenes.length} {novedad.imagenes.length === 1 ? 'imagen' : 'imágenes'}
            </Text>
            <View style={styles.imageRow}>
              {novedad.imagenes.slice(0, 3).map((imagen, index) => (
                <Image
                  key={index}
                  source={{ uri: imagen.uri }}
                  style={styles.thumbnailImage}
                  resizeMode="cover"
                />
              ))}
            </View>
          </View>
        )}

        {novedad.estado_error && (
          <View style={styles.errorBadge}>
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
    borderWidth: 0.5,
    borderColor: '#f0f0f0',
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1c1c1e',
  },
  date: {
    fontSize: 12,
    color: '#8e8e93',
    fontWeight: '500',
  },
  description: {
    fontSize: 14,
    color: '#3c3c43',
    lineHeight: 20,
    marginBottom: 12,
  },
  imageContainer: {
    marginTop: 8,
  },
  imageLabel: {
    fontSize: 12,
    color: '#8e8e93',
    fontWeight: '500',
    marginBottom: 8,
  },
  imageRow: {
    flexDirection: 'row',
    gap: 8,
  },
  thumbnailImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#f2f2f7',
  },
  errorBadge: {
    backgroundColor: '#ff3b30',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginTop: 12,
  },
  errorText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  containerSelected: {
    backgroundColor: '#f0f8ff', // Azul muy suave
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
});
