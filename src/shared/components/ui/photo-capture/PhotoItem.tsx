import React from 'react';
import { View, Image, TouchableOpacity, Text } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { PhotoItemProps } from './PhotoCapture.types';
import { photoCaptureStyles } from './PhotoCapture.style';

/**
 * Componente individual para mostrar una foto capturada
 */
export const PhotoItem: React.FC<PhotoItemProps> = ({
  photo,
  onRemove,
  index,
}) => {
  return (
    <View style={photoCaptureStyles.photoItem}>
      {/* Imagen */}
      {photo.uri.startsWith('mock://') || photo.uri.startsWith('camera://') ? (
        // Placeholder para fotos simuladas
        <View style={[photoCaptureStyles.photoImage, { 
          backgroundColor: '#e1e5e9', 
          justifyContent: 'center', 
          alignItems: 'center' 
        }]}>
          <Ionicons name="camera" size={24} color="#8e8e93" />
          <Text style={{ fontSize: 8, color: '#8e8e93', marginTop: 2 }}>
            Foto {index + 1}
          </Text>
        </View>
      ) : (
        <Image source={{ uri: photo.uri }} style={photoCaptureStyles.photoImage} />
      )}

      {/* Botón de eliminar */}
      <TouchableOpacity
        style={photoCaptureStyles.removeButton}
        onPress={onRemove}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Ionicons name="close" size={12} color="#fff" />
      </TouchableOpacity>

      {/* Número de foto */}
      <Text style={photoCaptureStyles.photoIndex}>
        {index + 1}
      </Text>
    </View>
  );
};
