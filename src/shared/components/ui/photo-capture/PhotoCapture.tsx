import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { PhotoCaptureProps } from './PhotoCapture.types';
import { PhotoItem } from './PhotoItem';
import { usePhotoCapture } from './hooks/usePhotoCapture';
import { photoCaptureStyles } from './PhotoCapture.style';

/**
 * Componente para capturar y gestionar fotos de entrega
 * Permite hasta 5 fotos con opciones de cámara y galería
 */
export const PhotoCapture: React.FC<PhotoCaptureProps> = ({
  photos,
  onPhotosChange,
  maxPhotos = 5,
  disabled = false,
}) => {
  const { isLoading, addPhoto, removePhoto } = usePhotoCapture(maxPhotos);

  const canAddMore = photos.length < maxPhotos && !disabled;

  const handleAddPhoto = async () => {
    if (!canAddMore || isLoading) return;
    await addPhoto(photos, onPhotosChange);
  };

  const handleRemovePhoto = (index: number) => {
    removePhoto(photos, index, onPhotosChange);
  };

  return (
    <View style={photoCaptureStyles.container}>
      {/* Header */}
      <View style={photoCaptureStyles.header}>
    
        <Text style={photoCaptureStyles.counter}>
          {photos.length}/{maxPhotos}
        </Text>
      </View>

      {/* Grid de fotos */}
      {photos.length > 0 ? (
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingRight: 16 }}
        >
          <View style={photoCaptureStyles.photosGrid}>
            {/* Fotos existentes */}
            {photos.map((photo, index) => (
              <PhotoItem
                key={`${photo.uri}-${index}`}
                photo={photo}
                index={index}
                onRemove={() => handleRemovePhoto(index)}
              />
            ))}

            {/* Botón para agregar más fotos */}
            {canAddMore && (
              <TouchableOpacity
                style={[
                  photoCaptureStyles.addPhotoButton,
                  isLoading && photoCaptureStyles.addPhotoButtonDisabled,
                ]}
                onPress={handleAddPhoto}
                disabled={isLoading}
              >
                <Ionicons
                  name={isLoading ? "hourglass-outline" : "camera-outline"}
                  size={24}
                  color={isLoading ? "#c7c7cc" : "#007AFF"}
                  style={photoCaptureStyles.addPhotoIcon}
                />
                <Text
                  style={[
                    photoCaptureStyles.addPhotoText,
                    isLoading && photoCaptureStyles.addPhotoTextDisabled,
                  ]}
                >
                  {isLoading ? 'Abriendo cámara...' : 'Agregar'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      ) : (
        // Estado vacío
        <View style={photoCaptureStyles.emptyState}>
          <Ionicons
            name="camera-outline"
            size={32}
            color="#8e8e93"
            style={photoCaptureStyles.emptyStateIcon}
          />
          <Text style={photoCaptureStyles.emptyStateText}>
            Agrega fotos para documentar la entrega{'\n'}
            Puedes tomar hasta {maxPhotos} fotos
          </Text>
          
          {canAddMore && (
            <TouchableOpacity
              style={[
                photoCaptureStyles.addPhotoButton,
                { marginTop: 16, width: 120 },
                isLoading && photoCaptureStyles.addPhotoButtonDisabled,
              ]}
              onPress={handleAddPhoto}
              disabled={isLoading}
            >
              <Ionicons
                name={isLoading ? "hourglass-outline" : "camera-outline"}
                size={20}
                color={isLoading ? "#c7c7cc" : "#007AFF"}
                style={photoCaptureStyles.addPhotoIcon}
              />
              <Text
                style={[
                  photoCaptureStyles.addPhotoText,
                  isLoading && photoCaptureStyles.addPhotoTextDisabled,
                ]}
              >
                {isLoading ? 'Abriendo cámara...' : 'Tomar Foto'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};
