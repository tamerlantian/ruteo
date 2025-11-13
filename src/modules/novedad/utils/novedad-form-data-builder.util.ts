import { NovedadFormData } from '../interfaces/novedad.interface';
import { PhotoData } from '../../visita/interfaces/visita.interface';
import { dateUtil } from '../../../shared/utils/date.util';

/**
 * Utility class for building FormData objects for novedad submissions
 */
export class NovedadFormDataBuilder {
  /**
   * Builds a FormData object from NovedadFormData for multipart submission
   * @param data Form data from the novedad form
   * @returns FormData object ready for multipart submission
   */
  static buildNovedadFormData(data: NovedadFormData): FormData {
    const formData = new FormData();

    // Add basic novedad data
    formData.append('visita_id', data.visitaId.toString());
    formData.append('novedad_tipo_id', data.tipo);
    formData.append('fecha', dateUtil.getCurrentForAPI());
    formData.append('descripcion', data.descripcion);

    // Add photos as files
    if (data.foto && data.foto.length > 0) {
      data.foto.forEach((photo: PhotoData, index: number) => {
        const photoFile = {
          uri: photo.uri,
          type: photo.type || 'image/jpeg',
          name: photo.fileName || `novedad-image-${index}.jpg`,
        };
        
        // For React Native, we need to append the file object
        formData.append('imagenes', photoFile as any);
      });
    }

    return formData;
  }

  /**
   * Validates novedad form data before submission
   * @param data Form data to validate
   * @returns Validation result with isValid flag and error message
   */
  static validateNovedadFormData(
    data: NovedadFormData, 
  ): { isValid: boolean; error?: string } {
    // Validate required fields
    if (!data.tipo || data.tipo.trim() === '') {
      return { isValid: false, error: 'Tipo de novedad es requerido' };
    }

    if (!data.descripcion || data.descripcion.trim() === '') {
      return { isValid: false, error: 'Descripción es requerida' };
    }

    if (!data.foto || data.foto.length === 0) {
      return { isValid: false, error: 'Al menos una foto es requerida' };
    }

    if (!data.visitaId || data.visitaId <= 0) {
      return { isValid: false, error: 'ID de visita inválido' };
    }

    // Validate description length
    if (data.descripcion.length > 500) {
      return { isValid: false, error: 'La descripción no puede exceder 500 caracteres' };
    }

    // Validate photos
    for (let i = 0; i < data.foto.length; i++) {
      const photo = data.foto[i];
      if (!photo.uri || photo.uri.trim() === '') {
        return { isValid: false, error: `Foto ${i + 1} no tiene URI válida` };
      }
    }

    return { isValid: true };
  }

  /**
   * Logs FormData contents for debugging purposes
   * @param formData FormData object to log
   * @param prefix Prefix for log messages
   */
  static logFormData(formData: FormData, prefix: string = 'FormData'): void {
    console.log(`📋 ${prefix} - Contents:`);
    
    // Note: FormData entries() is not available in React Native
    // This is mainly for debugging in development
    try {
      // Log what we know was added
      console.log('- visita_id: [number]');
      console.log('- novedad_tipo_id: [string]');
      console.log('- fecha: [string]');
      console.log('- descripcion: [string]');
      console.log('- imagenes: [files]');
    } catch (error) {
      console.log('Could not enumerate FormData contents');
    }
  }
}
