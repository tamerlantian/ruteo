import { visitaRepository } from '../repositories/visita.repository';
import { FormDataBuilder } from '../utils/form-data-builder.util';
import { VisitaResponse, EntregaFormData } from '../interfaces/visita.interface';
import { ApiErrorResponse } from '../../../core/interfaces/api.interface';
import { algunaFotoFalta } from '../../../shared/utils/photo-storage.util';

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
  apiError?: ApiErrorResponse;
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
        // Datos directos: entrega inicial.
        datosGuardados = datosFormulario;
      } else if (visita.datos_formulario_guardados) {
        // Datos guardados en Redux: reintento.
        datosGuardados = visita.datos_formulario_guardados;
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

      // Verificar que las fotos existan EN DISCO antes de enviar. Caso legacy:
      // fotos que vivian en Caches y iOS purgo -> no hay bytes que subir.
      // Reintentar es inutil, asi que devolvemos un error NO-retryable para que
      // el conductor pueda anular y volver a registrar la entrega (en vez de
      // quedar atascada en "Sincronizar" reintentando para siempre).
      const fotos = datosGuardados.fotos ?? [];
      if (fotos.length > 0) {
        const faltaFoto = await algunaFotoFalta(fotos.map(f => f.uri));
        if (faltaFoto) {
          console.warn(
            `📷 Visita ${visitaId}: foto no disponible en disco, se requiere re-registro`,
          );
          return {
            success: false,
            visitaId,
            error:
              'La foto de la entrega ya no está disponible. Vuelve a registrar la entrega.',
            apiError: {
              titulo: 'Foto no disponible',
              mensaje:
                'La foto de la entrega ya no está disponible en el dispositivo. Anula y vuelve a registrar la entrega.',
              codigo: 0,
              isRetryable: false,
            },
          };
        }
      }

      // Construir FormData para envío multipart
      const formData = FormDataBuilder.buildVisitaFormData(datosGuardados, visitaId);

      // Log para debugging
      FormDataBuilder.logFormData(formData, `${logPrefix} Visita ${visitaId}`);

      // Enviar usando método multipart
      await visitaRepository.entregaVisitaMultipart(subdominio, formData);

      return { success: true, visitaId };
    } catch (error) {
      // El interceptor HTTP normaliza los errores a ApiErrorResponse, pero un
      // error de fase-request (ej. archivo inexistente) puede llegar crudo.
      // Accedemos defensivamente (?? {}) y NO hacemos JSON.stringify del error
      // (los AxiosError son circulares y romperian el catch).
      const apiError = (error ?? {}) as ApiErrorResponse;
      console.warn(
        `🔴 Entrega fallida visita=${visitaId} [${logPrefix}] ` +
          `codigo=${apiError?.codigo} retryable=${apiError?.isRetryable} :: ` +
          `${apiError?.mensaje ?? String(error)}`,
      );
      return {
        success: false,
        visitaId,
        error: apiError.mensaje || 'Error desconocido',
        apiError,
      };
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

  /**
   * Extrae de forma SEGURA (sin lanzar) el mensaje y la clasificación
   * retryable de un resultado fallido. Cubre todas las formas que puede tomar
   * el error: ApiErrorResponse, string, objeto crudo o null/undefined.
   */
  static extraerErrorVisita(result: VisitaProcessingResult): {
    mensaje: string;
    esRetryable: boolean;
  } {
    const { error, apiError } = result;
    let mensaje = 'Error desconocido al procesar la entrega';

    if (apiError?.mensaje) {
      mensaje = apiError.mensaje;
    } else if (typeof error === 'string' && error.trim()) {
      mensaje = error;
    } else if (error && typeof error === 'object') {
      mensaje = error.mensaje || error.message || error.titulo || mensaje;
    }

    // Default a retryable por seguridad (no perder datos), salvo que el error
    // diga explícitamente lo contrario.
    const esRetryable = apiError?.isRetryable ?? true;
    return { mensaje, esRetryable };
  }

  /**
   * Construye el mensaje de toast del resultado de una entrega/reintento de
   * forma HONESTA para el conductor:
   *  - éxito total -> verde
   *  - fallos pero TODOS recuperables (offline/5xx) -> info (no rojo): el
   *    trabajo quedó guardado y se sincroniza solo
   *  - algún fallo NO-retryable (requiere acción, ej. foto faltante / 4xx) ->
   *    rojo con el detalle accionable
   * Centralizado aquí para que entrega inicial, reintento manual y auto-sync
   * digan exactamente lo mismo.
   */
  static generarMensajeEntrega(
    batchResult: BatchProcessingResult,
    online: boolean,
  ): { type: 'success' | 'info' | 'error'; text1: string; text2?: string } | null {
    const { successCount, errorCount, results } = batchResult;
    if (successCount === 0 && errorCount === 0) {
      return null;
    }

    if (errorCount === 0) {
      return {
        type: 'success',
        text1: `${successCount} entrega(s) registrada(s)`,
      };
    }

    const fallidas = results.filter(r => !r.success);
    const todasRecuperables =
      fallidas.length > 0 &&
      fallidas.every(r => (r.apiError?.isRetryable ?? true));

    if (todasRecuperables) {
      const n = fallidas.length;
      return {
        type: 'info',
        text1: online
          ? `${n} entrega(s) guardada(s) · se sincronizan en breve`
          : `Sin conexión · ${n} entrega(s) guardada(s)`,
        text2: online
          ? 'El servidor está ocupado, se reintentarán solas.'
          : 'Se enviarán automáticamente al volver el internet.',
      };
    }

    // Hay al menos un fallo NO-retryable: el conductor debe actuar. Mostramos
    // el detalle del primero (ej. "La foto ya no está disponible...").
    const primeraNoRetryable = fallidas.find(
      r => r.apiError?.isRetryable === false,
    );
    const detalle =
      primeraNoRetryable?.apiError?.mensaje ||
      'Revisa el filtro "Errores" para corregir y reintentar.';

    if (successCount > 0) {
      return {
        type: 'info',
        text1: `${successCount} registrada(s) · ${errorCount} con error`,
        text2: detalle,
      };
    }

    return {
      type: 'error',
      text1: 'No se pudo registrar la entrega',
      text2: detalle,
    };
  }
}
