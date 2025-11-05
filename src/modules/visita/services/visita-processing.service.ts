import { visitaRepository } from '../repositories/visita.repository';
import { FormDataBuilder } from '../utils/form-data-builder.util';
import { VisitaResponse, EntregaFormData } from '../interfaces/visita.interface';

/**
 * Configuración para el procesamiento de visitas
 */
export interface VisitaProcessingConfig {
  /** Marcar visita con error en caso de fallo */
  markErrorOnFailure?: boolean;
  /** Prefijo para logs (ej: "Entrega", "Reintento") */
  logPrefix?: string;
  /** Prefijo para mensajes de toast (ej: "entrega", "reintento") */
  messagePrefix?: string;
}

/**
 * Resultado del procesamiento de una visita individual
 */
export interface VisitaProcessingResult {
  success: boolean;
  visitaId: number;
  error?: any;
}

/**
 * Resultado del procesamiento de múltiples visitas
 */
export interface BatchProcessingResult {
  successCount: number;
  errorCount: number;
  results: VisitaProcessingResult[];
}

/**
 * Servicio para el procesamiento de visitas
 * Centraliza la lógica común entre entrega inicial y reintentos
 */
export class VisitaProcessingService {
  /**
   * Procesa una visita individual usando los datos guardados previamente o datos proporcionados
   */
  static async procesarVisitaIndividual(
    visitaId: number,
    visitas: VisitaResponse[],
    subdominio: string,
    config: VisitaProcessingConfig = {},
    datosFormulario?: EntregaFormData
  ): Promise<VisitaProcessingResult> {
    const { logPrefix = 'Procesamiento' } = config;

    try {
      // Buscar la visita y sus datos guardados
      const visita = visitas.find(v => v.id === visitaId);
      if (!visita) {
        const error = `Visita ${visitaId} no encontrada en el estado de Redux`;
        console.error(error);
        return { success: false, visitaId, error };
      }
      
      // Usar datos proporcionados directamente o datos guardados en Redux
      let datosGuardados: EntregaFormData;
      
      if (datosFormulario) {
        // Usar datos proporcionados directamente (para entrega inicial)
        datosGuardados = datosFormulario;
        console.log(`📋 Usando datos proporcionados directamente para visita ${visitaId}`);
      } else if (visita.datos_formulario_guardados) {
        // Usar datos guardados en Redux (para reintentos)
        datosGuardados = visita.datos_formulario_guardados;
        console.log(`💾 Usando datos guardados de Redux para visita ${visitaId}`);
      } else {
        const error = `No hay datos de formulario disponibles para la visita ${visitaId}. Proporciona datos o asegúrate de que estén guardados.`;
        console.error(error);
        return { success: false, visitaId, error };
      }

      // Validar datos del formulario
      const validation = FormDataBuilder.validateFormData(datosGuardados, visitaId);
      if (!validation.isValid) {
        const error = `Validation error for visita ${visitaId}: ${validation.error}`;
        console.error(error);
        return { success: false, visitaId, error: validation.error };
      }

      // Construir FormData para envío multipart
      const formData = FormDataBuilder.buildVisitaFormData(datosGuardados, visitaId);

      // Log para debugging
      FormDataBuilder.logFormData(formData, `${logPrefix} Visita ${visitaId}`);

      // Enviar usando método multipart
      await visitaRepository.entregaVisitaMultipart(subdominio, formData);
      
      return { success: true, visitaId };
    } catch (error) {
      console.error(`Error al procesar la visita ${visitaId}:`, error);
      return { success: false, visitaId, error };
    }
  }

  /**
   * Procesa múltiples visitas en lote
   */
  static async procesarVisitasEnLote(
    visitaIds: number[],
    visitas: VisitaResponse[],
    subdominio: string,
    config: VisitaProcessingConfig = {},
    datosFormulario?: EntregaFormData
  ): Promise<BatchProcessingResult> {
    const results: VisitaProcessingResult[] = [];
    let successCount = 0;
    let errorCount = 0;

    for (const visitaId of visitaIds) {
      const result = await this.procesarVisitaIndividual(visitaId, visitas, subdominio, config, datosFormulario);
      results.push(result);
      
      if (result.success) {
        successCount++;
      } else {
        errorCount++;
      }
    }

    return {
      successCount,
      errorCount,
      results
    };
  }

  /**
   * Genera mensajes de resultado basados en el conteo de éxitos y errores
   */
  static generarMensajesDeResultado(
    successCount: number,
    errorCount: number,
    messagePrefix: string = 'operación'
  ): { type: 'success' | 'warning' | 'error'; message: string } | null {
    if (successCount > 0 && errorCount === 0) {
      return {
        type: 'success',
        message: `${successCount} ${messagePrefix}(s) exitosa(s)`
      };
    } else if (successCount > 0 && errorCount > 0) {
      return {
        type: 'warning',
        message: `${successCount} ${messagePrefix}(s) exitosa(s), ${errorCount} fallida(s)`
      };
    } else if (errorCount > 0) {
      return {
        type: 'error',
        message: `${errorCount} ${messagePrefix}(s) fallida(s)`
      };
    }
    
    return null;
  }
}
