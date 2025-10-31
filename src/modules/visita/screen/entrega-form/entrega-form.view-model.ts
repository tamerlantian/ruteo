import { useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStackParamList } from '../../../../navigation/types';

// Tipos para el formulario de entrega
export interface PhotoData {
  uri: string;
  fileName?: string;
  type?: string;
  fileSize?: number;
  width?: number;
  height?: number;
  timestamp: number;
}

export interface EntregaFormData {
  recibe: string;
  numeroIdentificacion: string;
  celular: string;
  firma: string; // Base64 de la firma
  fotos: PhotoData[];
}

// Reglas de validación
const validationRules = {
  recibe: {
    required: 'El nombre de quien recibe es obligatorio',
    minLength: {
      value: 2,
      message: 'El nombre debe tener al menos 2 caracteres'
    },
    maxLength: {
      value: 50,
      message: 'El nombre no puede exceder 50 caracteres'
    }
  },
  numeroIdentificacion: {
    required: 'El número de identificación es obligatorio',
    pattern: {
      value: /^[0-9]+$/,
      message: 'Solo se permiten números'
    },
    minLength: {
      value: 6,
      message: 'Debe tener al menos 6 dígitos'
    },
    maxLength: {
      value: 15,
      message: 'No puede exceder 15 dígitos'
    }
  },
  celular: {
    required: 'El número de celular es obligatorio',
    pattern: {
      value: /^[0-9+\-\s()]+$/,
      message: 'Formato de celular inválido'
    },
    minLength: {
      value: 10,
      message: 'Debe tener al menos 10 dígitos'
    },
    maxLength: {
      value: 15,
      message: 'No puede exceder 15 dígitos'
    }
  },
  firma: {
    required: 'La firma es obligatoria',
    validate: (value: string) => {
      console.log('Validating signature:', value ? `${value.substring(0, 50)}... (length: ${value.length})` : 'empty');
      
      if (!value || value.trim() === '') {
        return 'Debe proporcionar una firma';
      }
      
      // Validar que sea un base64 válido (más flexible)
      if (!value.startsWith('data:image/') && !value.includes('base64')) {
        console.log('Invalid signature format:', value.substring(0, 100));
        return 'Formato de firma inválido';
      }
      
      console.log('Signature validation passed');
      return true;
    }
  },
  fotos: {
    required: 'Debes tomar al menos una foto de la entrega',
    validate: (value: PhotoData[]) => {
      console.log('Validating photos:', value ? value.length : 0, 'photos');
      
      if (!value || value.length === 0) {
        return 'Debes tomar al menos una foto de la entrega';
      }
      
      if (value.length > 5) {
        return 'No puedes agregar más de 5 fotos';
      }
      
      console.log('Photos validation passed');
      return true;
    }
  }
};

type NavigationProp = NativeStackNavigationProp<MainStackParamList>;

/**
 * ViewModel para el formulario de entrega
 * Maneja la lógica de validación y envío del formulario
 */
export const useEntregaFormViewModel = (visitasSeleccionadas: string[]) => {
  const navigation = useNavigation<NavigationProp>();

  // Configuración de React Hook Form
  const { control, handleSubmit, formState: { isValid, isDirty, errors }, reset, watch } = useForm<EntregaFormData>({
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
  
  const onSubmit = useCallback((data: EntregaFormData) => {
    console.log('Datos del formulario:', data);
    console.log('Visitas a entregar:', visitasSeleccionadas);
    
    // TODO: Implementar lógica de entrega real
    // - Validar datos
    // - Enviar a API
    // - Manejar respuesta
    // - Mostrar confirmación
    
    // Por ahora solo navegamos de vuelta
    // navigation.goBack();
  }, [navigation, visitasSeleccionadas]);

  const handleCancel = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleReset = useCallback(() => {
    reset();
  }, [reset]);

  // === ESTADOS COMPUTADOS ===
  
  // Verificar si todos los campos requeridos están llenos
  const allRequiredFieldsFilled = formValues.recibe && 
                                  formValues.numeroIdentificacion && 
                                  formValues.celular && 
                                  formValues.firma &&
                                  formValues.fotos && 
                                  formValues.fotos.length > 0;
  
  const canSubmit = isValid && allRequiredFieldsFilled;
  const hasErrors = Object.keys(errors).length > 0;
  
  // Información de progreso del formulario
  const completedFields = Object.values(formValues).filter(value => {
    if (typeof value === 'string') {
      return value.trim() !== '';
    }
    return value != null && value !== '';
  }).length;
  const totalFields = Object.keys(formValues).length;
  const progressPercentage = (completedFields / totalFields) * 100;

  // Debug: Log form values para verificar la firma y fotos
  console.log('Form values:', {
    recibe: formValues.recibe?.substring(0, 20) + '...',
    numeroIdentificacion: formValues.numeroIdentificacion,
    celular: formValues.celular,
    firma: formValues.firma ? `${formValues.firma.substring(0, 30)}... (length: ${formValues.firma.length})` : 'empty',
    fotos: formValues.fotos ? `${formValues.fotos.length} photos` : 'empty',
    isValid,
    isDirty,
    allRequiredFieldsFilled,
    canSubmit,
    completedFields,
    totalFields,
    errors: Object.keys(errors)
  });

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
    validationRules,
  };
};

export type EntregaFormViewModel = ReturnType<typeof useEntregaFormViewModel>;
