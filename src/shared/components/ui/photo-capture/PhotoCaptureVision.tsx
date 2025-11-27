import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { PhotoCaptureProps } from './PhotoCapture.types';
import { PhotoItem } from './PhotoItem';
import { usePhotoCaptureVision } from './hooks/usePhotoCaptureVision';
import { CameraModal } from './components/CameraModal';
import { photoCaptureStyles } from './PhotoCapture.style';

/**
 * Componente para capturar y gestionar fotos usando Vision Camera
 * COMPONENTE PARALELO - No reemplaza el actual, permite testing seguro
 */
export const PhotoCaptureVision: React.FC<PhotoCaptureProps> = ({
  photos,
  onPhotosChange,
  maxPhotos = 5,
  disabled = false,
}) => {
  const { 
    isLoading, 
    showCamera, 
    cameraRef, 
    addPhoto, 
    removePhoto, 
    takePhoto, 
    closeCamera 
  } = usePhotoCaptureVision(maxPhotos);

  const canAddMore = photos.length < maxPhotos;

  const handleAddPhoto = async () => {
    if (!canAddMore || isLoading || disabled) return;
    await addPhoto(photos, onPhotosChange);
  };

  const handleRemovePhoto = (index: number) => {
    removePhoto(photos, index, onPhotosChange);
  };

  const handleTakePhoto = async () => {
    const newPhoto = await takePhoto();
    if (newPhoto) {
      const updatedPhotos = [...photos, newPhoto];
      onPhotosChange(updatedPhotos);
    }
  };

  return (
    <View style={photoCaptureStyles.container}>
      {/* Header con indicador Vision Camera */}
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
                  name={isLoading ? "hourglass-outline" : "videocam-outline"}
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
          {canAddMore && (
            <TouchableOpacity
              style={[
                photoCaptureStyles.addPhotoButton,
                { marginTop: 6, width: 140 },
                isLoading && photoCaptureStyles.addPhotoButtonDisabled,
              ]}
              onPress={handleAddPhoto}
              disabled={isLoading || disabled}
            >
              <Ionicons
                name={'camera-outline'}
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

      {/* Modal de cámara */}
      <CameraModal
        visible={showCamera}
        onClose={closeCamera}
        onTakePhoto={handleTakePhoto}
        cameraRef={cameraRef}
        isLoading={isLoading}
      />
    </View>
  );
};
