import { ApiResponse } from '../../../core/interfaces/api.interface';
import { HttpBaseRepository } from '../../../core/repositories/http-base.repository';
import { buildUrlWithSubdomain } from '../../../shared/utils/url-builder.util';
import { NovedadTipo } from '../interfaces/novedad.interface';

/**
 * Repositorio para manejar las operaciones de API relacionadas con visitas
 * Implementa el patrón Singleton para evitar múltiples instancias
 */
export class NovedadRepository extends HttpBaseRepository {
  private static instance: NovedadRepository;

  /**
   * Constructor privado para evitar instanciación directa
   */
  private constructor() {
    super();
  }

  /**
   * Obtiene la instancia única del repositorio
   * @returns La instancia única de AuthRepository
   */
  public static getInstance(): NovedadRepository {
    if (!NovedadRepository.instance) {
      NovedadRepository.instance = new NovedadRepository();
    }
    return NovedadRepository.instance;
  }

  /**
   * Obtiene las novedad tipo
   * @param schemaName Nombre del schema
   * @returns Promise con la respuesta del login
   */
  async getNovedadTipo(schemaName: string): Promise<ApiResponse<NovedadTipo>> {
    const url = await buildUrlWithSubdomain(schemaName, 'ruteo/novedad_tipo/');
    return this.get<ApiResponse<NovedadTipo>>(url);
  }
}

export const novedadRepository = NovedadRepository.getInstance();
