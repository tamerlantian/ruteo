import { NovedadFormData } from '../interfaces/novedad.interface';
import { NovedadFormDataBuilder } from '../utils/novedad-form-data-builder.util';
import { novedadRepository } from '../repositories/novedad.repository';
import { ApiErrorResponse } from '../../../core/interfaces/api.interface';

/**
 * Configuration for novedad processing
 */
export interface NovedadProcessingConfig {
  /** Marcar novedad con error en caso de fallo */
  markErrorOnFailure?: boolean;
  /** Prefijo para logs (ej: "Novedad", "Reintento") */
  logPrefix?: string;
  /** Prefijo para mensajes de toast (ej: "novedad", "reintento") */
  messagePrefix?: string;
  /** Limpiar selecciones al finalizar exitosamente */
  clearSelectionsOnSuccess?: boolean;
}

/**
 * Result of processing a single novedad
 */
export interface NovedadProcessingResult {
  success: boolean;
  visitaId: number;
  novedadId?: string;
  datosFormulario: NovedadFormData;
  error?: string;
  apiError?: ApiErrorResponse;
}

/**
 * Result of processing multiple novedades in batch
 */
export interface NovedadBatchProcessingResult {
  successCount: number;
  errorCount: number;
  results: NovedadProcessingResult[];
}

/**
 * Service for processing novedad submissions
 * Handles validation, FormData building, and API communication
 */
export class NovedadProcessingService {
  /**
   * Processes a single novedad submission
   */
  static async procesarNovedadIndividual(
    subdominio: string,
    formulario: NovedadFormData,
    config: NovedadProcessingConfig = {}
  ): Promise<NovedadProcessingResult> {
    const { logPrefix = 'Procesamiento Novedad' } = config;

    try {
      // Validate form data
      const validation = NovedadFormDataBuilder.validateNovedadFormData(formulario);
      
      if (!validation.isValid) {
        const error = `Validation error for visita ${formulario.visitaId}: ${validation.error}`;
        console.error(error);
        return { success: false, visitaId: formulario.visitaId, datosFormulario: formulario, error: validation.error };
      }

      // Build FormData for multipart submission
      const formData = NovedadFormDataBuilder.buildNovedadFormData(formulario);

      NovedadFormDataBuilder.logFormData(formData, `${logPrefix} Visita ${formulario.visitaId}`);

      // Send using multipart method
      const response = await novedadRepository.enviarNovedad(subdominio, formData);
      
      return { 
        success: true, 
        visitaId: formulario.visitaId,
        datosFormulario: formulario,
        novedadId: response?.id?.toString(),
      };
    } catch (error) {
      const errorParsed = error as ApiErrorResponse;
      console.error(`❌ Error al procesar novedad para visita ${formulario.visitaId}:`, errorParsed);
      return { success: false, visitaId: formulario.visitaId, datosFormulario: formulario, apiError: errorParsed };
    }
  }

  /**
   * Processes multiple novedades in batch
   */
  static async procesarNovedadesEnLote(
    subdominio: string,
    formularios: NovedadFormData[],
    config: NovedadProcessingConfig = {},
  ): Promise<NovedadBatchProcessingResult> {
    const results: NovedadProcessingResult[] = [];
    let successCount = 0;
    let errorCount = 0;

    for (const formulario of formularios) {
      const result = await this.procesarNovedadIndividual(
        subdominio, 
        formulario, 
        config
      );
      
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
   * Generates result messages based on success and error counts
   */
  static generarMensajesDeResultado(
    successCount: number,
    errorCount: number,
    messagePrefix: string = 'novedad'
  ): { type: 'success' | 'warning' | 'error'; message: string } | null {
    if (successCount > 0 && errorCount === 0) {
      return {
        type: 'success',
        message: `${successCount} ${messagePrefix}(s) enviada(s) exitosamente`
      };
    } else if (successCount > 0 && errorCount > 0) {
      return {
        type: 'warning',
        message: `${successCount} ${messagePrefix}(s) enviada(s), ${errorCount} fallaron`
      };
    } else if (successCount === 0 && errorCount > 0) {
      return {
        type: 'error',
        message: `Error: ${errorCount} ${messagePrefix}(s) fallaron`
      };
    }
    
    return null;
  }
}
