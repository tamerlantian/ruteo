import { useState, useCallback, useRef } from 'react';
import { Alert } from 'react-native';
import { Camera, useCameraPermission, PhotoFile } from 'react-native-vision-camera';
import { PhotoData } from '../PhotoCapture.types';

/**
 * Hook para manejar la lógica de captura de fotos con Vision Camera
 * IMPLEMENTACIÓN PARALELA - No reemplaza el hook actual
 */
export const usePhotoCaptureVision = (maxPhotos: number = 5) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  
  const cameraRef = useRef<Camera>(null);
  const { hasPermission, requestPermission } = useCameraPermission();

  const checkCameraPermissions = useCallback(async (): Promise<boolean> => {
    try {
      if (hasPermission) {
        return true;
      }

      const result = await requestPermission();
      return result;
    } catch (err) {
      console.error('Error checking camera permissions:', err);
      setError('Error al verificar permisos de cámara');
      return false;
    }
  }, [hasPermission, requestPermission]);

  const openCamera = useCallback(async (): Promise<PhotoData | null> => {
    setIsLoading(true);
    setError(null);

    try {
      // Verificar permisos de cámara
      const hasCameraPermission = await checkCameraPermissions();
      if (!hasCameraPermission) {
        Alert.alert(
          'Permisos Requeridos',
          'Necesitamos permisos para acceder a la cámara.',
          [{ text: 'OK' }]
        );
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
  }, [checkCameraPermissions]);

  const takePhoto = useCallback(async (): Promise<PhotoData | null> => {
    if (!cameraRef.current) {
      setError('Cámara no disponible');
      return null;
    }

    try {
      setIsLoading(true);
      
      const photo: PhotoFile = await cameraRef.current.takePhoto({
        flash: 'auto',
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

      setShowCamera(false);
      return photoData;
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
    checkCameraPermissions,
  };
};
