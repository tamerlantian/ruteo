import { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStackParamList } from '../../../../navigation/types';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import { selectSubdominio } from '../../../settings';
import { useNovedadTipos } from '../../view-models/novedad.view-model';
import { NovedadFormData } from '../../interfaces/novedad.interface';
import { novedadValidationRules } from '../../constants/novedad.constant';
import { guardarNovedad } from '../../store/slice/novedad.slice';
import { limpiarSeleccionVisitas } from '../../../visita/store/slice/visita.slice';
import { useNovedadProcessing } from '../../hooks/use-novedad-processing.hook';
import Toast from 'react-native-toast-message';
import { toastTextOneStyle } from '../../../../shared/styles/global.style';

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
  const { procesarNovedadesEnLote } = useNovedadProcessing();

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
  });

  const tiposOptions =
    novedadTiposResponse?.results?.map(tipo => ({
      label: tipo.nombre,
      value: tipo.id.toString(),
    })) || [];

  const goBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const finalizarProceso = useCallback(() => {
    dispatch(limpiarSeleccionVisitas());
    navigation.goBack();
  }, [dispatch, navigation]);

  const onSubmitForm = useCallback(
    async (data: NovedadFormData) => {
      if (isSubmitting) return;

      try {
        setIsSubmitting(true);
        const visitaIds = visitasSeleccionadas.map(id => parseInt(id, 10));

        // Guardar novedades en Redux ANTES del procesamiento para posibles reintentos futuros
        visitaIds.forEach(visitaId => {
          dispatch(
            guardarNovedad({
              visita_id: visitaId,
              novedad_tipo_id: parseInt(data.tipo, 10),
              fecha: new Date().toISOString(),
              descripcion: data.descripcion,
              imagenes: data.foto.map(foto => ({ uri: foto.uri })),
              estado_error: false,
            }),
          );
        });

        // Procesar novedades usando el hook de procesamiento
        await procesarNovedadesEnLote(visitaIds, data, {
          logPrefix: 'Novedad',
          messagePrefix: 'novedad',
          showToasts: true,
        });

        finalizarProceso();
      } catch (error) {
        console.error('Error general enviando novedades:', error);
        Toast.show({
          type: 'error',
          text1: 'Error al procesar las novedades',
          text1Style: toastTextOneStyle,
        });
      } finally {
        setIsSubmitting(false);
      }
    },
    [visitasSeleccionadas, isSubmitting, dispatch, finalizarProceso, procesarNovedadesEnLote],
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
