/**
 * Tipos para el componente de captura de fotos
 */

export interface PhotoData {
  uri: string;
  fileName?: string;
  type?: string;
  fileSize?: number;
  width?: number;
  height?: number;
  timestamp: number;
}

export interface PhotoCaptureProps {
  photos: PhotoData[];
  onPhotosChange: (photos: PhotoData[]) => void;
  maxPhotos?: number;
  quality?: number;
  disabled?: boolean;
}

export interface PhotoItemProps {
  photo: PhotoData;
  onRemove: () => void;
  index: number;
}
