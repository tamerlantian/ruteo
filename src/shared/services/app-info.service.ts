import packageJson from '../../../package.json';

/**
 * Servicio para obtener información de la aplicación
 * Sigue el patrón Singleton para mantener consistencia con otros servicios
 */
class AppInfoService {
  private static instance: AppInfoService;

  private constructor() {} // Prevents direct construction calls with the `new` operator

  public static getInstance(): AppInfoService {
    if (!AppInfoService.instance) {
      AppInfoService.instance = new AppInfoService();
    }
    return AppInfoService.instance;
  }

  /**
   * Obtiene la versión de la aplicación desde package.json
   * @returns string - Versión de la aplicación (ej: "0.0.1")
   */
  public getVersion(): string {
    return packageJson.version;
  }

  /**
   * Obtiene el nombre de la aplicación desde package.json
   * @returns string - Nombre de la aplicación (ej: "ruteo")
   */
  public getAppName(): string {
    return packageJson.name;
  }

  /**
   * Obtiene información completa de la aplicación
   * @returns object - Objeto con información de la aplicación
   */
  public getAppInfo(): { name: string; version: string } {
    return {
      name: this.getAppName(),
      version: this.getVersion(),
    };
  }

  /**
   * Obtiene la versión formateada para mostrar al usuario
   * @returns string - Versión formateada (ej: "v0.0.1")
   */
  public getFormattedVersion(): string {
    return `v${this.getVersion()}`;
  }
}

export default AppInfoService.getInstance();
