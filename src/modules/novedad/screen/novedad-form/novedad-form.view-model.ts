import { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStackParamList } from '../../../../navigation/types';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import { selectSubdominio } from '../../../settings';
import { useNovedadTipos } from '../../view-models/novedad.view-model';
import { NovedadFormData } from '../../interfaces/novedad.interface';
import { novedadValidationRules } from '../../constants/novedad.constant';
import { limpiarSeleccionVisitas } from '../../../visita/store/slice/visita.slice';
import { useNovedadCreation } from '../../hooks/use-novedad-creation.hook';
import Toast from 'react-native-toast-message';
import { toastTextOneStyle } from '../../../../shared/styles/global.style';
import { generateTempId } from '../../../../shared/utils/id-generator.util';

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
        const formularios: NovedadFormData[] = visitasSeleccionadas.map(id => {
          return {
            id: generateTempId(),
            visitaId: parseInt(id, 10),
            tipo: data.tipo,
            descripcion: data.descripcion,
            foto: data.foto,
          };
        });

        // Crear nuevas novedades usando el hook específico de creación
        await crearNuevasNovedades(formularios, {
          logPrefix: 'Novedad',
          messagePrefix: 'novedad',
          showToasts: true,
          clearSelectionsOnSuccess: true,
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
    [visitasSeleccionadas, isSubmitting, finalizarProceso, crearNuevasNovedades],
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
