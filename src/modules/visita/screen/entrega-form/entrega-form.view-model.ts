import { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStackParamList } from '../../../../navigation/types';
import { EntregaFormData } from '../../interfaces/visita.interface';
import {
  visitaFormValidationRules,
  parentescos,
} from '../../constants/visita.constant';
import { selectSubdominio } from '../../../settings';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
// selectVisitas no necesario - useVisitaProcessing tiene su propio selector
import { 
  limpiarSeleccionVisitas, 
  guardarDatosFormularioEnVisita,
} from '../../store/slice/visita.slice';
import { useVisitaProcessing } from '../../hooks/use-visita-processing.hook';
import Toast from 'react-native-toast-message';
import { toastTextOneStyle } from '../../../../shared/styles/global.style';
import { useCoordinatedRetry } from '../../hooks/use-coordinated-retry.hook';

type NavigationProp = NativeStackNavigationProp<MainStackParamList>;

/**
 * ViewModel para el formulario de entrega
 * Maneja la lógica de validación y envío del formulario
 */
export const useEntregaFormViewModel = (visitasSeleccionadas: string[], navigation: NavigationProp) => {
  const subdominio = useAppSelector(selectSubdominio);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dispatch = useAppDispatch();
  const { procesarVisitasEnLote } = useVisitaProcessing();
  const { prepareVisitasForProcessing} = useCoordinatedRetry()

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

  // === FUNCIONES AUXILIARES ===

  /**
   * Valida los datos iniciales antes de procesar las entregas
   */
  const validateInitialConditions = useCallback(() => {
    if (!visitasSeleccionadas || visitasSeleccionadas.length === 0) {
      Toast.show({
        type: 'error',
        text1: 'No hay visitas seleccionadas',
        text1Style: toastTextOneStyle,
      });
      return false;
    }

    if (!subdominio) {
      Toast.show({
        type: 'error',
        text1: 'No se proporcionó un subdominio',
        text1Style: toastTextOneStyle,
      });
      return false;
    }

    return true;
  }, [visitasSeleccionadas, subdominio]);

  // === FUNCIONES AUXILIARES ===

  /**
   * Reintenta el envío de visitas con error usando los datos guardados
   * Refactorizado para usar el hook compartido de procesamiento
   * @param visitasConError - Array de IDs de visitas con error
   */
  const reintentarVisitasConError = useCallback(
    async (visitasConError: number[]) => {
      await procesarVisitasEnLote(visitasConError, {
        markErrorOnFailure: false, // No marcar error adicional en reintentos
        logPrefix: 'Reintento',
        messagePrefix: 'entrega',
        clearSelectionsOnSuccess: true,
      });
    },
    [procesarVisitasEnLote],
  );

  /**
   * Finaliza el proceso de entrega limpiando selecciones y navegando
   */
  const finalizarProceso = useCallback(() => {
    dispatch(limpiarSeleccionVisitas());
    navigation.goBack();
  }, [dispatch, navigation]);

  // === ACCIONES DEL FORMULARIO ===

  const onSubmit = useCallback(
    async (data: EntregaFormData) => {
      // Validar condiciones iniciales
      if (!validateInitialConditions()) {
        return;
      }

      try {
        // Procesar todas las visitas usando el hook compartido (pasando datos directamente)
        setIsSubmitting(true);
        const visitaIds = visitasSeleccionadas.map(id => parseInt(id, 10));
        
        // Guardar datos en Redux para posibles reintentos futuros
        visitaIds.forEach(visitaId => {
          dispatch(guardarDatosFormularioEnVisita({ visitaId, datosFormulario: data }));
        });

        await prepareVisitasForProcessing(visitaIds);

        await procesarVisitasEnLote(visitaIds, {
          markErrorOnFailure: true,
          logPrefix: 'Entrega',
          messagePrefix: 'entrega',
          clearSelectionsOnSuccess: true,
        }, data);

        // Finalizar proceso
        finalizarProceso();
      } catch (error) {
        console.error('Error general al procesar las entregas:', error);
        Toast.show({
          type: 'error',
          text1: 'Error al procesar las entregas',
          text1Style: toastTextOneStyle,
        });
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      validateInitialConditions,
      visitasSeleccionadas,
      dispatch,
      procesarVisitasEnLote,
      prepareVisitasForProcessing,
      finalizarProceso,
    ],
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
    reintentarVisitasConError,

    // Validation rules
    visitaFormValidationRules,
    isSubmitting,

    // Options for selectors
    parentescoOptions: parentescos,
  };
};

export type EntregaFormViewModel = ReturnType<typeof useEntregaFormViewModel>;
