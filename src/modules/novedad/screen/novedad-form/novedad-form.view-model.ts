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

type NavigationProp = NativeStackNavigationProp<MainStackParamList, 'NovedadForm'>;

export const useNovedadFormViewModel = (
  visitasSeleccionadas: string[], 
  navigation: NavigationProp
) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const subdominio = useAppSelector(selectSubdominio);
  const dispatch = useAppDispatch();

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

  const tiposOptions = novedadTiposResponse?.results?.map(tipo => ({
    label: tipo.nombre,
    value: tipo.id.toString(),
  })) || [];

  const goBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const onSubmitForm = useCallback(async (data: NovedadFormData) => {
    if (isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      const visitaIds = visitasSeleccionadas.map(id => parseInt(id, 10));

      visitaIds.forEach(visitaId => {
        dispatch(guardarNovedad({ 
          visita_id: visitaId,
          novedad_tipo_id: parseInt(data.tipo, 10),
          fecha: new Date().toISOString(),
          descripcion: data.descripcion,
          imagenes: data.foto.map(foto => ({ uri: foto.uri })),
         }));
      })

      await new Promise<void>(resolve => setTimeout(resolve, 2000));
      
      navigation.goBack();
    } catch (error) {
      console.error('Error enviando novedad:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [visitasSeleccionadas, navigation, isSubmitting, dispatch]);

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
