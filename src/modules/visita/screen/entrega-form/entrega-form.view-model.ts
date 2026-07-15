import { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStackParamList } from '../../../../navigation/types';
import { EntregaFormData } from '../../interfaces/visita.interface';
import { dateUtil } from '../../../../shared/utils/date.util';
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
  marcarVisitaComoEntregada,
  revertirEntregaOptimista,
  limpiarDatosFormularioDeVisita,
} from '../../store/slice/visita.slice';
import { useVisitaProcessing } from '../../hooks/use-visita-processing.hook';
import Toast from 'react-native-toast-message';
import { toastTextOneStyle } from '../../../../shared/styles/global.style';

type NavigationProp = NativeStackNavigationProp<MainStackParamList>;

/**
 * ViewModel para el formulario de entrega
 * Maneja la lógica de validación y envío del formulario
 */
export const useEntregaFormViewModel = (
  visitasSeleccionadas: string[],
  navigation: NavigationProp,
) => {
  const subdominio = useAppSelector(selectSubdominio);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dispatch = useAppDispatch();
  const { procesarVisitasEnLote } = useVisitaProcessing();

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
      // Toast.show({
      //   type: 'error',
      //   text1: 'No hay visitas seleccionadas',
      //   text1Style: toastTextOneStyle,
      // });
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

  // === ACCIONES DEL FORMULARIO ===

  const onSubmit = useCallback(
    async (data: EntregaFormData) => {
      // Validar condiciones iniciales
      if (!validateInitialConditions()) {
        return;
      }

      setIsSubmitting(true);
      const visitaIds = visitasSeleccionadas.map(id => parseInt(id, 10));

      // Sella la hora de ENTREGA ahora (momento del registro), NO al sincronizar.
      // Asi una entrega guardada offline conserva su hora real cuando se envie
      // despues. Se reusa este mismo objeto en guardar / procesar / rollback.
      const dataConFecha: EntregaFormData = {
        ...data,
        fechaEntrega: data.fechaEntrega ?? dateUtil.getCurrentForAPI(),
      };

      // 1. Guardar datos del formulario en Redux (backup para rollback si falla)
      visitaIds.forEach(visitaId => {
        dispatch(
          guardarDatosFormularioEnVisita({
            visitaId,
            datosFormulario: dataConFecha,
          }),
        );
      });

      // 2. OPTIMISTIC UPDATE: Marcar como entregada INMEDIATAMENTE
      visitaIds.forEach(visitaId => {
        dispatch(marcarVisitaComoEntregada(visitaId));
      });

      // 3. Limpiar selecciones y navegar atrás INMEDIATAMENTE
      dispatch(limpiarSeleccionVisitas());
      navigation.goBack();

      // 4. Procesar en background (la petición continúa después de navegar)
      const batchResult = await procesarVisitasEnLote(
        visitaIds,
        {
          markErrorOnFailure: false, // No usamos esto, manejamos errores manualmente
          logPrefix: 'Entrega',
          messagePrefix: 'entrega',
          clearSelectionsOnSuccess: false, // Ya limpiamos arriba
        },
        dataConFecha,
      );

      // 5. Procesar resultados individuales
      batchResult.results.forEach(result => {
        if (result.success) {
          // Success: Ya está marcada como entregada, solo limpiar datos guardados
          dispatch(limpiarDatosFormularioDeVisita(result.visitaId));
        } else {
          // ROLLBACK: Revertir optimistic update
          // ✅ Extraer isRetryable del apiError (viene del error interceptor)
          const esErrorRetryable = result.apiError?.isRetryable ?? true; // Default a true por seguridad

          dispatch(
            revertirEntregaOptimista({
              visitaId: result.visitaId,
              datosFormulario: dataConFecha, // Preservar datos (con la hora sellada) para retry SI es retryable
              error: result.error || 'Error al procesar entrega',
              esErrorRetryable, // ✅ Usar el valor del error interceptor
            }),
          );
        }
      });

      // 6. El feedback (toast) lo emite procesarVisitasEnLote de forma
      //    centralizada y offline-aware (mismo copy para entrega/reintento/
      //    auto-sync). Aquí solo cerramos el estado de envío.
      setIsSubmitting(false);
    },
    [
      validateInitialConditions,
      visitasSeleccionadas,
      dispatch,
      procesarVisitasEnLote,
      navigation,
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
