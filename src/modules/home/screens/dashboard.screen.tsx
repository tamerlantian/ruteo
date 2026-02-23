import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Linking,
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../auth/context/auth.context';
import { useAppSelector, useAppDispatch } from '../../../store/hooks';
import {
  selectVisitasPendientes,
  selectVisitasEntregadas,
  selectVisitaIdsConErrorCompleto,
  selectVisitasConError,
  selectVisitasConErrorRetryables,
  selectVisitasConErrorNoRetryables,
} from '../../visita/store/selector/visita.selector';
import { setSyncing } from '../../visita/store/slice/visita.slice';
import { selectOrdenEntrega, selectSubdominio, selectDespacho } from '../../settings';
import { useRetryNovedades } from '../../novedad/hooks';
import { useRetrySoluciones } from '../../novedad/hooks/use-retry-soluciones.hook';
import { useRetryVisitas } from '../../visita/hooks/use-retry-visitas.hook';
import {
  selectNovedadesConEstadosError,
  selectNovedadesPendientesPorSolventar,
} from '../../novedad/store/selector/novedad.selector';
import Toast from 'react-native-toast-message';
import { toastTextOneStyle } from '../../../shared/styles/global.style';
import { networkService } from '../../../shared/services/network.service';
import { backgroundGeolocationService } from '../../../shared/services/background-geolocation.service';
import { reportLocationTrackingError } from '../../../shared/utils/sentry-helpers';
import { WHATSAPP_NUMBER } from '../../../config/environment';

