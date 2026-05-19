import { useCallback } from 'react';
import Toast from 'react-native-toast-message';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { cargarVisitasThunk } from '../store/thunk/visita.thunk';
import { updateSettingsThunk, selectSubdominio } from '../../settings';
import { useNovedadTipos } from '../../novedad/view-models/novedad.view-model';
import { backgroundGeolocationService } from '../../../shared/services';
import { useAuth } from '../../auth/context/auth.context';
import { Entrega } from '../../vertical/interfaces/entrega.interface';
import { toastTextOneStyle } from '../../../shared/styles/global.style';

/**
 * Carga un despacho/entrega resuelto en la app: persiste settings (subdominio,
 * despacho, ordenEntrega), dispara cargarVisitas, refetch de novedad tipos e
 * inicia la geolocalizacion en background. Muestra el toast de exito al final.
 *
 * Pensado para reutilizarse desde dos entradas:
 *   - "Cargar orden por codigo" (bottom sheet) — el caller hizo `getEntrega(codigo)`.
 *   - "Mis ordenes" — el caller ya tiene la entrega del listado.
 *
 * Los errores de cargarVisitas se propagan; el caller los maneja con su toast.
 */
export const useCargarOrden = () => {
  const dispatch = useAppDispatch();
  const subdominio = useAppSelector(selectSubdominio);
  const { user } = useAuth();
  const { refetch: refetchNovedadTipos } = useNovedadTipos(
    subdominio || '',
    !!subdominio,
  );

  return useCallback(
    async (entrega: Entrega) => {
      const { schema_name, despacho_id, id } = entrega;

      await dispatch(
        updateSettingsThunk({
          subdominio: schema_name,
          despacho: `${despacho_id}`,
          ordenEntrega: `${id}`,
        }),
      );

      const visitas = await dispatch(
        cargarVisitasThunk({
          schemaName: schema_name,
          despachoId: despacho_id,
        }),
      ).unwrap();

      try {
        await refetchNovedadTipos();
      } catch (novedadError) {
        console.warn('Error cargando tipos de novedad:', novedadError);
        Toast.show({
          type: 'error',
          text1: 'Error cargando tipos de novedad',
          text1Style: toastTextOneStyle,
        });
      }

      try {
        console.log('📍 Iniciando background geolocation tracking...');
        await backgroundGeolocationService.startTracking({
          schemaName: schema_name,
          despacho: despacho_id,
          usuarioId: user?.id || 0,
        });
        console.log('📍 Background geolocation iniciado correctamente');
      } catch (geoError) {
        console.warn('Error iniciando background geolocation:', geoError);
      }

      if (visitas.length > 0) {
        Toast.show({
          type: 'success',
          text1: 'Orden cargada correctamente',
          text1Style: toastTextOneStyle,
        });
      } else {
        Toast.show({
          type: 'success',
          text1: 'La orden está completada',
          text1Style: toastTextOneStyle,
        });
      }

      return visitas;
    },
    [dispatch, user, refetchNovedadTipos],
  );
};
