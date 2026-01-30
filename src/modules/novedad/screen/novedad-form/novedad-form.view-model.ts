import { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStackParamList } from '../../../../navigation/types';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import { selectSubdominio } from '../../../settings';
import { useNovedadTipos } from '../../view-models/novedad.view-model';
import { NovedadFormData } from '../../interfaces/novedad.interface';
import { novedadValidationRules } from '../../constants/novedad.constant';
import {
  limpiarSeleccionVisitas,
  marcarVisitaConNovedad,
} from '../../../visita/store/slice/visita.slice';
import { useNovedadCreation } from '../../hooks/use-novedad-creation.hook';
import {
  guardarNovedad,
  limpiarSeleccionNovedades,
  revertirNovedadOptimista,
} from '../../store/slice/novedad.slice';
import Toast from 'react-native-toast-message';
import { toastTextOneStyle } from '../../../../shared/styles/global.style';
import { generateTempId } from '../../../../shared/utils/id-generator.util';
import { generateMovilToken } from '../../utils/novedad-form-data-builder.util';

type NavigationProp = NativeStackNavigationProp<
  MainStackParamList,
  'NovedadForm'
>;

export const useNovedadFormViewModel = (
  visitasSeleccionadas: string[],
  navigation: NavigationProp,
) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const subdominio = useAppSelector(selectSubdominio);
  const dispatch = useAppDispatch();
  const { crearNuevasNovedades } = useNovedadCreation();

  const {
    data: novedadTiposResponse,
    isLoading: isLoadingTipos,
    error: tiposError,
    refetch: refetchTipos,
  } = useNovedadTipos(subdominio || '', !!subdominio);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm<NovedadFormData>({
    defaultValues: {
      tipo: '',
      descripcion: '',
      foto: [],
    },
    mode:'onChange'
  });

  const tiposOptions =
    novedadTiposResponse?.results?.map(tipo => ({
      label: tipo.nombre,
      value: tipo.id.toString(),
    })) || [];

  const goBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const onSubmitForm = useCallback(
    async (data: NovedadFormData) => {
      if (isSubmitting) return;

      setIsSubmitting(true);

      // 1. Preparar formularios con IDs temporales
      const formularios: NovedadFormData[] = visitasSeleccionadas.map(id => {
        return {
          id: generateTempId(),
          visitaId: parseInt(id, 10),
          tipo: data.tipo,
          descripcion: data.descripcion?.trim() === '' ? null : data.descripcion,
          foto: data.foto,
          movil_token: generateMovilToken(),
        };
      });

      // 2. OPTIMISTIC UPDATE: Crear novedades en Redux inmediatamente
      formularios.forEach(formulario => {
        const novedadData = {
          id: formulario.id,
          visita_id: formulario.visitaId,
          novedad_tipo_id: parseInt(formulario.tipo, 10),
          fecha: new Date().toISOString(),
          descripcion: formulario.descripcion,
          imagenes: formulario.foto.map(foto => ({ uri: foto.uri })),
          estado: 'sync' as const,
          estado_solucion: 'pending' as const,
          movil_token: formulario.movil_token,
          datos_formulario_guardados: formulario,
        };

        // Guardar novedad en Redux
        dispatch(guardarNovedad({ novedad: novedadData }));

        // Marcar visita con novedad
        dispatch(marcarVisitaConNovedad(formulario.visitaId));
      });

      // 3. Limpiar selecciones y navegar atrás INMEDIATAMENTE
      dispatch(limpiarSeleccionVisitas());
      dispatch(limpiarSeleccionNovedades());
      navigation.goBack();

      // 4. Procesar en background (la petición continúa después de navegar)
      const batchResult = await crearNuevasNovedades(formularios, {
        logPrefix: 'Novedad',
        messagePrefix: 'novedad',
        showToasts: false, // Mostramos toasts manualmente
        clearSelectionsOnSuccess: false, // Ya limpiamos arriba
        updateExisting: true, // Modo optimistic update: novedades ya existen en Redux
      });

      // 5. Procesar resultados individuales
      batchResult.results.forEach(result => {
        if (result.success && result.novedadId) {
          // Success: Limpiar datos guardados y confirmar estado sync
          const novedad = formularios.find(f => f.id === result.datosFormulario.id);
          if (novedad) {
            // La novedad ya está en estado sync, solo actualizamos el ID real si es necesario
            // (esto ya lo hace crearNuevasNovedades internamente)
          }
        } else {
          // ROLLBACK: Revertir optimistic update
          // ✅ Extraer isRetryable del apiError (viene del error interceptor)
          const esErrorRetryable = result.apiError?.isRetryable ?? true; // Default a true por seguridad

          dispatch(
            revertirNovedadOptimista({
              novedadId: result.datosFormulario.id,
              datosFormulario: result.datosFormulario,
              error: result.error || 'Error al procesar novedad',
              esErrorRetryable, // ✅ Usar el valor del error interceptor
            }),
          );
        }
      });

      // 6. Mostrar mensajes según resultados
      if (batchResult.successCount > 0 && batchResult.errorCount === 0) {
        Toast.show({
          type: 'success',
          text1: `${batchResult.successCount} novedad(es) exitosa(s)`,
          text1Style: toastTextOneStyle,
        });
      } else if (batchResult.errorCount > 0 && batchResult.successCount === 0) {
        Toast.show({
          type: 'error',
          text1: 'Error en la novedad',
          text2: 'Puede reintentar desde la lista.',
          text1Style: toastTextOneStyle,
        });
      } else if (batchResult.errorCount > 0 && batchResult.successCount > 0) {
        Toast.show({
          type: 'info',
          text1: `${batchResult.successCount} exitosa(s), ${batchResult.errorCount} fallida(s)`,
          text2: 'Puede reintentar las fallidas.',
          text1Style: toastTextOneStyle,
        });
      }

      setIsSubmitting(false);
    },
    [
      visitasSeleccionadas,
      isSubmitting,
      dispatch,
      crearNuevasNovedades,
      navigation,
    ],
  );

  const onSubmit = handleSubmit(onSubmitForm);

  // === RETORNO DEL VIEWMODEL ===
  return {
    // Datos
    visitasSeleccionadas,

    // Estado
    isSubmitting,

    // Formulario
    control,
    errors,
    isValid,
    validationRules: novedadValidationRules,

    // Tipos de novedad
    tiposOptions,
    isLoadingTipos,
    tiposError,
    refetchTipos,

    // Acciones
    goBack,
    onSubmit,
    reset,
  };
};

export type NovedadFormViewModel = ReturnType<typeof useNovedadFormViewModel>;
