import { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStackParamList } from '../../../../navigation/types';
import { PhotoData } from '../../../../shared/components/ui/photo-capture/PhotoCapture.types';
import { useAppSelector } from '../../../../store/hooks';
import { selectSubdominio } from '../../../settings';
import { useNovedadTipos } from '../../view-models/novedad.view-model';

type NavigationProp = NativeStackNavigationProp<MainStackParamList, 'NovedadForm'>;

/**
 * Datos del formulario de novedad
 */
export interface NovedadFormData {
  tipo: string;
  descripcion: string;
  foto: PhotoData[];
}

/**
 * ViewModel para el formulario de novedad
 * Maneja la lógica de validación y envío del formulario
 */
export const useNovedadFormViewModel = (
  visitasSeleccionadas: string[], 
  navigation: NavigationProp
) => {
  // === ESTADO ===
  const [isSubmitting, setIsSubmitting] = useState(false);
  const subdominio = useAppSelector(selectSubdominio);

  // === QUERY TIPOS DE NOVEDAD ===
  const {
    data: novedadTiposResponse,
    isLoading: isLoadingTipos,
    error: tiposError,
    refetch: refetchTipos,
  } = useNovedadTipos(subdominio || '', !!subdominio);

  // === FORMULARIO ===
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

  // === OPCIONES PARA SELECTOR ===
  const tiposOptions = novedadTiposResponse?.results?.map(tipo => ({
    label: tipo.nombre,
    value: tipo.id.toString(),
  })) || [];

  // === REGLAS DE VALIDACIÓN ===
  const validationRules = {
    tipo: {
      required: 'El tipo de novedad es obligatorio',
    },
    descripcion: {
      required: 'La descripción es obligatoria',
      maxLength: {
        value: 500,
        message: 'La descripción no puede exceder 500 caracteres',
      },
    },
    foto: {
      required: 'Debe agregar al menos una foto',
      validate: (value: PhotoData[]) => {
        if (!value || value.length === 0) {
          return 'Debe agregar al menos una foto';
        }
        return true;
      },
    },
  };

  // === NAVEGACIÓN ===
  const goBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  // === ACCIONES DEL FORMULARIO ===
  const onSubmitForm = useCallback(async (data: NovedadFormData) => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      // TODO: Implementar lógica de envío de novedad
      console.log('Enviando novedad para visitas:', visitasSeleccionadas);
      console.log('Datos del formulario:', data);
      
      // Simular delay de envío
      await new Promise<void>(resolve => setTimeout(resolve, 2000));
      
      // TODO: Navegar de vuelta o mostrar confirmación
      navigation.goBack();
    } catch (error) {
      console.error('Error enviando novedad:', error);
      // TODO: Mostrar error al usuario
    } finally {
      setIsSubmitting(false);
    }
  }, [visitasSeleccionadas, navigation, isSubmitting]);

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
    validationRules,
    
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
