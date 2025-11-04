import { useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStackParamList } from '../../../../navigation/types';
import {
  CrearVisita,
  EntregaFormData,
  Media,
  PhotoData,
} from '../../interfaces/visita.interface';
import { visitaRepository } from '../../repositories/visita.repository';
import { visitaFormValidationRules } from '../../constants/visita.constant';
import { selectSubdominio } from '../../../settings';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import { limpiarSeleccionVisitas } from '../../store/slice/visita.slice';

type NavigationProp = NativeStackNavigationProp<MainStackParamList>;

/**
 * ViewModel para el formulario de entrega
 * Maneja la lógica de validación y envío del formulario
 */
export const useEntregaFormViewModel = (visitasSeleccionadas: string[]) => {
  const navigation = useNavigation<NavigationProp>();
  const subdominio = useAppSelector(selectSubdominio);
  const dispatch = useAppDispatch();

  // Configuración de React Hook Form
  const {
    control,
    handleSubmit,
    formState: { isValid, isDirty, errors },
    reset,
    watch,
  } = useForm<EntregaFormData>({
    defaultValues: {
      recibe: '',
      numeroIdentificacion: '',
      celular: '',
      firma: '',
      fotos: [],
    },
    mode: 'onChange',
  });

  // Observar cambios en los campos para feedback visual
  const formValues = watch();

  // === ACCIONES DEL FORMULARIO ===

  const processPhotos = (photos: PhotoData[]): Media[] => {
    return photos.map((photo, index) => ({
      uri: photo.uri,
      name: `image-${index}.jpg`,
      type: 'image/jpeg',
    }));
  };

  const onSubmit = useCallback(
    async (data: EntregaFormData) => {
      const fotos = processPhotos(data.fotos || []);
      const visitaId = Number(visitasSeleccionadas[0]);
      let firma: Media | null = null;

      if (data.firma) {
        firma = {
          uri: data.firma,
          name: 'firma.jpg',
          type: 'image/jpeg',
        };
      }

      const payloadVisita: CrearVisita = {
        id: visitaId,
        fecha_entrega: new Date().toISOString(),
        imagenes: fotos,
        firmas: firma ? [firma] : [],
        datos_adicionales: {
          recibe: data.recibe,
          recibeParentesco: '',
          recibeNumeroIdentificacion: data.numeroIdentificacion,
          recibeCelular: data.celular,
        },
      };

      try {
        if (subdominio) {
          // dispatch(limpiarSeleccionVisitas());
          console.log('Enviando visita:', payloadVisita);
          await visitaRepository.entregaVisita(subdominio, payloadVisita);
        } else {
          console.log('No se proporcionó un subdominio');
        }
      } catch (error) {
        console.log('Error al enviar la visita:', error);
      }


      // navigation.navigate('HomeTabs');
    },
    [navigation, visitasSeleccionadas, subdominio, dispatch],
  );

  const handleCancel = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleReset = useCallback(() => {
    reset();
  }, [reset]);

  // === ESTADOS COMPUTADOS ===

  // Como todos los campos son opcionales, el formulario siempre puede enviarse
  const allRequiredFieldsFilled = true;

  const canSubmit = isValid && allRequiredFieldsFilled;
  const hasErrors = Object.keys(errors).length > 0;

  // Información de progreso del formulario
  const completedFields = Object.entries(formValues).filter(([key, value]) => {
    if (key === 'fotos') {
      // Para fotos, verificar que sea un array con elementos
      return Array.isArray(value) && value.length > 0;
    }
    if (typeof value === 'string') {
      return value.trim() !== '' && value !== 'empty';
    }
    return value != null && value !== '';
  }).length;
  const totalFields = Object.keys(formValues).length;
  const progressPercentage = (completedFields / totalFields) * 100;

  // Debug: Log form values para verificar la firma y fotos
  // console.log('Form values:', {
  //   recibe: formValues.recibe?.substring(0, 20) + '...',
  //   numeroIdentificacion: formValues.numeroIdentificacion,
  //   celular: formValues.celular,
  //   firma: formValues.firma
  //     ? `${formValues.firma.substring(0, 30)}... (length: ${
  //         formValues.firma.length
  //       })`
  //     : 'empty',
  //   fotos: formValues.fotos || [],
  //   isValid,
  //   isDirty,
  //   allRequiredFieldsFilled,
  //   canSubmit,
  //   completedFields,
  //   totalFields,
  //   errors: Object.keys(errors),
  // });

  return {
    // Form control
    control,
    errors,

    // Form state
    isValid,
    isDirty,
    canSubmit,
    hasErrors,
    formValues,

    // Progress info
    completedFields,
    totalFields,
    progressPercentage,

    // Actions
    onSubmit: handleSubmit(onSubmit),
    handleCancel,
    handleReset,

    // Validation rules
    visitaFormValidationRules,
  };
};

export type EntregaFormViewModel = ReturnType<typeof useEntregaFormViewModel>;
