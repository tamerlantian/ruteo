import { HttpBaseRepository } from '../../../core/repositories/http-base.repository';
import { buildUrlWithSubdomain } from '../../../shared/utils/url-builder.util';
import { CrearVisita, VisitaResponse } from '../interfaces/visita.interface';

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

  async entregaVisita(
    schemaName: string,
    payloadVisita: CrearVisita,
  ): Promise<VisitaResponse[]> {
    try {
      const url = await buildUrlWithSubdomain(schemaName, 'ruteo/visita/entrega/');
      return this.post<VisitaResponse[]>(url, payloadVisita);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Entrega una visita usando multipart/form-data para archivos
   * @param schemaName Nombre del schema
   * @param formData FormData con los datos de la visita y archivos
   * @returns Promise con la respuesta de la entrega
   */
  async entregaVisitaMultipart(
    schemaName: string,
    formData: FormData,
  ): Promise<VisitaResponse[]> {
    try {
      const url = await buildUrlWithSubdomain(schemaName, 'ruteo/visita/entrega/');
      return this.postMultipart<VisitaResponse[]>(url, formData);
    } catch (error) {
      throw error;
    }
  }
}

export const visitaRepository = VisitaRepository.getInstance();
