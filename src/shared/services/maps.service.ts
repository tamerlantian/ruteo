import { Linking, Alert, Platform } from 'react-native';

export interface MapCoordinates {
  latitude: number;
  longitude: number;
  address?: string;
}

export interface MapAppOption {
  id: 'google' | 'waze';
  name: string;
  icon: string;
  available: boolean;
}

class MapsService {
  /**
   * Genera la URL para Google Maps (aplicación nativa)
   */
  private getGoogleMapsUrl(coordinates: MapCoordinates): string {
    const { latitude, longitude, address } = coordinates;
    
    if (Platform.OS === 'ios') {
      // iOS: Usar esquema más simple y confiable
      return `maps://?q=${latitude},${longitude}`;
    } else {
      // Android: Usar google.navigation:// para abrir Google Maps directamente
      if (address) {
        return `google.navigation:q=${encodeURIComponent(address)}`;
      }
      return `google.navigation:q=${latitude},${longitude}`;
    }
  }

    /**
   * Genera la URL para Waze (aplicación nativa)
   */
  private getWazeUrl(coordinates: MapCoordinates): string {
    const { latitude, longitude } = coordinates;
    
    if (Platform.OS === 'ios') {
      // iOS: Usar el esquema específico de Waze para iOS
      return `https://waze.com/ul?ll=${latitude},${longitude}&navigate=yes`;
    } else {
      // Android: Usar el esquema de Waze para Android
      return `waze://?ll=${latitude},${longitude}&navigate=yes`;
    }
  }

  /**
   * Verifica si una aplicación está disponible
   */
  private async isAppAvailable(url: string): Promise<boolean> {
    try {
      return await Linking.canOpenURL(url);
    } catch (error) {
      return false;
    }
  }

  /**
   * Obtiene las opciones de aplicaciones de mapas disponibles
   */
  async getAvailableMapApps(coordinates: MapCoordinates): Promise<MapAppOption[]> {
    // Simplificar: siempre mostrar ambas opciones y manejar errores al abrir
    return [
      {
        id: 'google',
        name: 'Google Maps',
        icon: 'map-outline',
        available: true // Siempre mostrar, manejar error al abrir
      },
      {
        id: 'waze',
        name: 'Waze',
        icon: 'navigate-outline',
        available: true // Siempre mostrar, manejar error al abrir
      }
    ];
  }

  /**
   * Abre la ubicación en la aplicación especificada
   */
  async openInMapApp(appId: 'google' | 'waze', coordinates: MapCoordinates): Promise<boolean> {
    try {
      let nativeUrl: string;
      let fallbackUrl: string;
      
      switch (appId) {
        case 'google':
          nativeUrl = this.getGoogleMapsUrl(coordinates);
          // Fallback a URL web si la app nativa no funciona
          const { latitude, longitude, address } = coordinates;
          if (address) {
            fallbackUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}&center=${latitude},${longitude}`;
          } else {
            fallbackUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
          }
          break;
        case 'waze':
          nativeUrl = this.getWazeUrl(coordinates);
          // Fallback a URL web de Waze
          fallbackUrl = `https://waze.com/ul?ll=${coordinates.latitude},${coordinates.longitude}&navigate=yes`;
          break;
        default:
          throw new Error(`Aplicación de mapas no soportada: ${appId}`);
      }

      // Intentar abrir la aplicación nativa primero
      const canOpenNative = await Linking.canOpenURL(nativeUrl);
      
      if (canOpenNative) {
        await Linking.openURL(nativeUrl);
        return true;
      }

      // Si no se puede abrir la app nativa, usar fallback web
      console.log(`App nativa de ${appId} no disponible, usando versión web`);
      await Linking.openURL(fallbackUrl);
      return true;
    } catch (error) {
      console.error('Error opening map app:', error);
      return false;
    }
  }

  /**
   * Muestra un selector de aplicaciones de mapas
   */
  async showMapAppSelector(coordinates: MapCoordinates): Promise<void> {
    const availableApps = await this.getAvailableMapApps(coordinates);
    
    // Ahora siempre hay opciones disponibles (con fallback web)
    const buttons = availableApps.map(app => ({
      text: app.name,
      onPress: () => this.openInMapApp(app.id, coordinates)
    }));

    buttons.push({
      text: 'Cancelar',
      onPress: () => {},
      style: 'cancel' as const
    });

    Alert.alert(
      'Abrir ubicación en',
      'Selecciona la aplicación de mapas:',
      buttons
    );
  }

  /**
   * Valida si las coordenadas son válidas
   */
  validateCoordinates(coordinates: MapCoordinates): boolean {
    const { latitude, longitude } = coordinates;
    
    return (
      typeof latitude === 'number' &&
      typeof longitude === 'number' &&
      latitude >= -90 && latitude <= 90 &&
      longitude >= -180 && longitude <= 180 &&
      !isNaN(latitude) &&
      !isNaN(longitude)
    );
  }
}

export const mapsService = new MapsService();
