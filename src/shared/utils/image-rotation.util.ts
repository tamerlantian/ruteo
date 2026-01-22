import ImageResizer from '@bam.tech/react-native-image-resizer';
import { PhotoData } from '../components/ui/photo-capture/PhotoCapture.types';

/**
 * Utility class for handling image rotation based on EXIF orientation
 * Physically rotates image pixels to ensure correct orientation when displayed on web
 */
export class ImageRotationUtil {
  /**
   * Rotates an image to correct orientation based on EXIF data
   * This ensures that images appear correctly oriented when viewed on web browsers
   * that may not respect EXIF metadata
   *
   * @param photoData - Photo data from camera capture
   * @returns Promise<PhotoData> - New photo data with corrected orientation
   */
  static async rotateImageToCorrectOrientation(
    photoData: PhotoData
  ): Promise<PhotoData> {
    try {
      console.log('🔄 [ImageRotation] Starting rotation for:', photoData.fileName);
      console.log('🔄 [ImageRotation] Original URI:', photoData.uri);

      // Remove 'file://' prefix if present for the resizer
      const cleanUri = photoData.uri.replace('file://', '');

      // Use ImageResizer to rotate the image based on EXIF
      // The library automatically reads EXIF orientation and rotates pixels accordingly
      // keepMeta: false removes EXIF data after physical rotation (web won't need it)
      const rotatedImage = await ImageResizer.createResizedImage(
        cleanUri,
        photoData.width || 2000, // Keep original width (max 2000 for reasonable file size)
        photoData.height || 2000, // Keep original height (max 2000 for reasonable file size)
        'JPEG', // Output format
        100, // Quality (100 = no compression)
        0, // Rotation in degrees (0 = auto-rotate based on EXIF)
        undefined, // Output path (undefined = use temp directory)
        false, // keepMeta: false removes EXIF after rotation
        {
          mode: 'contain', // Maintain aspect ratio
          onlyScaleDown: true, // Don't upscale if image is smaller than max dimensions
        }
      );

      console.log('✅ [ImageRotation] Rotation successful:', rotatedImage.uri);
      console.log('✅ [ImageRotation] New size:', rotatedImage.width, 'x', rotatedImage.height);

      // Return new PhotoData with rotated image
      return {
        uri: rotatedImage.uri.startsWith('file://')
          ? rotatedImage.uri
          : `file://${rotatedImage.uri}`,
        fileName: photoData.fileName || `rotated-${Date.now()}.jpg`,
        type: 'image/jpeg',
        fileSize: rotatedImage.size || 0,
        width: rotatedImage.width,
        height: rotatedImage.height,
        timestamp: photoData.timestamp,
      };
    } catch (error) {
      console.error('❌ [ImageRotation] Error rotating image:', error);

      // If rotation fails, return original photo data
      // This ensures the app continues to work even if rotation fails
      console.warn('⚠️ [ImageRotation] Falling back to original image');
      return photoData;
    }
  }

  /**
   * Batch rotates multiple images
   * Useful for processing multiple photos at once
   *
   * @param photos - Array of photo data
   * @returns Promise<PhotoData[]> - Array of rotated photo data
   */
  static async rotateMultipleImages(
    photos: PhotoData[]
  ): Promise<PhotoData[]> {
    console.log(`🔄 [ImageRotation] Batch rotating ${photos.length} images`);

    const rotationPromises = photos.map(photo =>
      this.rotateImageToCorrectOrientation(photo)
    );

    try {
      const rotatedPhotos = await Promise.all(rotationPromises);
      console.log(`✅ [ImageRotation] Successfully rotated ${rotatedPhotos.length} images`);
      return rotatedPhotos;
    } catch (error) {
      console.error('❌ [ImageRotation] Error in batch rotation:', error);
      // Return original photos if batch rotation fails
      return photos;
    }
  }

  /**
   * Checks if an image needs rotation based on its dimensions
   * This is a heuristic check - if width > height but photo was taken in portrait,
   * it likely needs rotation
   *
   * @param width - Image width
   * @param height - Image height
   * @returns boolean - True if image likely needs rotation
   */
  static needsRotation(width: number, height: number): boolean {
    // If width > height, the image is landscape
    // Most photos are taken in portrait, so this might indicate wrong orientation
    return width > height;
  }
}

export const imageRotationUtil = ImageRotationUtil;
