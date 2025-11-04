import storageService from '../../../shared/services/storage.service';
import { STORAGE_KEYS } from '../constants/settings.constants';
import { AppSettings } from '../interfaces/settings.interface';

class SettingsRepository {
  async getSettings(): Promise<AppSettings> {
    try {
      const [subdominio, despacho, ordenEntrega] = await Promise.all([
        storageService.getItem<string>(STORAGE_KEYS.subdominio),
        storageService.getItem<string>(STORAGE_KEYS.despacho),
        storageService.getItem<string>(STORAGE_KEYS.ordenEntrega),
      ]);

      return {
        subdominio,
        despacho,
        ordenEntrega,
      };
    } catch (error) {
      console.error('Error getting settings:', error);
      throw error;
    }
  }

  async setSubdominio(subdominio: string): Promise<void> {
    try {
      await storageService.setItem(STORAGE_KEYS.subdominio, subdominio);
    } catch (error) {
      console.error('Error setting subdominio:', error);
      throw error;
    }
  }

  async setDespacho(despacho: string): Promise<void> {
    try {
      await storageService.setItem(STORAGE_KEYS.despacho, despacho);
    } catch (error) {
      console.error('Error setting despacho:', error);
      throw error;
    }
  }

  async setOrdenEntrega(ordenEntrega: string): Promise<void> {
    try {
      await storageService.setItem(STORAGE_KEYS.ordenEntrega, ordenEntrega);
    } catch (error) {
      console.error('Error setting orden entrega:', error);
      throw error;
    }
  }

  async updateSettings(settings: Partial<AppSettings>): Promise<void> {
    try {
      const promises: Promise<void>[] = [];

      if (settings.subdominio !== undefined) {
        promises.push(storageService.setItem(STORAGE_KEYS.subdominio, settings.subdominio));
      }

      if (settings.despacho !== undefined) {
        promises.push(storageService.setItem(STORAGE_KEYS.despacho, settings.despacho));
      }

      if (settings.ordenEntrega !== undefined) {
        promises.push(storageService.setItem(STORAGE_KEYS.ordenEntrega, settings.ordenEntrega));
      }

      await Promise.all(promises);
    } catch (error) {
      console.error('Error updating settings:', error);
      throw error;
    }
  }

  async clearSettings(): Promise<void> {
    try {
      await Promise.all([
        storageService.removeItem(STORAGE_KEYS.subdominio),
        storageService.removeItem(STORAGE_KEYS.despacho),
        storageService.removeItem(STORAGE_KEYS.ordenEntrega),
      ]);
    } catch (error) {
      console.error('Error clearing settings:', error);
      throw error;
    }
  }
}

export const settingsRepository = new SettingsRepository();
