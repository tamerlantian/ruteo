import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import DraggableFlatList, {
  RenderItemParams,
  ScaleDecorator,
  DragEndParams,
} from 'react-native-draggable-flatlist';
import Ionicons from '@react-native-vector-icons/ionicons';
import BottomSheet from '@gorhom/bottom-sheet';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import CustomBottomSheet from '../../../../shared/components/bottom-sheet/bottom-sheet';
import {
  AppBar,
  AppBarAction,
} from '../../../../shared/components/ui/app-bar/app-bar.component';
import VisitaCardComponent from '../../components/visita-card/visita-card.component';
import { VisitasHeader } from '../../components/visitas-header/visitas-header.component';
import { VisitasFloatingActions } from '../../components/visita-floating-actions/visitas-floating-actions.component';
import { VisitasLoadingFooter } from '../../components/visitas-loading-footer/visitas-loading-footer.component';
import { VisitasOptionsComponent } from '../../components/visitas-options/visitas-options.component';
import { SyncBanner } from '../../components/sync-banner/sync-banner.component';
import { NovedadesBody } from '../../../novedad/components/novedades-body/novedades-body.component';
import {
  OrderBottomNav,
  OrderVista,
} from '../../components/order-bottom-nav/order-bottom-nav.component';
import { RutaMapaView } from '../ruta-mapa/ruta-mapa-view.component';
import { ConfirmacionDesvincularComponent } from '../../components/confirmacion-desvincular/confirmacion-desvincular.component';
import { VisitaDetalleEntregadaComponent } from '../../components/visita-detalle-entregada/visita-detalle-entregada.component';
import {
  selectConteoVisitasQueImpidenDesvinculacion,
  selectPuedeDesvincular,
} from '../../store/selector/visita.selector';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import {
  guardarSnapshotVisitas,
  restaurarSnapshotVisitas,
  removerVisitas,
  descartarSnapshotVisitas,
} from '../../store/slice/visita.slice';
import {
  guardarSnapshotNovedades,
  restaurarSnapshotNovedades,
  limpiarNovedades,
  descartarSnapshotNovedades,
} from '../../../novedad/store/slice/novedad.slice';
import { useCargarOrden } from '../../hooks/use-cargar-orden.hook';
import { useAutoSync } from '../../hooks/use-auto-sync.hook';
import { useAuth } from '../../../auth/context/auth.context';
import { prettifyEmpresa } from '../../utils/whatsapp-message.util';
import { backgroundGeolocationService } from '../../../../shared/services';
import { VisitaResponse } from '../../interfaces/visita.interface';
import { MainStackParamList } from '../../../../navigation/types';
import { useVisitasViewModel } from '../visitas/visitas.view-model';
import { visitasStyles } from '../visitas/visitas.style';

type DetalleRouteProp = RouteProp<MainStackParamList, 'EntregasDetalle'>;
type NavigationProp = NativeStackNavigationProp<
  MainStackParamList,
  'EntregasDetalle'
>;

/**
 * Pantalla de detalle de una orden. Se llega via push desde la pantalla de
 * lista (Entregas tab). Toda la logica de trabajo sobre las visitas vive
 * aca: filtros, busqueda, entregar, novedad, desvincular.
 *
 * Mount: restaura el snapshot local de la orden (si existe) y dispara
 *        cargarOrden para refrescar contra el server.
 * Unmount: guarda snapshot (visitas + novedades) y detiene la
 *          geolocalizacion. Al volver a la lista el conductor "deja"
 *          esta orden en pausa con su progreso intacto.
 */
