import AsyncStorage from '@react-native-async-storage/async-storage';

class StorageService {
  private static instance: StorageService;

  private constructor() {} // Prevents direct construction calls with the `new` operator

  public static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  // Método genérico para guardar datos
  public async setItem<T>(key: string, value: T): Promise<void> {
    try {
      const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
      await AsyncStorage.setItem(key, stringValue);
    } catch (error) {
      console.error(`Error saving data for key ${key}:`, error);
      throw error;
    }
  }

  // Método genérico para obtener datos
  public async getItem<T>(key: string): Promise<T | null> {
    try {
      const value = await AsyncStorage.getItem(key);
      if (value === null) return null;

      try {
        return JSON.parse(value) as T;
      } catch {
        return value as unknown as T;
      }
    } catch (error) {
      console.error(`Error retrieving data for key ${key}:`, error);
      throw error;
    }
  }

  // Método para eliminar datos
  public async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing data for key ${key}:`, error);
      throw error;
    }
  }

  // Método para limpiar todo el almacenamiento
  public async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Error clearing storage:', error);
      throw error;
    }
  }

  // Métodos específicos para JWT Token (podrías agregar más según necesidades)
  public async setAuthToken(token: string): Promise<void> {
    return this.setItem('jwtToken', token);
  }

  public async getAuthToken(): Promise<string | null> {
    return this.getItem<string>('jwtToken');
  }

  public async removeAuthToken(): Promise<void> {
    return this.removeItem('jwtToken');
  }
}

export default StorageService.getInstance();
