import NetInfo from '@react-native-community/netinfo';

export interface NetworkState {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  type: string | null;
}

class NetworkService {
  /**
   * Checks if the device has network connectivity
   * @returns Promise<NetworkState> - Current network state
   */
  async checkConnectivity(): Promise<NetworkState> {
    try {
      const netInfoState = await NetInfo.fetch();
      
      return {
        isConnected: netInfoState.isConnected ?? false,
        isInternetReachable: netInfoState.isInternetReachable,
        type: netInfoState.type,
      };
    } catch (error) {
      console.error('Error checking network connectivity:', error);
      return {
        isConnected: false,
        isInternetReachable: false,
        type: null,
      };
    }
  }

  /**
   * Simple check to verify if device is connected to internet
   * @returns Promise<boolean> - true if connected, false otherwise
   */
  async isConnected(): Promise<boolean> {
    try {
      const state = await this.checkConnectivity();
      return state.isConnected && state.isInternetReachable !== false;
    } catch (error) {
      console.error('Error checking internet connection:', error);
      return false;
    }
  }

  /**
   * Subscribe to network state changes
   * @param callback - Function to call when network state changes
   * @returns Unsubscribe function
   */
  subscribeToNetworkChanges(callback: (state: NetworkState) => void) {
    return NetInfo.addEventListener(netInfoState => {
      callback({
        isConnected: netInfoState.isConnected ?? false,
        isInternetReachable: netInfoState.isInternetReachable,
        type: netInfoState.type,
      });
    });
  }
}

export const networkService = new NetworkService();
