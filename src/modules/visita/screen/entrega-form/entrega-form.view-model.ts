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
  marcarVisitaComoEntregada,
  revertirEntregaOptimista,
  limpiarDatosFormularioDeVisita,
} from '../../store/slice/visita.slice';
import { useVisitaProcessing } from '../../hooks/use-visita-processing.hook';
import { networkService } from '../../../../shared/services';
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

      // 1. Guardar datos del formulario en Redux (backup para rollback si falla)
      visitaIds.forEach(visitaId => {
        dispatch(
          guardarDatosFormularioEnVisita({ visitaId, datosFormulario: data }),
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
        data,
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
              datosFormulario: data, // Preservar datos para retry SI es retryable
              error: result.error || 'Error al procesar entrega',
              esErrorRetryable, // ✅ Usar el valor del error interceptor
            }),
          );
        }
      });

      // 6. Feedback HONESTO segun el resultado. La distincion clave para el
      //    conductor es: ¿se perdio algo, o quedo guardado para enviarse luego?
      //    Un fallo "retryable" (sin conexion / servidor ocupado) NO es un
      //    error desde su punto de vista: su trabajo esta a salvo y se
      //    sincroniza solo. Por eso usamos tono informativo (no rojo) y copy
      //    tranquilizador, y reservamos el rojo para lo que SI requiere accion.
      const fallidas = batchResult.results.filter(r => !r.success);
      const todasRecuperables =
        fallidas.length > 0 &&
        fallidas.every(r => (r.apiError?.isRetryable ?? true));

      if (batchResult.errorCount === 0) {
        Toast.show({
          type: 'success',
          text1: `${batchResult.successCount} entrega(s) registrada(s)`,
          text1Style: toastTextOneStyle,
        });
      } else if (todasRecuperables) {
        const online = await networkService.isConnected();
        const n = fallidas.length;
        const hayExitosas = batchResult.successCount > 0;
        Toast.show({
          type: 'info',
          text1: online
            ? `${n} entrega(s) guardada(s) · se sincronizan en breve`
            : `Sin conexión · ${n} entrega(s) guardada(s)`,
          text2: online
            ? 'El servidor está ocupado, se reintentarán solas.'
            : hayExitosas
              ? 'Las demás se enviarán al volver el internet.'
              : 'Se enviarán automáticamente al volver el internet.',
          text1Style: toastTextOneStyle,
        });
      } else if (batchResult.successCount > 0) {
        Toast.show({
          type: 'info',
          text1: `${batchResult.successCount} registrada(s) · ${batchResult.errorCount} con error`,
          text2: 'Revisa el filtro "Errores" para corregirlas.',
          text1Style: toastTextOneStyle,
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'No se pudo registrar la entrega',
          text2: 'Revisa el filtro "Errores" para corregir y reintentar.',
          text1Style: toastTextOneStyle,
        });
      }

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
