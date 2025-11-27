// Componente actual (react-native-image-picker)
export { PhotoCapture } from './PhotoCapture';

// Componente nuevo (react-native-vision-camera) - PARALELO
export { PhotoCaptureVision } from './PhotoCaptureVision';

// Componentes compartidos
export { PhotoItem } from './PhotoItem';

// Hooks
export { usePhotoCapture } from './hooks/usePhotoCapture';
export { usePhotoCaptureVision } from './hooks/usePhotoCaptureVision';

// Tipos compartidos
export type { PhotoData, PhotoCaptureProps, PhotoItemProps } from './PhotoCapture.types';
