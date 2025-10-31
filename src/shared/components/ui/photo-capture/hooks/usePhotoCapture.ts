import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { launchCamera, ImagePickerResponse, MediaType, PhotoQuality } from 'react-native-image-picker';
import { PhotoData } from '../PhotoCapture.types';
import { PermissionsService } from '../../../../services/permissions.service';

/**
 * Hook para manejar la lógica de captura de fotos
 */
export const usePhotoCapture = (maxPhotos: number = 5) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkPermissions = useCallback(async (): Promise<boolean> => {
    try {
      const result = await PermissionsService.requestStoragePermission();
      return result.granted;
    } catch (err) {
      console.error('Error checking permissions:', err);
      setError('Error al verificar permisos');
      return false;
    }
  }, []);

  const openCamera = useCallback(async (): Promise<PhotoData | null> => {
    setIsLoading(true);
    setError(null);

    try {
      // Verificar permisos primero
      const hasPermissions = await checkPermissions();
      if (!hasPermissions) {
        Alert.alert(
          'Permisos Requeridos',
          'Necesitamos permisos para acceder a la cámara.',
          [{ text: 'OK' }]
        );
        return null;
      }

      // Implementación real con react-native-image-picker
      console.log('Opening camera directly...');
      
      const options = {
        mediaType: 'photo' as MediaType,
        quality: 0.8 as PhotoQuality,
        maxWidth: 1920,
        maxHeight: 1080,
        includeBase64: false,
        saveToPhotos: false,
      };

      return new Promise((resolve) => {
        launchCamera(options, (response: ImagePickerResponse) => {
          if (response.didCancel) {
            console.log('Camera cancelled by user');
            resolve(null);
            return;
          }

          if (response.errorMessage) {
            console.error('Camera error:', response.errorMessage);
            setError(`Error de cámara: ${response.errorMessage}`);
            resolve(null);
            return;
          }

          if (response.assets && response.assets[0]) {
            const asset = response.assets[0];
            const photoData: PhotoData = {
              uri: asset.uri || '',
              fileName: asset.fileName || `photo-${Date.now()}.jpg`,
              type: asset.type || 'image/jpeg',
              fileSize: asset.fileSize || 0,
              width: asset.width || 0,
              height: asset.height || 0,
              timestamp: Date.now(),
            };
            console.log('Photo captured from camera:', photoData.fileName, photoData.uri);
            resolve(photoData);
          } else {
            console.log('No photo captured');
            resolve(null);
          }
        });
      });

    } catch (err) {
      console.error('Error opening camera:', err);
      setError('Error al abrir la cámara');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [checkPermissions]);

  const addPhoto = useCallback(
    async (photos: PhotoData[], onPhotosChange: (photos: PhotoData[]) => void) => {
      if (photos.length >= maxPhotos) {
        Alert.alert(
          'Límite Alcanzado',
          `Solo puedes agregar hasta ${maxPhotos} fotos.`,
          [{ text: 'OK' }]
        );
        return;
      }

      const newPhoto = await openCamera();
      if (newPhoto) {
        const updatedPhotos = [...photos, newPhoto];
        onPhotosChange(updatedPhotos);
        console.log('Photo added:', newPhoto.uri);
      }
    },
    [maxPhotos, openCamera]
  );

  const removePhoto = useCallback(
    (photos: PhotoData[], index: number, onPhotosChange: (photos: PhotoData[]) => void) => {
      Alert.alert(
        'Eliminar Foto',
        '¿Estás seguro de que quieres eliminar esta foto?',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Eliminar',
            style: 'destructive',
            onPress: () => {
              const updatedPhotos = photos.filter((_, i) => i !== index);
              onPhotosChange(updatedPhotos);
              console.log('Photo removed at index:', index);
            },
          },
        ]
      );
    },
    []
  );

  return {
    isLoading,
    error,
    addPhoto,
    removePhoto,
    openCamera,
    checkPermissions,
  };
};
