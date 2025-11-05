import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { selectSubdominio } from '../../settings';
import { selectVisitas } from '../store/selector/visita.selector';
import { 
  marcarVisitaComoEntregada, 
  marcarVisitaConError,
  limpiarDatosFormularioDeVisita,
  limpiarSeleccionVisitas
} from '../store/slice/visita.slice';
import { visitaRepository } from '../repositories/visita.repository';
import { FormDataBuilder } from '../utils/form-data-builder.util';
import { useToast } from '../../../shared/hooks/use-toast.hook';

/**
 * Hook para manejar el reintento de visitas con error
 * Utiliza los datos del formulario guardados previamente
 */
export const useRetryVisitas = () => {
  const dispatch = useAppDispatch();
  const subdominio = useAppSelector(selectSubdominio);
  const visitas = useAppSelector(selectVisitas);
  const toast = useToast();

  /**
   * Procesa una visita individual usando los datos guardados previamente
   * @param visitaId - ID de la visita a procesar
   * @returns Promise<boolean> - true si fue exitoso, false si falló
   */
  const procesarVisitaIndividualConDatosGuardados = useCallback(
    async (visitaId: number): Promise<boolean> => {
      try {
        // Buscar la visita y sus datos guardados
        const visita = visitas.find(v => v.id === visitaId);
        if (!visita || !visita.datos_formulario_guardados) {
          console.error(`No se encontraron datos guardados para la visita ${visitaId}`);
          return false;
        }

        const datosGuardados = visita.datos_formulario_guardados;

        // Validar datos del formulario
        const validation = FormDataBuilder.validateFormData(datosGuardados, visitaId);
        if (!validation.isValid) {
          console.error(`Validation error for visita ${visitaId}:`, validation.error);
          return false;
        }

        // Construir FormData para envío multipart
        const formData = FormDataBuilder.buildVisitaFormData(datosGuardados, visitaId);

        // Log para debugging
        FormDataBuilder.logFormData(formData, `Reintento Visita ${visitaId}`);

        // Enviar usando método multipart
        await visitaRepository.entregaVisitaMultipart(subdominio!, formData);
        
        // Si fue exitoso, marcar como entregada y limpiar datos guardados
        dispatch(marcarVisitaComoEntregada(visitaId));
        dispatch(limpiarDatosFormularioDeVisita(visitaId));
        
        return true;
      } catch (visitaError) {
        console.error(`Error al reintentar la visita ${visitaId}:`, visitaError);
        dispatch(marcarVisitaConError(visitaId));
        toast.error(`Error al reintentar la visita ${visitaId}: ${visitaError}`);
        return false;
      }
    },
    [visitas, subdominio, dispatch, toast],
  );

  /**
   * Muestra mensajes de resultado basados en el conteo de éxitos y errores
   */
  const mostrarMensajesDeResultado = useCallback(
    (successCount: number, errorCount: number) => {
      if (successCount > 0 && errorCount === 0) {
        toast.success(`${successCount} reintento(s) exitoso(s)`);
      } else if (successCount > 0 && errorCount > 0) {
        toast.warning(`${successCount} reintento(s) exitoso(s), ${errorCount} fallido(s)`);
      } else if (errorCount > 0) {
        toast.error(`${errorCount} reintento(s) fallido(s)`);
      }
    },
    [toast],
  );

  /**
   * Reintenta el envío de visitas con error usando los datos guardados
   * @param visitasConError - Array de IDs de visitas con error
   */
  const reintentarVisitasConError = useCallback(
    async (visitasConError: number[]) => {
      if (visitasConError.length === 0) {
        toast.warning('No hay visitas con error para reintentar');
        return;
      }

      if (!subdominio) {
        toast.error('No se proporcionó un subdominio');
        return;
      }

      try {
        let successCount = 0;
        let errorCount = 0;

        for (const visitaId of visitasConError) {
          const wasSuccessful = await procesarVisitaIndividualConDatosGuardados(visitaId);
          
          if (wasSuccessful) {
            successCount++;
          } else {
            errorCount++;
          }
        }

        // Mostrar mensajes de resultado
        mostrarMensajesDeResultado(successCount, errorCount);

        // Si todas fueron exitosas, limpiar selecciones
        if (errorCount === 0) {
          dispatch(limpiarSeleccionVisitas());
        }
      } catch (error) {
        console.error('Error general al reintentar las entregas:', error);
        toast.error('Error al reintentar las entregas');
      }
    },
    [subdominio, dispatch, toast, mostrarMensajesDeResultado, procesarVisitaIndividualConDatosGuardados],
  );

  return {
    reintentarVisitasConError,
  };
};
