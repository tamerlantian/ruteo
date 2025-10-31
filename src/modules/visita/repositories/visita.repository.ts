import { HttpBaseRepository } from '../../../core/repositories/http-base.repository';
import { buildUrlWithSubdomain } from '../../../shared/utils/url-builder.util';
import { VisitaResponse } from '../interfaces/visita.interface';

/**
 * Repositorio para manejar las operaciones de API relacionadas con visitas
 * Implementa el patrón Singleton para evitar múltiples instancias
 */
export class VisitaRepository extends HttpBaseRepository {
  private static instance: VisitaRepository;

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
  public static getInstance(): VisitaRepository {
    if (!VisitaRepository.instance) {
      VisitaRepository.instance = new VisitaRepository();
    }
    return VisitaRepository.instance;
  }

  /**
   * Obtiene las visitas
   * @param schemaName Nombre del schema
   * @param despachoId Id del despacho
   * @param estadoEntregado Estado de entregado
   * @param estadoNovedad Estado de novedad
   * @returns Promise con la respuesta del login
   */
  async getVisitas(
    schemaName: string,
    despachoId: number,
    estadoEntregado: boolean,
    estadoNovedad: boolean,
  ): Promise<VisitaResponse[]> {
    const url = await buildUrlWithSubdomain(schemaName, 'ruteo/visita/');
    return this.get<VisitaResponse[]>(url, {
        estado_entregado: estadoEntregado ? 'True' : 'False',
        despacho_id: despachoId,
        estado_novedad: estadoNovedad ? 'True' : 'False',
        lista: true,
        serializador: 'lista',
        ordering: 'orden'
    });
  }
}

export const visitaRepository = VisitaRepository.getInstance();
