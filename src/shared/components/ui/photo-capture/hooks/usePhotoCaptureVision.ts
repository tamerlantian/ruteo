import { useState, useCallback, useRef } from 'react';
import { Alert } from 'react-native';
import { Camera, PhotoFile } from 'react-native-vision-camera';
import { PhotoData } from '../PhotoCapture.types';
import { useCameraPermissionsService } from '../../../../services/camera-permissions.service';
import { imageRotationUtil } from '../../../../utils/image-rotation.util';

/**
 * Hook para manejar la lógica de captura de fotos con Vision Camera
 * IMPLEMENTACIÓN PARALELA - No reemplaza el hook actual
 */
export const usePhotoCaptureVision = (maxPhotos: number = 5) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  
  const cameraRef = useRef<Camera>(null);
  const { hasPermission, checkAndRequest } = useCameraPermissionsService();

  const openCamera = useCallback(async (): Promise<PhotoData | null> => {
    setIsLoading(true);
    setError(null);

    try {
      // Usar el servicio mejorado de permisos
      const permissionGranted = await checkAndRequest();
      if (!permissionGranted) {
        // El servicio ya mostró el alert apropiado
        return null;
      }

      // Mostrar modal de cámara
      setShowCamera(true);
      return null; // El resultado se manejará en takePhoto
    } catch (err) {
      console.error('Error opening camera:', err);
      setError('Error al abrir la cámara');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [checkAndRequest]);

  const takePhoto = useCallback(async (): Promise<PhotoData | null> => {
    if (!cameraRef.current) {
      setError('Cámara no disponible');
      return null;
    }

    try {
      setIsLoading(true);

      const photo: PhotoFile = await cameraRef.current.takePhoto({
        flash: 'off',
        enableShutterSound: true,
      });

      // Convertir PhotoFile a PhotoData (compatible con sistema actual)
      const photoData: PhotoData = {
        uri: `file://${photo.path}`,
        fileName: `photo-${Date.now()}.jpg`,
        type: 'image/jpeg',
        fileSize: 0, // Vision Camera no proporciona fileSize directamente
        width: photo.width,
        height: photo.height,
        timestamp: Date.now(),
      };

      console.log('📸 [PhotoCapture] Photo captured, rotating to correct orientation...');

      // Rotar la imagen físicamente para corregir orientación
      // Esto asegura que las fotos se vean correctamente en la web
      const rotatedPhotoData = await imageRotationUtil.rotateImageToCorrectOrientation(photoData);

      setShowCamera(false);
      return rotatedPhotoData;
    } catch (err) {
      console.error('Error taking photo:', err);
      setError('Error al tomar la foto');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const closeCamera = useCallback(() => {
    setShowCamera(false);
    setIsLoading(false);
  }, []);

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
    showCamera,
    cameraRef,
    hasPermission,
    addPhoto,
    removePhoto,
    openCamera,
    takePhoto,
    closeCamera,
  };
};
