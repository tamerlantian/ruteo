import { useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStackParamList } from '../../../../navigation/types';
import { CrearVisita, Media } from '../../interfaces/visita.interface';
import { visitaRepository } from '../../repositories/visita.repository';

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

// Reglas de validación (todos los campos opcionales)
const validationRules = {
  recibe: {
    minLength: {
      value: 2,
      message: 'El nombre debe tener al menos 2 caracteres'
    },
    maxLength: {
      value: 100,
      message: 'El nombre no puede exceder 100 caracteres'
    }
  },
  numeroIdentificacion: {
    minLength: {
      value: 6,
      message: 'El número de identificación debe tener al menos 6 caracteres'
    },
    maxLength: {
      value: 20,
      message: 'El número de identificación no puede exceder 20 caracteres'
    },
    pattern: {
      value: /^[0-9]+$/,
      message: 'El número de identificación solo puede contener números'
    }
  },
  celular: {
    minLength: {
      value: 10,
      message: 'El número de celular debe tener al menos 10 dígitos'
    },
    maxLength: {
      value: 15,
      message: 'El número de celular no puede exceder 15 dígitos'
    },
    pattern: {
      value: /^[0-9+\-\s()]+$/,
      message: 'Formato de número de celular inválido'
    }
  },
  firma: {
    validate: (value: string) => {
      console.log('Validating signature:', value ? `${value.substring(0, 50)}... (length: ${value.length})` : 'empty');
      
      // Si no hay firma, es válido (campo opcional)
      if (!value || value.trim() === '') {
        console.log('No signature provided - valid (optional field)');
        return true;
      }
      
      // Si hay firma, validar que sea un base64 válido
      if (!value.startsWith('data:image/') && !value.includes('base64')) {
        console.log('Invalid signature format:', value.substring(0, 100));
        return 'Formato de firma inválido';
      }
      
      console.log('Signature validation passed');
      return true;
    }
  },
  fotos: {
    validate: (value: PhotoData[]) => {
      console.log('Validating photos:', value ? value.length : 0, 'photos');
      
      // Si no hay fotos, es válido (campo opcional)
      if (!value || value.length === 0) {
        console.log('No photos provided - valid (optional field)');
        return true;
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

  const processPhotos = (photos: PhotoData[]): Media[] => {
    return photos.map((photo, index) => ({
      uri: photo.uri,
      name: `image-${index}.jpg`,
      type: 'image/jpeg',
    }));
  }
  
  const onSubmit = useCallback((data: EntregaFormData) => {
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
      }
    }

    visitaRepository.entregaVisita('', payloadVisita)

    console.log('=== FORMULARIO ENVIADO ===');
   
    navigation.navigate('HomeTabs');
  }, [navigation, visitasSeleccionadas]);

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
  console.log('Form values:', {
    recibe: formValues.recibe?.substring(0, 20) + '...',
    numeroIdentificacion: formValues.numeroIdentificacion,
    celular: formValues.celular,
    firma: formValues.firma ? `${formValues.firma.substring(0, 30)}... (length: ${formValues.firma.length})` : 'empty',
    fotos: formValues.fotos || [],
    isValid,
    isDirty,
    allRequiredFieldsFilled,
    canSubmit,
    completedFields,
    totalFields,
    errors: Object.keys(errors)
  });

  // Log específico de fotos para debug
  if (formValues.fotos && formValues.fotos.length > 0) {
    console.log('Photos array:', formValues.fotos.map(photo => ({
      uri: photo.uri,
      fileName: photo.fileName,
      timestamp: photo.timestamp
    })));
  }

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
