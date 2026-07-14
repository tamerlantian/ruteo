import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Linking,
  ScrollView,
  RefreshControl,
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useAuth } from '../../auth/context/auth.context';
import { useAppSelector } from '../../../store/hooks';
import { MainTabParamList } from '../../../navigation/types';
import { verticalRepository } from '../../vertical/repositories/vertical.repository';
import { Entrega } from '../../vertical/interfaces/entrega.interface';
import { WHATSAPP_NUMBER } from '../../../config/environment';
import { authColors } from '../../auth/styles/auth.theme';
import { AppBar } from '../../../shared/components/ui/app-bar/app-bar.component';
import { esVisitaPendiente } from '../../visita/utils/visita-estado.util';

const DIAS = [
  'Domingo',
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
];
const MESES = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
];

export const DashboardScreen = () => {
  const { user } = useAuth();
  const navigation = useNavigation<BottomTabNavigationProp<MainTabParamList>>();

  // Órdenes asignadas por el server (incluye las que el conductor aún no abrió).
  const [ordenesServer, setOrdenesServer] = useState<Entrega[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const snapshots = useAppSelector(
    state => state.visita.snapshotsByDespacho ?? {},
  );

  const cargarAsignadas = useCallback(async () => {
    try {
      const data = await verticalRepository.getMisDespachos();
      setOrdenesServer(data ?? []);
    } catch {
      // Best-effort: en el home no spameamos toasts de error de red.
    }
  }, []);

  useEffect(() => {
    cargarAsignadas();
  }, [cargarAsignadas]);

  // Refresca al volver al tab Inicio (ej. tras trabajar una orden).
  useFocusEffect(
    useCallback(() => {
      cargarAsignadas();
    }, [cargarAsignadas]),
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await cargarAsignadas();
    setRefreshing(false);
  }, [cargarAsignadas]);

  // === Resumen del día: combina órdenes del server + snapshots locales ===
  // Para cada orden activa (no completada) prefiere el detalle local (snapshot)
  // y, si el conductor aún no la abrió, usa los conteos del server. Así el home
  // refleja también las órdenes asignadas nuevas, no solo las ya trabajadas.
  const resumen = useMemo(() => {
    const idsServer = new Set(ordenesServer.map(o => o.id));
    const locales: Entrega[] = Object.values(snapshots)
      .map(s => s.entrega)
      .filter((e): e is Entrega => !!e && !idsServer.has(e.id));
    const todas = [...ordenesServer, ...locales];

    let visitasTotal = 0;
    let entregadasTotal = 0;
    let pendientesTotal = 0;
    let novedadesTotal = 0;
    let erroresTotal = 0;
    let erroresRetryablesTotal = 0;
    let ordenesEnCurso = 0;
    let activas = 0;

    todas.forEach(o => {
      const snap = snapshots[o.id];
      const vs = snap?.visitas ?? [];
      const tieneDetalle = vs.length > 0;
      const visitas = tieneDetalle ? vs.length : o.visitas || 0;
      const entregadas = tieneDetalle
        ? vs.filter(v => v.estado_entregado).length
        : Math.round(o.visitas_entregadas || 0);

      // Completada → no aporta a "lo que falta".
      if (visitas > 0 && entregadas >= visitas) {
        return;
      }
      activas += 1;
      visitasTotal += visitas;
      entregadasTotal += entregadas;
      if (entregadas > 0) {
        ordenesEnCurso += 1;
      }

      if (tieneDetalle) {
        pendientesTotal += vs.filter(esVisitaPendiente).length;
        novedadesTotal += vs.filter(v => v.estado_novedad).length;
        const errores = vs.filter(v => v.estado === 'error');
        erroresTotal += errores.length;
        erroresRetryablesTotal += errores.filter(
          v => v.es_error_retryable !== false,
        ).length;
      } else {
        // Sin detalle local: estimamos pendientes con los conteos del server.
        pendientesTotal += Math.max(0, visitas - entregadas);
      }
    });

    const progreso =
      visitasTotal > 0 ? Math.round((entregadasTotal / visitasTotal) * 100) : 0;
    return {
      activas,
      ordenesEnCurso,
      visitasTotal,
      entregadasTotal,
      pendientesTotal,
      novedadesTotal,
      erroresTotal,
      erroresRetryablesTotal,
      progreso,
    };
  }, [ordenesServer, snapshots]);

  const hayActividad = resumen.activas > 0;

  // Saludo + fecha (sin Intl para compatibilidad con Hermes).
  const { saludo, fecha } = useMemo(() => {
    const ahora = new Date();
    const h = ahora.getHours();
    const s =
      h < 12 ? 'Buenos días' : h < 19 ? 'Buenas tardes' : 'Buenas noches';
    return {
      saludo: s,
      fecha: `${DIAS[ahora.getDay()]}, ${ahora.getDate()} de ${
        MESES[ahora.getMonth()]
      }`,
    };
  }, []);
  const primerNombre =
    user?.nombre?.trim().split(/\s+/)[0] ||
    user?.nombre_corto ||
    user?.username ||
    '';

  const handleOpenWhatsApp = () => {
    Linking.openURL(`whatsapp://send?phone=${WHATSAPP_NUMBER}`);
  };

  const irAEntregas = useCallback(
    () => navigation.navigate('Visitas'),
    [navigation],
  );

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
            ? `${resumen.activas} ${
                resumen.activas === 1 ? 'orden activa' : 'órdenes activas'
              }`
            : undefined
        }
      />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={authColors.brandInk}
            colors={[authColors.brandInk]}
          />
        }
      >
        {/* ===== Saludo + fecha ===== */}
        <View style={styles.greetingBlock}>
          <Text style={styles.saludo}>
            {saludo}
            {primerNombre ? `, ${primerNombre}` : ''}
          </Text>
          <Text style={styles.fecha}>{fecha}</Text>
        </View>

        {hayActividad ? (
          <>
            {/* ===== Hero: total agregado de TODAS las ordenes ===== */}
            <TouchableOpacity
              style={styles.heroCard}
              onPress={irAEntregas}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel="Ver mis órdenes"
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
                    {resumen.ordenesEnCurso > 0
                      ? `${resumen.ordenesEnCurso} ${
                          resumen.ordenesEnCurso === 1 ? 'orden' : 'órdenes'
                        } en curso`
                      : `${resumen.activas} ${
                          resumen.activas === 1 ? 'orden' : 'órdenes'
                        }`}
                  </Text>
                  <Text style={styles.heroSubtitulo}>
                    {resumen.entregadasTotal} de {resumen.visitasTotal}{' '}
                    entregadas
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={authColors.inkMuted}
                />
              </View>

              {resumen.visitasTotal > 0 && (
                <>
                  <View style={styles.progressTrack}>
                    <View
                      style={[
                        styles.progressFill,
                        { width: `${resumen.progreso}%` },
                      ]}
                    />
                  </View>
                  <View style={styles.progressLabels}>
                    <Text style={styles.progressTexto}>Ver mis órdenes</Text>
                    <Text style={styles.progressPct}>{resumen.progreso}%</Text>
                  </View>
                </>
              )}
            </TouchableOpacity>

            {/* ===== Stats agregadas (tappables) ===== */}
            <View style={styles.statsRow}>
              <TouchableOpacity
                style={styles.statBlock}
                onPress={irAEntregas}
                activeOpacity={0.6}
              >
                <Text style={styles.statNumero}>{resumen.pendientesTotal}</Text>
                <Text style={styles.statLabel}>Pendientes</Text>
              </TouchableOpacity>
              <View style={styles.statDivisor} />
              <TouchableOpacity
                style={styles.statBlock}
                onPress={irAEntregas}
                activeOpacity={0.6}
              >
                <Text style={styles.statNumero}>{resumen.novedadesTotal}</Text>
                <Text style={styles.statLabel}>Novedades</Text>
              </TouchableOpacity>
              <View style={styles.statDivisor} />
              <TouchableOpacity
                style={styles.statBlock}
                onPress={irAEntregas}
                activeOpacity={0.6}
              >
                <Text
                  style={[
                    styles.statNumero,
                    resumen.erroresTotal > 0 && styles.statNumeroError,
                  ]}
                >
                  {resumen.erroresTotal}
                </Text>
                <Text style={styles.statLabel}>Con error</Text>
              </TouchableOpacity>
            </View>

            {/* ===== Aviso de pendientes de sincronizar ===== */}
            {resumen.erroresRetryablesTotal > 0 && (
              <TouchableOpacity
                style={styles.syncCard}
                onPress={irAEntregas}
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
                    {resumen.erroresRetryablesTotal} entrega
                    {resumen.erroresRetryablesTotal === 1 ? '' : 's'} con error
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
              No tienes órdenes asignadas por ahora. Desliza hacia abajo para
              actualizar.
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={irAEntregas}
              activeOpacity={0.85}
            >
              <Text style={styles.emptyButtonText}>Ver entregas</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

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
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 100,
  },
  // ----- Saludo -----
  greetingBlock: {
    marginBottom: 16,
  },
  saludo: {
    fontSize: 22,
    fontWeight: '800',
    color: authColors.ink,
    letterSpacing: -0.3,
  },
  fecha: {
    fontSize: 13.5,
    color: authColors.inkSoft,
    marginTop: 2,
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
  emptyButton: {
    marginTop: 18,
    backgroundColor: authColors.brandInk,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 10,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
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
