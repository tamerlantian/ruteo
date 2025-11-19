import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../auth/context/auth.context';
import { useAppSelector } from '../../../store/hooks';
import {
  selectVisitasPendientes,
  selectVisitasEntregadas,
  selectVisitaIdsConErrorCompleto,
  selectVisitasConErrorCompleto,
  selectVisitasConError,
} from '../../visita/store/selector/visita.selector';
import { selectOrdenEntrega } from '../../settings';
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

export const DashboardScreen = () => {
  const { user } = useAuth();
  const [isRetrying, setIsRetrying] = useState(false);
  const { reintentarNovedadesConError } = useRetryNovedades();
  const { reintentarSolucionesConError } = useRetrySoluciones();
  const { reintentarVisitasConError } = useRetryVisitas();

  // Selectores para obtener estadísticas de visitas
  const ordenEntrega = useAppSelector(selectOrdenEntrega);
  const visitasConError = useAppSelector(selectVisitasConError);
  const novedadesConError = useAppSelector(selectNovedadesConEstadosError);
  const novedades = useAppSelector(selectNovedadesPendientesPorSolventar);
  const visitasPendientes = useAppSelector(selectVisitasPendientes);
  const visitasEntregadas = useAppSelector(selectVisitasEntregadas);
  const visitasConErrorCompleto = useAppSelector(selectVisitasConErrorCompleto);
  const visitaIdsConError = useAppSelector(selectVisitaIdsConErrorCompleto);

  // Hook para retry coordinado

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
    try {
      const visitasConErrorIds = visitasConError.map(visita => visita.id);
      const novedadesConErrorIds = novedadesConError.map(novedad => novedad.id);

      await reintentarNovedadesConError(novedadesConErrorIds);
      await reintentarSolucionesConError(novedadesConErrorIds);
      await reintentarVisitasConError(visitasConErrorIds);

      Toast.show({
        type: 'success',
        text1: 'Se han reintentado los envíos correctamente.',
        text1Style: toastTextOneStyle,
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2:
          'Ocurrió un error al reintentar los envíos. Inténtalo nuevamente.',
      });
    } finally {
      setIsRetrying(false);
    }
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
                  {visitasConErrorCompleto.length}
                </Text>
                <Text style={styles.statLabel}>Sincronizar</Text>
              </View>
            </View>
          </View>
        )}

        {/* Botón de retry para visitas con error */}
        {ordenEntrega && visitasConErrorCompleto.length > 0 && (
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
                : `Sincronizar ${visitasConErrorCompleto.length} pendiente${
                    visitasConErrorCompleto.length > 1 ? 's' : ''
                  }`}
            </Text>
          </TouchableOpacity>
        )}
      </View>
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
    color: '#ff3b30', // Rojo para errores
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
});