export const EntregasDetalleScreen = () => {
  const route = useRoute<DetalleRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const dispatch = useAppDispatch();
  const cargarOrden = useCargarOrden();
  // Reintenta solo las entregas "sin enviar" en cuanto vuelve la conexión.
  useAutoSync();
  const { entrega } = route.params;
  const entregaId = entrega.id;
  // Si el conductor desvinculo, los snapshots ya se borraron — el unmount
  // NO debe re-crearlos. Este ref lo gobierna.
  const desvinculadoRef = useRef(false);

  useEffect(() => {
    // Restaura snapshot (no-op si no hay) y carga la orden contra el server.
    // El merge en cargarVisitasThunk.fulfilled preserva los campos locales.
    dispatch(restaurarSnapshotVisitas(entregaId));
    dispatch(restaurarSnapshotNovedades(entregaId));
    cargarOrden(entrega).catch(() => {
      // El hook ya muestra el toast; el caller no necesita reaccionar.
    });

    return () => {
      if (desvinculadoRef.current) {
        // Desvinculacion explicita: ya se borraron snapshots y state.
        backgroundGeolocationService.cleanup().catch(() => {});
        return;
      }
      // Back normal: pausamos la orden (snapshot con metadata) y limpiamos
      // state.visitas/novedades para que la proxima Detail no herede los
      // datos residuales de esta.
      dispatch(guardarSnapshotVisitas({ entregaId, entrega }));
      dispatch(guardarSnapshotNovedades({ entregaId, entrega }));
      dispatch(removerVisitas());
      dispatch(limpiarNovedades());
      backgroundGeolocationService.cleanup().catch(() => {});
    };
  }, [entregaId, entrega, dispatch, cargarOrden]);

  const {
    openOptionsSheet,
    visitas,
    keyExtractor,
    onRefresh,
    refreshing,
    isLoading,
    activeFilter,
    pendingCount,
    errorCount,
    erroresCount,
    novedadesCount,
    deliveredCount,
    totalCount,
    searchValue,
    onSearchChange,
    onScanResult,
    onClearFilters,
    listConfig,
    optionsBottomSheetRef,
    confirmacionBottomSheetRef,
    handleDesvincular,
    confirmarDesvinculacion,
    cancelarDesvinculacion,
    clearSelection,
    deliverSelectedVisitas,
    retrySelectedVisitas,
    reportNovedadSelectedVisitas,
    onFilterChange,
    isRetryLoading,
    totalSeleccionadas,
    totalConErrorSeleccionadas,
    selectAllErrors,
    anularSelectedVisitas,
    reordenarPendientes,
    canReorder,
    sincronizarTodo,
  } = useVisitasViewModel();

  // Si la orden ya esta completada al entrar (todas las visitas entregadas),
  // saltamos al filtro "Entregadas" — sino veriamos lista vacia bajo
  // "Pendientes" sin saber por que. Solo se dispara en la primera carga
  // (no en el momento que el conductor entrega la ultima visita en vivo,
  // ahi seria intrusivo).
  const filtroInicialAjustadoRef = useRef(false);
  useEffect(() => {
    if (filtroInicialAjustadoRef.current) {
      return;
    }
    if (totalCount > 0) {
      filtroInicialAjustadoRef.current = true;
      if (deliveredCount >= totalCount) {
        onFilterChange('entregadas');
      }
    }
  }, [totalCount, deliveredCount, onFilterChange]);

  const puedeDesvincular = useAppSelector(selectPuedeDesvincular);
  const conteoVisitas = useAppSelector(
    selectConteoVisitasQueImpidenDesvinculacion,
  );

  // Sheet de "Detalle de entrega": al tapear una visita ya entregada el card
  // dispara onVerDetalle y abrimos el sheet con los datos cacheados de esa
  // visita. No es accion (no re-entregamos) — es solo lectura.
  const detalleEntregaSheetRef = useRef<BottomSheet>(null);
  const [visitaDetalle, setVisitaDetalle] = useState<VisitaResponse | null>(
    null,
  );
  const abrirDetalleEntrega = useCallback((visita: VisitaResponse) => {
    setVisitaDetalle(visita);
    detalleEntregaSheetRef.current?.expand();
  }, []);
  const cerrarDetalleEntrega = useCallback(() => {
    setVisitaDetalle(null);
  }, []);

  // La empresa viene DE LA ORDEN (un conductor trabaja para varias). Usamos el
  // nombre real que expone el back (empresa_nombre); si no viene, caemos al
  // schema_name prettificado. El conductor es el usuario logueado.
  const { user } = useAuth();
  const empresaNombre = useMemo(
    () => entrega.empresa_nombre || prettifyEmpresa(entrega.schema_name),
    [entrega.empresa_nombre, entrega.schema_name],
  );
  // Prioriza `nombre` (el campo editable del perfil) sobre `nombre_corto`,
  // para que el nombre que el conductor edita sí aparezca en el mensaje.
  const conductorNombre = user?.nombre || user?.nombre_corto || undefined;

  const renderVisitaItem = useCallback(
    ({ item, drag, isActive, getIndex }: RenderItemParams<VisitaResponse>) => (
      <ScaleDecorator>
        <VisitaCardComponent
          visita={item}
          index={getIndex() ?? 0}
          onVerDetalle={abrirDetalleEntrega}
          draggable={canReorder}
          drag={drag}
          isDragging={isActive}
          empresaNombre={empresaNombre}
          conductorNombre={conductorNombre}
        />
      </ScaleDecorator>
    ),
    [abrirDetalleEntrega, canReorder, empresaNombre, conductorNombre],
  );

  // Al soltar: persistimos la nueva secuencia de pendientes (solo aplica en
  // el filtro "Pendientes" sin busqueda; el reducer ignora el resto por guard).
  const handleDragEnd = useCallback(
    ({ data }: DragEndParams<VisitaResponse>) => {
      reordenarPendientes(data);
    },
    [reordenarPendientes],
  );

  // El banner de "sin sincronizar" lleva al filtro de la cola de envío.
  const verPendientesSync = useCallback(
    () => onFilterChange('error'),
    [onFilterChange],
  );

  // Estado vacío del filtro "Sincronizar": dejar claro que no quedó nada
  // pendiente de envío (antes se veía una lista vacía sin explicación).
  const renderEmpty = useCallback(() => {
    if (isLoading || activeFilter !== 'error') {
      return null;
    }
    return (
      <View style={emptyStyles.box}>
        <Ionicons
          name="checkmark-done-circle-outline"
          size={44}
          color="#1F7A38"
        />
        <Text style={emptyStyles.title}>Todo sincronizado</Text>
        <Text style={emptyStyles.sub}>
          No hay entregas pendientes de envío.
        </Text>
      </View>
    );
  }, [isLoading, activeFilter]);

  const contentContainerStyle = useMemo(
    () => ({
      flexGrow: 1,
      paddingBottom:
        totalSeleccionadas > 0 && activeFilter !== 'novedades' ? 120 : 0,
    }),
    [totalSeleccionadas, activeFilter],
  );

  // El back del native stack se maneja solo, pero ofrecemos un leading
  // explicito para que sea evidente al conductor.
  // Vista activa del bottom nav de la orden (entregas / mapa / novedades).
  const [vista, setVista] = useState<OrderVista>('entregas');

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  // Si confirmaron desvincular: marcamos el flag para que el unmount NO
  // recree el snapshot, borramos snapshots explicitamente, y volvemos a
  // la lista. Asi la orden desaparece efectivamente.
  const onDesvincularConfirmado = useCallback(async () => {
    desvinculadoRef.current = true;
    await confirmarDesvinculacion();
    dispatch(descartarSnapshotVisitas(entregaId));
    dispatch(descartarSnapshotNovedades(entregaId));
    navigation.goBack();
  }, [confirmarDesvinculacion, dispatch, entregaId, navigation]);

  return (
    <SafeAreaView style={visitasStyles.container}>
      <AppBar
        title={`Orden #${entregaId}`}
        subtitle={
          totalCount > 0
            ? `${deliveredCount} de ${totalCount} entregadas${
                novedadesCount > 0
                  ? ` · ${novedadesCount} novedad${
                      novedadesCount === 1 ? '' : 'es'
                    }`
                  : ''
              }`
            : undefined
        }
        leading={
          <AppBarAction
            icon="arrow-back-outline"
            label="Volver a la lista"
            onPress={handleBack}
          />
        }
        actions={
          <AppBarAction
            icon="ellipsis-horizontal"
            label="Más opciones"
            onPress={openOptionsSheet}
          />
        }
      />
      {/* Contenido por vista. Es flex:1 para que las acciones flotantes
          (position absolute bottom:0) queden JUSTO encima del bottom nav. */}
      <View style={styles.contenido}>
        {vista === 'entregas' && (
          <>
            <VisitasHeader
              activeFilter={activeFilter}
              onFilterChange={onFilterChange}
              pendingCount={pendingCount}
              errorCount={errorCount}
              erroresCount={erroresCount}
              novedadesCount={novedadesCount}
              entregadasCount={deliveredCount}
              searchValue={searchValue}
              onSearchChange={onSearchChange}
              onScanResult={onScanResult}
              onClearFilters={onClearFilters}
            />
            <SyncBanner
              pendientes={errorCount}
              isSyncing={isRetryLoading}
              onSincronizar={sincronizarTodo}
              onVerPendientes={verPendientesSync}
            />
            <DraggableFlatList
              data={visitas}
              renderItem={renderVisitaItem}
              keyExtractor={keyExtractor}
              onDragEnd={handleDragEnd}
              dragItemOverflow
              activationDistance={canReorder ? 12 : 10000}
              ListEmptyComponent={renderEmpty}
              ListFooterComponent={
                <VisitasLoadingFooter isLoading={isLoading} />
              }
              removeClippedSubviews={false}
              maxToRenderPerBatch={listConfig.MAX_TO_RENDER_PER_BATCH}
              initialNumToRender={listConfig.INITIAL_NUM_TO_RENDER}
              windowSize={listConfig.WINDOW_SIZE}
              updateCellsBatchingPeriod={listConfig.UPDATE_CELLS_BATCHING_PERIOD}
              refreshing={refreshing}
              onRefresh={onRefresh}
              containerStyle={visitasStyles.flatList}
              style={visitasStyles.flatList}
              contentContainerStyle={contentContainerStyle}
              showsVerticalScrollIndicator={false}
            />
            {activeFilter !== 'entregadas' && (
              <VisitasFloatingActions
                totalSeleccionadas={totalSeleccionadas}
                totalConError={totalConErrorSeleccionadas}
                activeFilter={activeFilter}
                isRetryLoading={isRetryLoading}
                onClearSelection={clearSelection}
                onDeliverVisitas={deliverSelectedVisitas}
                onRetryVisitas={retrySelectedVisitas}
                onNovedadVisitas={reportNovedadSelectedVisitas}
                onAnularVisitas={anularSelectedVisitas}
                onSelectAllErrors={selectAllErrors}
                totalErrorsInFilter={errorCount}
              />
            )}
          </>
        )}
        {vista === 'mapa' && <RutaMapaView />}
        {vista === 'novedades' && <NovedadesBody />}
      </View>
      <OrderBottomNav
        active={vista}
        onChange={setVista}
        novedadesCount={novedadesCount}
      />
      <CustomBottomSheet
        ref={optionsBottomSheetRef}
        enableDynamicSizing={false}
        initialSnapPoints={['25%']}
      >
        <VisitasOptionsComponent onDesvincular={handleDesvincular} />
      </CustomBottomSheet>
      <CustomBottomSheet
        ref={confirmacionBottomSheetRef}
        enableDynamicSizing={true}
        initialSnapPoints={['40%']}
      >
        <ConfirmacionDesvincularComponent
          onConfirmar={onDesvincularConfirmado}
          onCancelar={cancelarDesvinculacion}
          puedeDesvincular={puedeDesvincular}
          conteoVisitas={conteoVisitas}
        />
      </CustomBottomSheet>
      <CustomBottomSheet
        ref={detalleEntregaSheetRef}
        enableDynamicSizing={false}
        initialSnapPoints={['65%']}
        onDismiss={cerrarDetalleEntrega}
      >
        <VisitaDetalleEntregadaComponent visita={visitaDetalle} />
      </CustomBottomSheet>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  contenido: { flex: 1 },
});

const emptyStyles = StyleSheet.create({
  box: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
    gap: 6,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1c1c1e',
    marginTop: 6,
  },
  sub: {
    fontSize: 13.5,
    color: '#8e8e93',
    textAlign: 'center',
  },
});
