/**
 * Eventos disponibles para autenticación
 */
export enum AuthEventType {
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  TOKEN_REFRESHED = 'TOKEN_REFRESHED',
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  LOGOUT = 'LOGOUT',
}

/**
 * Tipo para los listeners de eventos
 */
type EventListener = (...args: any[]) => void;

/**
 * Servicio de eventos para manejar estados de autenticación
 * Implementa el patrón Event Emitter para desacoplar servicios de UI
 */
class AuthEventService {
  private listeners: Map<string, EventListener[]> = new Map();

  /**
   * Método base para emitir eventos
   * @param event Nombre del evento
   * @param args Argumentos del evento
   */
  private emit(event: string, ...args: any[]): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(callback => {
        try {
          callback(...args);
        } catch (error) {
          console.error(`Error en listener de evento ${event}:`, error);
        }
      });
    }
  }

  /**
   * Método base para registrar listeners
   * @param event Nombre del evento
   * @param callback Función callback
   */
  public on(event: string, callback: EventListener): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  /**
   * Método base para remover listeners
   * @param event Nombre del evento
   * @param callback Función callback a remover
   */
  public off(event: string, callback: EventListener): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      const index = eventListeners.indexOf(callback);
      if (index > -1) {
        eventListeners.splice(index, 1);
      }
    }
  }

  /**
   * Emite evento cuando el token ha expirado y no se puede renovar
   */
  emitTokenExpired(): void {
    console.log('🔴 AuthEvents: Emitiendo TOKEN_EXPIRED');
    this.emit(AuthEventType.TOKEN_EXPIRED);
  }

  /**
   * Emite evento cuando el token ha sido renovado exitosamente
   * @param newToken Nuevo token JWT
   */
  emitTokenRefreshed(newToken: string): void {
    console.log('🟢 AuthEvents: Emitiendo TOKEN_REFRESHED');
    this.emit(AuthEventType.TOKEN_REFRESHED, newToken);
  }

  /**
   * Emite evento cuando el login es exitoso
   * @param user Datos del usuario autenticado
   */
  emitLoginSuccess(user: any): void {
    console.log('🟢 AuthEvents: Emitiendo LOGIN_SUCCESS');
    this.emit(AuthEventType.LOGIN_SUCCESS, user);
  }

  /**
   * Emite evento cuando se ejecuta logout
   */
  emitLogout(): void {
    console.log('🔵 AuthEvents: Emitiendo LOGOUT');
    this.emit(AuthEventType.LOGOUT);
  }

  /**
   * Registra un listener para eventos de token expirado
   * @param callback Función a ejecutar cuando expire el token
   */
  onTokenExpired(callback: () => void): void {
    this.on(AuthEventType.TOKEN_EXPIRED, callback);
  }

  /**
   * Registra un listener para eventos de token renovado
   * @param callback Función a ejecutar cuando se renueve el token
   */
  onTokenRefreshed(callback: (token: string) => void): void {
    this.on(AuthEventType.TOKEN_REFRESHED, callback);
  }

  /**
   * Registra un listener para eventos de login exitoso
   * @param callback Función a ejecutar cuando el login sea exitoso
   */
  onLoginSuccess(callback: (user: any) => void): void {
    this.on(AuthEventType.LOGIN_SUCCESS, callback);
  }

  /**
   * Registra un listener para eventos de logout
   * @param callback Función a ejecutar cuando se haga logout
   */
  onLogout(callback: () => void): void {
    this.on(AuthEventType.LOGOUT, callback);
  }

  /**
   * Remueve un listener específico
   * @param event Tipo de evento
   * @param callback Función a remover
   */
  removeListener(event: AuthEventType, callback: (...args: any[]) => void): void {
    this.off(event, callback);
  }

  /**
   * Remueve todos los listeners de un evento específico
   * @param event Tipo de evento
   */
  removeAllListeners(event?: AuthEventType): void {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }
}

// Exportar instancia singleton
export const authEvents = new AuthEventService();

// Exportar clase para testing
export { AuthEventService };
