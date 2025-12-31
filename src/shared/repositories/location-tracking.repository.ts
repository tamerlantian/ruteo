import { HttpBaseRepository } from '../../core/repositories/http-base.repository';
import { buildUrlWithSubdomain } from '../utils/url-builder.util';
import { LocationTrackingData } from '../interfaces/location.interface';

/**
 * Repositorio para manejar las operaciones de API relacionadas con tracking de ubicación
 * Implementa el patrón Singleton para evitar múltiples instancias
 */
export class LocationTrackingRepository extends HttpBaseRepository {
  private static instance: LocationTrackingRepository;

  /**
   * Constructor privado para evitar instanciación directa
   */
  private constructor() {
    super();
  }

  /**
   * Obtiene la instancia única del repositorio
   * @returns La instancia única de LocationTrackingRepository
   */
  public static getInstance(): LocationTrackingRepository {
    if (!LocationTrackingRepository.instance) {
      LocationTrackingRepository.instance = new LocationTrackingRepository();
    }
    return LocationTrackingRepository.instance;
  }

  /**
   * Envía datos de ubicación al servidor
   * @param schemaName Nombre del schema (subdominio)
   * @param trackingData Datos de ubicación a enviar
   * @returns Promise con la respuesta del servidor
   */
  async sendLocationData(
    schemaName: string,
    trackingData: LocationTrackingData
  ): Promise<{ success: boolean; message?: string }> {
    try {
      // TODO: Definir el endpoint correcto cuando esté disponible
      const url = await buildUrlWithSubdomain(schemaName, 'ruteo/ubicacion/');
      
      const response = await this.post<{ success: boolean; message?: string }>(url, trackingData);
      return response;
    } catch (error) {
      console.error('Error sending location data:', error);
      throw error;
    }
  }

}

// Exportar instancia singleton
export const locationTrackingRepository = LocationTrackingRepository.getInstance();
