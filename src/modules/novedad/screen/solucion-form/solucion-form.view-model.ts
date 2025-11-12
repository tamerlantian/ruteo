import { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import { selectSubdominio } from '../../../settings/store/selector/settings.selector';
import { novedadRepository } from '../../repositories/novedad.repository';
import { MainStackParamList } from '../../../../navigation/types';
import { isTempId } from '../../../../shared/utils/id-generator.util';
import { guardarSolucionNovedad, limpiarNovedad, limpiarSeleccionNovedades } from '../../store/slice/novedad.slice';
import { desmarcarVisitaConNovedad } from '../../../visita/store/slice/visita.slice';

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
export const useSolucionFormViewModel = ({
  novedadesSeleccionadas,
}: SolucionFormViewModelProps) => {
  // === HOOKS ===
  const navigation = useNavigation<NavigationProp>();
  const schemaName = useAppSelector(selectSubdominio);
  const dispatch = useAppDispatch();

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
  const onSubmit = useCallback(
    async (data: SolucionFormData) => {
      if (!schemaName) {
        console.error('Schema name no disponible');
        return;
      }

      setIsSubmitting(true);

      try {
        let successCount = 0;
        let errorCount = 0;

        // Enviar una petición por cada novedad
        for (const novedadId of novedadesSeleccionadas) {
          try {
            const solucionData = {
              id: novedadId,
              solucion: data.solucion,
            };

            if (isTempId(novedadId)) {
              // dispatch(desmarcarVisitaConNovedad(novedadId));
              dispatch(guardarSolucionNovedad(solucionData));
              return;
            }

            await novedadRepository.solucionarNovedades(
              schemaName!,
              solucionData,
            );

            dispatch(limpiarNovedad(novedadId));
            // dispatch(desmarcarVisitaConNovedad(novedadId));
            dispatch(limpiarSeleccionNovedades())

            // TODO: Actualizar estado de Redux para marcar esta novedad como solucionada
            console.log(
              `Solución enviada exitosamente para novedad ${novedadId}`,
            );
            successCount++;
          } catch (error) {
            console.error(
              `Error al enviar solución para novedad ${novedadId}:`,
              error,
            );
            // TODO: Marcar esta novedad con error en Redux
            errorCount++;
          }
        }

        // Mostrar resultado final
        console.log(
          `Proceso completado: ${successCount} exitosas, ${errorCount} con error`,
        );

        // TODO: Mostrar toast con resumen (ej: "3 novedades solucionadas, 1 con error")

        // Limpiar formulario y navegar de vuelta
        reset();
        navigation.goBack();
      } catch (error) {
        console.error('Error general al procesar soluciones:', error);
        // TODO: Mostrar toast de error general
      } finally {
        setIsSubmitting(false);
      }
    },
    [schemaName, novedadesSeleccionadas, reset, navigation, dispatch],
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

    // Estado
    isSubmitting,

    // Funciones
    onSubmit: handleSubmit(onSubmit),
    onCancel,
  };
};
