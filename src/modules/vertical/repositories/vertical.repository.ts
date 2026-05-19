import { HttpBaseRepository } from '../../../core/repositories/http-base.repository';
import { Entrega } from '../interfaces/entrega.interface';

/**
 * Repositorio para manejar las operaciones de API relacionadas con autenticación
 * Implementa el patrón Singleton para evitar múltiples instancias
 */
export class VerticalRepository extends HttpBaseRepository {
  private static instance: VerticalRepository;

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
  public static getInstance(): VerticalRepository {
    if (!VerticalRepository.instance) {
      VerticalRepository.instance = new VerticalRepository();
    }
    return VerticalRepository.instance;
  }

  /**
   * Resuelve un codigo de orden a su despacho/entrega (API movil v2).
   * El backend solo devuelve despachos asignados al conductor (o sin
   * asignar); un despacho ajeno responde 404.
   * @param codigo Codigo de la orden
   * @returns Promise con el despacho/entrega
   */
  async getEntrega(codigo: string): Promise<Entrega> {
    try {
      const response = await this.get<Entrega>(`api/v2/despachos/${codigo}/`);
      return response
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  /**
   * Lista los despachos asignados al conductor autenticado (API movil v2).
   * El backend filtra por VerEntrega.usuario_id == request.user.id.
   * @returns Promise con el array de despachos asignados
   */
  async getMisDespachos(): Promise<Entrega[]> {
    return this.get<Entrega[]>('api/v2/despachos/');
  }
}

export const verticalRepository = VerticalRepository.getInstance();