export const DashboardScreen = () => {
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const [isRetrying, setIsRetrying] = useState(false);
  const [isLocationTracking, setIsLocationTracking] = useState(true);
  const [isTogglingLocation, setIsTogglingLocation] = useState(false);
  const debounceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { reintentarNovedadesConError } = useRetryNovedades();
  const { reintentarSolucionesConError } = useRetrySoluciones();
  const { reintentarVisitasConError } = useRetryVisitas();

  // Selectores para obtener estadísticas de visitas
  const ordenEntrega = useAppSelector(selectOrdenEntrega);
  const subdominio = useAppSelector(selectSubdominio);
  const despacho = useAppSelector(selectDespacho);
  const visitasConError = useAppSelector(selectVisitasConError);
  const novedadesConError = useAppSelector(selectNovedadesConEstadosError);
  const novedades = useAppSelector(selectNovedadesPendientesPorSolventar);
  const visitasPendientes = useAppSelector(selectVisitasPendientes);
  const visitasEntregadas = useAppSelector(selectVisitasEntregadas);
  const visitaIdsConError = useAppSelector(selectVisitaIdsConErrorCompleto);
  const visitasConErrorRetryables = useAppSelector(selectVisitasConErrorRetryables);
  const visitasConErrorNoRetryables = useAppSelector(selectVisitasConErrorNoRetryables);

  // Automatic location stop when no pending deliveries
  useEffect(() => {
    // Only proceed if we have the required configuration and location is currently tracking
    if (!ordenEntrega || !subdominio || !despacho || !user?.id || !isLocationTracking) {
      return;
    }

    // Clear any existing timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // If there are no pending deliveries, schedule automatic stop
    if (visitasPendientes.length === 0) {
      debounceTimeoutRef.current = setTimeout(async () => {
        try {
          console.log('📍 Auto-stopping location tracking: no pending deliveries');
          await backgroundGeolocationService.stopTracking();
          setIsLocationTracking(false);
          
          Toast.show({
            type: 'info',
            text1: 'Ubicación detenida automáticamente',
            text2: 'No hay entregas pendientes',
            text1Style: toastTextOneStyle,
          });
        } catch (error) {
          console.error('Error auto-stopping location tracking:', error);

          // Report auto-stop errors as warnings (silent error, no user impact)
          reportLocationTrackingError('runtime', error, {
            phase: 'auto_stop',
            pendingCount: visitasPendientes.length,
            wasTracking: isLocationTracking,
          });

          // Don't show error toast for automatic actions to avoid user confusion
        }
      }, 1000); // 3 second debounce to prevent rapid on/off cycles
    }

    // Cleanup timeout on unmount
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [visitasPendientes.length, isLocationTracking, ordenEntrega, subdominio, despacho, user?.id]);

  // Verificar y sincronizar estado del tracking al cargar componente
  useEffect(() => {
    const checkAndSyncTrackingStatus = () => {
      try {
        const isTracking = backgroundGeolocationService.isTrackingActive();
        const hasValidConfig = backgroundGeolocationService.hasValidTrackingConfig();

        console.log('📱 [Dashboard] Estado tracking:', {
          isTracking,
          hasValidConfig,
          localState: isLocationTracking
        });

        // Sincronizar UI con estado real del servicio
        if (isTracking !== isLocationTracking) {
          console.log('📱 [Dashboard] Sincronizando UI con estado real:', isTracking);
          setIsLocationTracking(isTracking);
        }
      } catch (error) {
        console.error('📱 [Dashboard] Error checking tracking status:', error);

        // Report status sync errors as warnings
        reportLocationTrackingError('runtime', error, {
          phase: 'status_sync',
          localState: isLocationTracking,
        });
      }
    };

    checkAndSyncTrackingStatus();

    // Verificar cada 5 segundos
    const interval = setInterval(checkAndSyncTrackingStatus, 5000);

    return () => clearInterval(interval);
  }, [isLocationTracking]);

  // Función para toggle del tracking de ubicación
  const handleToggleLocationTracking = async () => {
    if (!ordenEntrega || !subdominio || !despacho || !user?.id) {
      Toast.show({
        type: 'error',
        text1: 'Configuración incompleta',
        text2: 'Faltan datos necesarios para el tracking de ubicación',
        text1Style: toastTextOneStyle,
      });
      return;
    }

    setIsTogglingLocation(true);
    
    try {
      if (isLocationTracking) {
        // Detener tracking
        await backgroundGeolocationService.stopTracking();
        setIsLocationTracking(false);
        
        Toast.show({
          type: 'info',
          text1: 'Tracking detenido',
          text2: 'El envío de ubicación se ha pausado',
          text1Style: toastTextOneStyle,
        });
      } else {
        // Iniciar tracking
        const trackingConfig = {
          schemaName: subdominio,
          despacho: parseInt(despacho, 10),
          usuarioId: user.id,
        };
        
        await backgroundGeolocationService.startTracking(trackingConfig);
        setIsLocationTracking(true);
        
        Toast.show({
          type: 'success',
          text1: 'Tracking iniciado',
          text2: 'El envío de ubicación está activo',
          text1Style: toastTextOneStyle,
        });
      }
    } catch (error) {
      console.error('Error toggling location tracking:', error);

      // Report location toggle errors
      reportLocationTrackingError('runtime', error, {
        phase: 'toggle_tracking',
        action: isLocationTracking ? 'stop' : 'start',
        hasConfig: !!(ordenEntrega && subdominio && despacho && user?.id),
      });

      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'No se pudo cambiar el estado del tracking',
        text1Style: toastTextOneStyle,
      });
    } finally {
      setIsTogglingLocation(false);
    }
  };

  // Función para manejar el retry de visitas con error
  const handleRetryErrorVisitas = async () => {
    const isConnected = await networkService.isConnected();

    if (!isConnected) {
      Toast.show({
        type: 'error',
        text1: 'Sin conexión a internet',
        text2: 'Verifica tu conexión e intenta nuevamente',
        text1Style: toastTextOneStyle,
      });
      return;
    }

    if (visitaIdsConError.length === 0) {
      // Toast.show({
      //   type: 'info',
      //   text1: 'Sin errores',
      //   text2: 'No hay visitas con error para reintentar.',
      // });
      return;
    }

    setIsRetrying(true);
    dispatch(setSyncing(true));
    try {
      const visitasConErrorIds = visitasConError.map(visita => visita.id);
      const novedadesConErrorIds = novedadesConError.map(novedad => novedad.id);

      await reintentarNovedadesConError(novedadesConErrorIds);
      await reintentarSolucionesConError(novedadesConErrorIds);
      await reintentarVisitasConError(visitasConErrorIds);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2:
          'Ocurrió un error al reintentar los envíos. Inténtalo nuevamente.',
      });
    } finally {
      setIsRetrying(false);
      dispatch(setSyncing(false));
    }
  };

  const handleOpenWhatsApp = () => {
    Linking.openURL(`whatsapp://send?phone=${WHATSAPP_NUMBER}`);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#f8f9fa"
        translucent={false}
      />
      <View style={styles.content}>
        <Text style={styles.title}>Dashboard</Text>
        {user && (
          <View style={styles.welcomeContainer}>
            <Text style={styles.welcomeText}>
              ¡Hola, {user.nombre || user.username}!
            </Text>
            <Text style={styles.subtitleText}>
              Bienvenido a tu panel principal
            </Text>
            {ordenEntrega && (
              <View style={styles.ordenContainer}>
                <Text style={styles.ordenLabel}>OE:</Text>
                <Text style={styles.ordenValue}>#{ordenEntrega}</Text>
              </View>
            )}
          </View>
        )}

        {ordenEntrega && (
          <View>
            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <Text style={[styles.statNumber, styles.pendingNumber]}>
                  {visitasPendientes.length}
                </Text>
                <Text style={styles.statLabel}>Pendientes</Text>
              </View>

              <View style={styles.statCard}>
                <Text style={[styles.statNumber, styles.completedNumber]}>
                  {visitasEntregadas.length}
                </Text>
                <Text style={styles.statLabel}>Entregadas</Text>
              </View>
            </View>
            <View style={[styles.statsContainer, { marginTop: 8 }]}>
              <View style={styles.statCard}>
                <Text style={[styles.statNumber, styles.novedadesNumber]}>
                  {novedades.length}
                </Text>
                <Text style={styles.statLabel}>Novedades</Text>
              </View>

              <View style={styles.statCard}>
                <Text style={[styles.statNumber, styles.errorNumber]}>
                  {visitasConErrorRetryables.length}
                </Text>
                <Text style={styles.statLabel}>Sincronizar</Text>
              </View>
            </View>
            
            {/* Nueva fila para errores no-retryables */}
            {visitasConErrorNoRetryables.length > 0 && (
              <View style={[styles.statsContainer, { marginTop: 8 }]}>
                <View style={styles.statCard}>
                  <Text style={[styles.statNumber, styles.erroresNumber]}>
                    {visitasConErrorNoRetryables.length}
                  </Text>
                  <Text style={styles.statLabel}>Errores</Text>
                </View>
                
                {/* Placeholder para mantener simetría */}
                <View style={[styles.statCard, { opacity: 0 }]}>
                  <Text style={styles.statNumber}>0</Text>
                  <Text style={styles.statLabel}>-</Text>
                </View>
              </View>
            )}
          </View>
        )}

        {/* Botón de retry para visitas con error retryables */}
        {ordenEntrega && visitasConErrorRetryables.length > 0 && (
          <TouchableOpacity
            style={[
              styles.retryButton,
              isRetrying && styles.retryButtonDisabled,
            ]}
            onPress={handleRetryErrorVisitas}
            disabled={isRetrying}
          >
            <Text style={styles.retryButtonText}>
              {isRetrying
                ? 'Reintentando...'
                : `Sincronizar ${visitasConErrorRetryables.length} pendiente${
                    visitasConErrorRetryables.length > 1 ? 's' : ''
                  }`}
            </Text>
          </TouchableOpacity>
        )}

        {/* Botón para controlar tracking de ubicación */}
        {ordenEntrega && (
          <TouchableOpacity
            style={[
              styles.locationButton,
              isLocationTracking ? styles.locationButtonActive : styles.locationButtonInactive,
              isTogglingLocation && styles.locationButtonDisabled,
            ]}
            onPress={handleToggleLocationTracking}
            disabled={isTogglingLocation}
          >
            <Text style={[
              styles.locationButtonText,
              isLocationTracking ? styles.locationButtonTextActive : styles.locationButtonTextInactive,
            ]}>
              {isTogglingLocation
                ? 'Cambiando...'
                : isLocationTracking
                ? '📍 Detener ubicación'
                : '📍 Iniciar ubicación'
              }
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <TouchableOpacity
        style={styles.whatsappButton}
        onPress={handleOpenWhatsApp}
        activeOpacity={0.8}
      >
        <Ionicons name="logo-whatsapp" size={28} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1c1c1e',
    marginBottom: 20,
  },
  welcomeContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1c1c1e',
    marginBottom: 4,
  },
  subtitleText: {
    fontSize: 14,
    color: '#8e8e93',
  },
  ordenContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  ordenLabel: {
    fontSize: 14,
    color: '#8e8e93',
    marginRight: 8,
  },
  ordenValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007aff',
    backgroundColor: '#f0f8ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statsContainer: {
    flexDirection: 'row',
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007aff',
    marginBottom: 4,
  },
  pendingNumber: {
    color: '#ff9500', // Naranja para pendientes
  },
  completedNumber: {
    color: '#34c759', // Verde para entregadas
  },
  novedadesNumber: {
    color: '#5856d6', // Púrpura para novedades
  },
  errorNumber: {
    color: '#ff3b30', // Rojo para errores retryables
  },
  erroresNumber: {
    color: '#dc143c', // Rojo más oscuro para errores no-retryables
  },
  statLabel: {
    fontSize: 12,
    color: '#8e8e93',
    textAlign: 'center',
  },
  permissionsStatus: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  permissionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  permissionText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  requestingText: {
    fontSize: 12,
    color: '#8e8e93',
    marginTop: 8,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  permissionGranted: {
    color: '#34c759',
  },
  permissionPending: {
    color: '#ff9500',
  },
  retryButton: {
    backgroundColor: '#ff3b30',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  retryButtonDisabled: {
    backgroundColor: '#8e8e93',
    opacity: 0.6,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  locationButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  locationButtonActive: {
    backgroundColor: '#34c759', // Verde cuando está activo
  },
  locationButtonInactive: {
    backgroundColor: '#007aff', // Azul cuando está inactivo
  },
  locationButtonDisabled: {
    backgroundColor: '#8e8e93',
    opacity: 0.6,
  },
  locationButtonText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  locationButtonTextActive: {
    color: '#fff',
  },
  locationButtonTextInactive: {
    color: '#fff',
  },
  whatsappButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#25D366',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
});
