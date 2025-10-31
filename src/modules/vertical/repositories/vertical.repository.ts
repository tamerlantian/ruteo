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
   * Realiza el login del usuario
   * @param credentials Credenciales de login (email y password)
   * @returns Promise con la respuesta del login
   */
  async getEntrega(codigo: string): Promise<Entrega> {
    return this.get<Entrega>(`vertical/entrega/${codigo}/`);
  }
}

export const verticalRepository = VerticalRepository.getInstance();
