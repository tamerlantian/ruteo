import { EntregaFormData, PhotoData } from '../interfaces/visita.interface';
import { dateUtil } from '../../../shared/utils/date.util';

/**
 * Utility class for building FormData objects for visita submissions
 */
export class FormDataBuilder {
  /**
   * Builds a FormData object from EntregaFormData for multipart submission
   * @param data Form data from the entrega form
   * @param visitaId ID of the visita being submitted
   * @returns FormData object ready for multipart submission
   */
  static buildVisitaFormData(data: EntregaFormData, visitaId: number): FormData {
    const formData = new FormData();

    // Add basic visita data
    formData.append('id', visitaId.toString());
    formData.append('fecha_entrega', dateUtil.getCurrentForAPI());

    // Add additional data
    const datosAdicionales = {
      recibe: data.recibe || '',
      recibeParentesco: data.parentesco || '',
      recibeNumeroIdentificacion: data.numeroIdentificacion || '',
      recibeCelular: data.celular || '',
    };
    formData.append('datos_adicionales', JSON.stringify(datosAdicionales));

    // Add photos as files
    if (data.fotos && data.fotos.length > 0) {
      data.fotos.forEach((photo: PhotoData, index: number) => {
        const photoFile = {
          uri: photo.uri,
          type: photo.type || 'image/jpeg',
          name: photo.fileName || `image-${index}.jpg`,
        };
        
        // For React Native, we need to append the file object
        formData.append('imagenes', photoFile as any);
      });
    }

    // Add signature as file
    if (data.firma && data.firma.trim() !== '') {
      // Convert base64 to blob for proper file upload
      const signatureFile = this.base64ToFile(data.firma, 'firma.jpg');
      formData.append('firmas', signatureFile as any);
    }

    return formData;
  }

  /**
   * Converts base64 string to file object for form submission
   * @param base64String Base64 encoded string (with or without data URL prefix)
   * @param fileName Name for the file
   * @returns File-like object for FormData
   */
  private static base64ToFile(base64String: string, fileName: string) {
    // For React Native, we create a file-like object with the full data URL
    return {
      uri: base64String, // Keep the full data URL for React Native
      type: 'image/jpeg',
      name: fileName,
    };
  }

  /**
   * Logs FormData contents for debugging (React Native compatible)
   * @param formData FormData object to log
   * @param label Optional label for the log
   */
  static logFormData(formData: FormData, label = 'FormData'): void {
    console.log(`=== ${label} Contents ===`);
    
    // Note: In React Native, FormData doesn't have entries() method
    // So we'll log what we know was added
    console.log('FormData created with multipart/form-data content');
    console.log('Contains: id, fecha_entrega (YYYY-MM-DD HH:MM format), datos_adicionales, imagenes (if any), firmas (if any)');
    console.log('Date format example:', dateUtil.getCurrentForAPI());
  }

  /**
   * Validates that required data is present before building FormData
   * @param data Form data to validate
   * @param visitaId Visita ID to validate
   * @returns Validation result with success flag and error message
   */
  static validateFormData(data: EntregaFormData, visitaId: number): { isValid: boolean; error?: string } {
    if (!visitaId || isNaN(visitaId)) {
      return { isValid: false, error: 'ID de visita inválido' };
    }

    // All fields are optional, so we just check for basic structure
    if (!data) {
      return { isValid: false, error: 'Datos del formulario requeridos' };
    }

    // Validate photos if present
    if (data.fotos && data.fotos.length > 5) {
      return { isValid: false, error: 'No se pueden enviar más de 5 fotos' };
    }

    // Validate signature format if present
    if (data.firma && data.firma.trim() !== '') {
      if (!data.firma.startsWith('data:image/') && !data.firma.includes('base64')) {
        return { isValid: false, error: 'Formato de firma inválido' };
      }
    }

    return { isValid: true };
  }
}
