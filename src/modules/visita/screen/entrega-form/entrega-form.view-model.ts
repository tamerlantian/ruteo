import { useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStackParamList } from '../../../../navigation/types';
import { EntregaFormData } from '../../interfaces/visita.interface';
import { visitaRepository } from '../../repositories/visita.repository';
import {
  visitaFormValidationRules,
  parentescos,
} from '../../constants/visita.constant';
import { selectSubdominio } from '../../../settings';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import { limpiarSeleccionVisitas } from '../../store/slice/visita.slice';
import { FormDataBuilder } from '../../utils/form-data-builder.util';
import { useToast } from '../../../../shared/hooks/use-toast.hook';

type NavigationProp = NativeStackNavigationProp<MainStackParamList>;

/**
 * ViewModel para el formulario de entrega
 * Maneja la lógica de validación y envío del formulario
 */
export const useEntregaFormViewModel = (visitasSeleccionadas: string[]) => {
  const navigation = useNavigation<NavigationProp>();
  const subdominio = useAppSelector(selectSubdominio);
  const dispatch = useAppDispatch();
  const toast = useToast();

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
      parentesco: '',
      firma: '',
      fotos: [],
    },
    mode: 'onChange',
  });

  // Observar cambios en los campos para feedback visual
  const formValues = watch();

  // === ACCIONES DEL FORMULARIO ===

  const onSubmit = useCallback(
    async (data: EntregaFormData) => {
      const visitaId = Number(visitasSeleccionadas[0]);

      // Validate form data before processing
      const validation = FormDataBuilder.validateFormData(data, visitaId);
      if (!validation.isValid) {
        console.error('Validation error:', validation.error);
        // TODO: Show error to user
        return;
      }

      try {
        if (!subdominio) {
          console.error('No se proporcionó un subdominio');
          // TODO: Show error to user
          return;
        }

        // Build FormData for multipart submission
        const formData = FormDataBuilder.buildVisitaFormData(data, visitaId);

        // Log FormData for debugging
        FormDataBuilder.logFormData(formData, 'Entrega Visita');

        // Submit using multipart method
        await visitaRepository.entregaVisitaMultipart(subdominio, formData);
        toast.success('Entrega exitosa');

        // Clear selections after successful submission
        dispatch(limpiarSeleccionVisitas());

        // Navigate back to home
        navigation.navigate('HomeTabs');
      } catch (error) {
        console.error('Error al enviar la visita:', error);
        // TODO: Show error to user with proper error handling
      }
    },
    [navigation, visitasSeleccionadas, subdominio, dispatch, toast],
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

    // Actions
    onSubmit: handleSubmit(onSubmit),
    handleCancel,
    handleReset,

    // Validation rules
    visitaFormValidationRules,

    // Options for selectors
    parentescoOptions: parentescos,
  };
};

export type EntregaFormViewModel = ReturnType<typeof useEntregaFormViewModel>;
