import { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAppSelector } from '../../../../store/hooks';
import { selectSubdominio } from '../../../settings/store/selector/settings.selector';
import { novedadRepository } from '../../repositories/novedad.repository';
import { MainStackParamList } from '../../../../navigation/types';

type NavigationProp = NativeStackNavigationProp<MainStackParamList>;

interface SolucionFormData {
  solucion: string;
}

interface SolucionFormViewModelProps {
  novedadesSeleccionadas: string[];
}

/**
 * ViewModel para el formulario de solución de novedades
 */
export const useSolucionFormViewModel = ({ novedadesSeleccionadas }: SolucionFormViewModelProps) => {
  // === HOOKS ===
  const navigation = useNavigation<NavigationProp>();
  const schemaName = useAppSelector(selectSubdominio);

  // === ESTADO LOCAL ===
  const [isSubmitting, setIsSubmitting] = useState(false);

  // === FORM CONTROL ===
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<SolucionFormData>({
    defaultValues: {
      solucion: '',
    },
  });

  // === REGLAS DE VALIDACIÓN ===
  const validationRules = {
    solucion: {
      required: 'La descripción de la solución es obligatoria',
      minLength: {
        value: 10,
        message: 'La solución debe tener al menos 10 caracteres',
      },
      maxLength: {
        value: 500,
        message: 'La solución no puede exceder 500 caracteres',
      },
    },
  };

  // === FUNCIONES ===
  const onSubmit = useCallback(async (data: SolucionFormData) => {
    if (!schemaName) {
      console.error('Schema name no disponible');
      return;
    }

    setIsSubmitting(true);

    try {
      // Preparar datos para el endpoint
      const solucionData = novedadesSeleccionadas.map(id => ({
        id,
        solucion: data.solucion,
      }));

      // Enviar solución al servidor
      await novedadRepository.solucionarNovedades(schemaName!, solucionData);

      // TODO: Actualizar estado de Redux para marcar novedades como solucionadas
      console.log('Solución enviada exitosamente:', solucionData);

      // Limpiar formulario y navegar de vuelta
      reset();
      navigation.goBack();

      // TODO: Mostrar toast de éxito
    } catch (error) {
      console.error('Error al enviar solución:', error);
      // TODO: Mostrar toast de error
    } finally {
      setIsSubmitting(false);
    }
  }, [schemaName, novedadesSeleccionadas, reset, navigation]);

  const onCancel = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  // === RETORNO DEL VIEWMODEL ===
  return {
    // Form control
    control,
    errors,
    validationRules,

    // Estado
    isSubmitting,

    // Funciones
    onSubmit: handleSubmit(onSubmit),
    onCancel,
  };
};
