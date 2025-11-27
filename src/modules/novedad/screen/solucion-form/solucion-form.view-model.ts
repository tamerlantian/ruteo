import { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStackParamList } from '../../../../navigation/types';
import { useSolucionCreation } from '../../hooks/solucion-hooks.index';
import { useRetryNovedades } from '../../hooks';

type NavigationProp = NativeStackNavigationProp<MainStackParamList>;

interface SolucionFormViewData {
  solucion: string;
}

interface SolucionFormViewModelProps {
  novedadesSeleccionadas: string[];
}

/**
 * ViewModel para el formulario de solución de novedades
 */
export const useSolucionFormViewModel = ({
  novedadesSeleccionadas,
}: SolucionFormViewModelProps) => {
  // === HOOKS ===
  const navigation = useNavigation<NavigationProp>();
  const { crearNuevasSoluciones } = useSolucionCreation();
  const { reintentarNovedadesConError } = useRetryNovedades();

  // === ESTADO LOCAL ===
  const [isSubmitting, setIsSubmitting] = useState(false);

  // === FORM CONTROL ===
  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm<SolucionFormViewData>({
    defaultValues: {
      solucion: '',
    },
    mode:'onChange'
  });

  // === REGLAS DE VALIDACIÓN ===
  const validationRules = {
    solucion: {
      required: 'La descripción de la solución es obligatoria',
      minLength: {
        value: 3,
        message: 'La solución debe tener al menos 3 caracteres',
      },
      maxLength: {
        value: 250,
        message: 'La solución no puede exceder 250 caracteres',
      },
    },
  };

  // === FUNCIONES ===
  const onSubmit = useCallback(
    async (data: SolucionFormViewData) => {
      setIsSubmitting(true);

      try {
        await reintentarNovedadesConError(novedadesSeleccionadas);

        // Preparar datos de soluciones
        const solucionesData = novedadesSeleccionadas.map(novedadId => ({
          id: novedadId,
          tempId: novedadId,
          solucion: data.solucion,
        }));

        // Crear soluciones usando el hook específico
        await crearNuevasSoluciones(solucionesData, {
          showToasts: true,
          clearSelectionsOnSuccess: true,
          logPrefix: 'Solución',
          messagePrefix: 'solución',
        });

        // Limpiar formulario y navegar de vuelta
        reset();
        navigation.goBack();
      } catch (error) {
        console.error('Error general al procesar soluciones:', error);
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      novedadesSeleccionadas,
      reset,
      navigation,
      crearNuevasSoluciones,
      reintentarNovedadesConError,
    ],
  );

  const onCancel = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  // === RETORNO DEL VIEWMODEL ===
  return {
    // Form control
    control,
    errors,
    validationRules,
    isValid,

    // Estado
    isSubmitting,

    // Funciones
    onSubmit: handleSubmit(onSubmit),
    onCancel,
  };
};
