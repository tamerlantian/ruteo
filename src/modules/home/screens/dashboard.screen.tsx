import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Linking,
  Switch,
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useAuth } from '../../auth/context/auth.context';
import { useAppSelector, useAppDispatch } from '../../../store/hooks';
import {
  selectVisitas,
  selectVisitasPendientes,
  selectVisitasEntregadas,
  selectVisitaIdsConErrorCompleto,
  selectVisitasConError,
  selectVisitasConErrorRetryables,
  selectVisitasConErrorNoRetryables,
} from '../../visita/store/selector/visita.selector';
import { MainTabParamList } from '../../../navigation/types';
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
import { authColors } from '../../auth/styles/auth.theme';
import { AppBar } from '../../../shared/components/ui/app-bar/app-bar.component';

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

  const ordenEntrega = useAppSelector(selectOrdenEntrega);
  const subdominio = useAppSelector(selectSubdominio);
  const despacho = useAppSelector(selectDespacho);
  const visitas = useAppSelector(selectVisitas);
  const visitasConError = useAppSelector(selectVisitasConError);
  const novedadesConError = useAppSelector(selectNovedadesConEstadosError);
  const novedades = useAppSelector(selectNovedadesPendientesPorSolventar);
  const visitasPendientes = useAppSelector(selectVisitasPendientes);
  const visitasEntregadas = useAppSelector(selectVisitasEntregadas);
  const visitaIdsConError = useAppSelector(selectVisitaIdsConErrorCompleto);
  const visitasConErrorRetryables = useAppSelector(selectVisitasConErrorRetryables);
  const visitasConErrorNoRetryables = useAppSelector(selectVisitasConErrorNoRetryables);

  // === Agregacion de snapshots para el modelo navegacional ===
  // Despues del refactor a Lista -> Detalle, NO hay "una orden activa" cuyo
  // state.visitas resuma la pantalla. Los stats reales se calculan
  // agregando todos los snapshots de ordenes en las que el conductor
  // trabajo localmente.
  const snapshots = useAppSelector(
    state => state.visita.snapshotsByDespacho ?? {},
  );
  const agregado = useMemo(() => {
    let visitasTotal = 0;
    let entregadasTotal = 0;
    let pendientesTotal = 0;
    let novedadesTotal = 0;
    let erroresTotal = 0;
    let erroresRetryablesTotal = 0;
    let ordenesEnCurso = 0;

    Object.values(snapshots).forEach(snap => {
      if (!snap?.entrega) {
        return;
      }
      const vs = snap.visitas || [];
      const entregadas = vs.filter(v => v.estado_entregado).length;
      visitasTotal += vs.length;
      entregadasTotal += entregadas;
      pendientesTotal += vs.filter(
        v => !v.estado_entregado && !v.estado_novedad && v.estado !== 'error',
      ).length;
      novedadesTotal += vs.filter(v => v.estado_novedad).length;
      const errores = vs.filter(v => v.estado === 'error');
      erroresTotal += errores.length;
      erroresRetryablesTotal += errores.filter(
        v => v.es_error_retryable !== false,
      ).length;
      if (entregadas > 0) {
        ordenesEnCurso += 1;
      }
    });
    const progreso =
      visitasTotal > 0
        ? Math.round((entregadasTotal / visitasTotal) * 100)
        : 0;
    return {
      visitasTotal,
      entregadasTotal,
      pendientesTotal,
      novedadesTotal,
      erroresTotal,
      erroresRetryablesTotal,
      ordenesEnCurso,
      progreso,
    };
  }, [snapshots]);
  const hayActividad = agregado.ordenesEnCurso > 0 || agregado.visitasTotal > 0;

  // === Auto-stop de geolocation cuando no quedan pendientes ===
  useEffect(() => {
    if (!ordenEntrega || !subdominio || !despacho || !user?.id || !isLocationTracking) {
      return;
    }
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    if (visitasPendientes.length === 0) {
      debounceTimeoutRef.current = setTimeout(async () => {
        try {
          await backgroundGeolocationService.stopTracking();
          setIsLocationTracking(false);
          Toast.show({
            type: 'info',
            text1: 'Ubicación detenida automáticamente',
            text2: 'No hay entregas pendientes',
            text1Style: toastTextOneStyle,
          });
        } catch (error) {
          reportLocationTrackingError('runtime', error, {
            phase: 'auto_stop',
            pendingCount: visitasPendientes.length,
            wasTracking: isLocationTracking,
          });
        }
      }, 1000);
    }
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [visitasPendientes.length, isLocationTracking, ordenEntrega, subdominio, despacho, user?.id]);

  // === Sincronizar estado real del tracking ===
  useEffect(() => {
    const checkAndSyncTrackingStatus = () => {
      try {
        const isTracking = backgroundGeolocationService.isTrackingActive();
        if (isTracking !== isLocationTracking) {
          setIsLocationTracking(isTracking);
        }
      } catch (error) {
        reportLocationTrackingError('runtime', error, {
          phase: 'status_sync',
          localState: isLocationTracking,
        });
      }
    };
    checkAndSyncTrackingStatus();
    const interval = setInterval(checkAndSyncTrackingStatus, 5000);
    return () => clearInterval(interval);
  }, [isLocationTracking]);

  const handleToggleLocationTracking = async () => {
    if (!ordenEntrega || !subdominio || !despacho || !user?.id) {
      Toast.show({
        type: 'error',
        text1: 'Configuración incompleta',
        text2: 'Faltan datos necesarios para el tracking',
        text1Style: toastTextOneStyle,
      });
      return;
    }
    setIsTogglingLocation(true);
    try {
      if (isLocationTracking) {
        await backgroundGeolocationService.stopTracking();
        setIsLocationTracking(false);
      } else {
        await backgroundGeolocationService.startTracking({
          schemaName: subdominio,
          despacho: parseInt(despacho, 10),
          usuarioId: user.id,
        });
        setIsLocationTracking(true);
      }
    } catch (error) {
      reportLocationTrackingError('runtime', error, {
        phase: 'toggle_tracking',
        action: isLocationTracking ? 'stop' : 'start',
      });
      Toast.show({
        type: 'error',
        text1: 'Error al cambiar el estado',
        text1Style: toastTextOneStyle,
      });
    } finally {
      setIsTogglingLocation(false);
    }
  };

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
      return;
    }
    setIsRetrying(true);
    dispatch(setSyncing(true));
    try {
      const visitasConErrorIds = visitasConError.map(v => v.id);
      const novedadesConErrorIds = novedadesConError.map(n => n.id);
      await reintentarNovedadesConError(novedadesConErrorIds);
      await reintentarSolucionesConError(novedadesConErrorIds);
      await reintentarVisitasConError(visitasConErrorIds);
    } catch {
      Toast.show({
        type: 'error',
        text1: 'Error al reintentar',
        text2: 'Inténtalo nuevamente.',
        text1Style: toastTextOneStyle,
      });
    } finally {
      setIsRetrying(false);
      dispatch(setSyncing(false));
    }
  };

  const handleOpenWhatsApp = () => {
    Linking.openURL(`whatsapp://send?phone=${WHATSAPP_NUMBER}`);
  };

  const navigation =
    useNavigation<BottomTabNavigationProp<MainTabParamList>>();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={authColors.background}
        translucent={false}
      />
      <AppBar
        title="Inicio"
        subtitle={
          hayActividad
            ? `${agregado.ordenesEnCurso} ${
                agregado.ordenesEnCurso === 1 ? 'orden' : 'órdenes'
              } en curso`
            : undefined
        }
      />
      <View style={styles.content}>
        {hayActividad ? (
          <>
            {/* ===== Hero: total agregado de TODAS las ordenes ===== */}
            <TouchableOpacity
              style={styles.heroCard}
              onPress={() => navigation.navigate('Visitas')}
              activeOpacity={0.85}
            >
              <View style={styles.heroTopRow}>
                <View style={styles.heroIcon}>
                  <Ionicons
                    name="cube-outline"
                    size={22}
                    color={authColors.brandInk}
                  />
                </View>
                <View style={styles.heroBody}>
                  <Text style={styles.heroTitulo}>
                    {agregado.ordenesEnCurso === 0
                      ? `${Object.keys(snapshots).length} ${
                          Object.keys(snapshots).length === 1 ? 'orden' : 'órdenes'
                        }`
                      : `${agregado.ordenesEnCurso} ${
                          agregado.ordenesEnCurso === 1 ? 'orden' : 'órdenes'
                        } en curso`}
                  </Text>
                  <Text style={styles.heroSubtitulo}>
                    {agregado.entregadasTotal} de {agregado.visitasTotal}{' '}
                    entregadas
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={authColors.inkMuted}
                />
              </View>

              {agregado.visitasTotal > 0 && (
                <>
                  <View style={styles.progressTrack}>
                    <View
                      style={[
                        styles.progressFill,
                        { width: `${agregado.progreso}%` },
                      ]}
                    />
                  </View>
                  <View style={styles.progressLabels}>
                    <Text style={styles.progressTexto}>Ver mis órdenes</Text>
                    <Text style={styles.progressPct}>{agregado.progreso}%</Text>
                  </View>
                </>
              )}
            </TouchableOpacity>

            {/* ===== Stats agregadas ===== */}
            <View style={styles.statsRow}>
              <View style={styles.statBlock}>
                <Text style={styles.statNumero}>{agregado.pendientesTotal}</Text>
                <Text style={styles.statLabel}>Pendientes</Text>
              </View>
              <View style={styles.statDivisor} />
              <View style={styles.statBlock}>
                <Text style={styles.statNumero}>{agregado.novedadesTotal}</Text>
                <Text style={styles.statLabel}>Novedades</Text>
              </View>
              <View style={styles.statDivisor} />
              <View style={styles.statBlock}>
                <Text
                  style={[
                    styles.statNumero,
                    agregado.erroresTotal > 0 && styles.statNumeroError,
                  ]}
                >
                  {agregado.erroresTotal}
                </Text>
                <Text style={styles.statLabel}>Con error</Text>
              </View>
            </View>

            {/* ===== Aviso de pendientes de sincronizar (no auto-retry desde
                aqui: el reintentar vive dentro de cada detalle, sino habria
                que restaurar/sync/guardar cada snapshot — feature aparte). */}
            {agregado.erroresRetryablesTotal > 0 && (
              <TouchableOpacity
                style={styles.syncCard}
                onPress={() => navigation.navigate('Visitas')}
                activeOpacity={0.85}
              >
                <View style={styles.syncIcon}>
                  <Ionicons
                    name="sync-outline"
                    size={20}
                    color={authColors.brandInk}
                  />
                </View>
                <View style={styles.syncBody}>
                  <Text style={styles.syncTitulo}>
                    {agregado.erroresRetryablesTotal} entrega
                    {agregado.erroresRetryablesTotal === 1 ? '' : 's'} con error
                  </Text>
                  <Text style={styles.syncSubtitulo}>
                    Abrí la orden y reintentá el envío desde ahí
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={authColors.inkMuted}
                />
              </TouchableOpacity>
            )}

            {/* ===== Toggle de ubicación — solo si hay una orden con
                tracking config en settings (la ultima abierta) ===== */}
            {ordenEntrega && (
            <View style={styles.toggleCard}>
              <View style={styles.toggleIcon}>
                <Ionicons
                  name="location-outline"
                  size={20}
                  color={
                    isLocationTracking
                      ? authColors.brandInk
                      : authColors.inkMuted
                  }
                />
              </View>
              <View style={styles.toggleBody}>
                <Text style={styles.toggleTitulo}>Ubicación en vivo</Text>
                <Text style={styles.toggleSubtitulo}>
                  {isLocationTracking
                    ? 'Tu posición se está enviando'
                    : 'No estás enviando tu posición'}
                </Text>
              </View>
              <Switch
                value={isLocationTracking}
                onValueChange={handleToggleLocationTracking}
                disabled={isTogglingLocation}
                trackColor={{
                  false: authColors.border,
                  true: authColors.brandInk,
                }}
                thumbColor="#FFFFFF"
                ios_backgroundColor={authColors.border}
              />
            </View>
            )}
          </>
        ) : (
          /* ===== Empty state: sin actividad ===== */
          <View style={styles.emptyCard}>
            <View style={styles.emptyIcon}>
              <Ionicons
                name="cube-outline"
                size={28}
                color={authColors.brandInk}
              />
            </View>
            <Text style={styles.emptyTitulo}>Sin trabajo activo</Text>
            <Text style={styles.emptySubtitulo}>
              Andá a la pestaña <Text style={styles.emptyBold}>Entregas</Text>{' '}
              para ver tus órdenes asignadas y empezar el día.
            </Text>
          </View>
        )}
      </View>

      {/* ===== FAB de soporte ===== */}
      <TouchableOpacity
        style={styles.whatsappButton}
        onPress={handleOpenWhatsApp}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel="Soporte por WhatsApp"
      >
        <Ionicons name="logo-whatsapp" size={26} color="#FFFFFF" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: authColors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  // ----- Hero -----
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: authColors.border,
    marginBottom: 14,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  heroIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(27, 155, 215, 0.10)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroBody: {
    flex: 1,
  },
  heroTitulo: {
    fontSize: 14,
    color: authColors.inkSoft,
    fontWeight: '600',
  },
  heroSubtitulo: {
    fontSize: 15.5,
    fontWeight: '700',
    color: authColors.ink,
    marginTop: 2,
  },
  heroOrdenId: {
    color: authColors.inkMuted,
    fontWeight: '600',
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: authColors.border,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: authColors.brandInk,
    borderRadius: 4,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  progressTexto: {
    fontSize: 12.5,
    color: authColors.inkSoft,
    fontWeight: '500',
  },
  progressPct: {
    fontSize: 12.5,
    color: authColors.brandInk,
    fontWeight: '700',
  },
  // ----- Stats compactas -----
  statsRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: authColors.border,
    marginBottom: 14,
  },
  statBlock: {
    flex: 1,
    alignItems: 'center',
  },
  statNumero: {
    fontSize: 22,
    fontWeight: '800',
    color: authColors.ink,
    letterSpacing: -0.4,
  },
  statNumeroError: {
    color: authColors.danger,
  },
  statLabel: {
    fontSize: 12,
    color: authColors.inkSoft,
    marginTop: 2,
    fontWeight: '500',
  },
  statDivisor: {
    width: 1,
    backgroundColor: authColors.border,
  },
  // ----- Sync card -----
  syncCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1.5,
    borderColor: authColors.brandInk,
    gap: 12,
    marginBottom: 14,
  },
  syncCardDisabled: {
    opacity: 0.6,
  },
  syncIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(27, 155, 215, 0.10)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  syncBody: {
    flex: 1,
  },
  syncTitulo: {
    fontSize: 14.5,
    fontWeight: '700',
    color: authColors.ink,
  },
  syncSubtitulo: {
    fontSize: 12.5,
    color: authColors.inkSoft,
    marginTop: 2,
  },
  // ----- Toggle de ubicación -----
  toggleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: authColors.border,
    gap: 12,
  },
  toggleIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(27, 155, 215, 0.10)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleBody: {
    flex: 1,
  },
  toggleTitulo: {
    fontSize: 14.5,
    fontWeight: '700',
    color: authColors.ink,
  },
  toggleSubtitulo: {
    fontSize: 12.5,
    color: authColors.inkSoft,
    marginTop: 2,
  },
  // ----- Empty state -----
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 32,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: authColors.border,
    alignItems: 'center',
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(27, 155, 215, 0.10)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  emptyTitulo: {
    fontSize: 17,
    fontWeight: '800',
    color: authColors.ink,
    letterSpacing: -0.2,
  },
  emptySubtitulo: {
    fontSize: 14,
    color: authColors.inkSoft,
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 6,
  },
  emptyBold: {
    fontWeight: '700',
    color: authColors.ink,
  },
  // ----- WhatsApp FAB -----
  whatsappButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#25D366',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
});
