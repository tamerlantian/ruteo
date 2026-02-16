import * as Sentry from '@sentry/react-native';

/**
 * Sentry error reporting helpers
 *
 * These utilities provide consistent error reporting across the app.
 * They handle different error types (async, callbacks, mutations) and
 * automatically attach appropriate context and tags.
 */

export type SentryLevel = 'fatal' | 'error' | 'warning' | 'info';

interface ErrorContext {
  operation: string;
  module: string;
  location: string;
  [key: string]: any;
}

/**
 * Wraps a callback function with Sentry error tracking
 * Useful for native callbacks, event handlers, and async operations
 *
 * @example
 * const wrappedCallback = withSentryErrorTracking(
 *   'onLocationUpdate',
 *   (location) => { ... },
 *   { module: 'geolocation', location: 'background-service' }
 * );
 */
export function withSentryErrorTracking<T extends (...args: any[]) => any>(
  operationName: string,
  callback: T,
  context: Partial<ErrorContext>,
  level: SentryLevel = 'error'
): T {
  return ((...args: any[]) => {
    try {
      const result = callback(...args);

      // Handle promises
      if (result && typeof result.then === 'function') {
        return result.catch((error: any) => {
          reportError(operationName, error, context, level);
          throw error; // Re-throw to maintain original behavior
        });
      }

      return result;
    } catch (error) {
      reportError(operationName, error, context, level);
      throw error; // Re-throw to maintain original behavior
    }
  }) as T;
}

/**
 * Reports an error to Sentry with standardized context and tags
 *
 * @param operation - Name of the operation that failed (e.g., 'login', 'token_refresh')
 * @param error - The error object
 * @param context - Additional context (module, location, custom data)
 * @param level - Severity level (default: 'error')
 */
export function reportError(
  operation: string,
  error: any,
  context: Partial<ErrorContext>,
  level: SentryLevel = 'error'
): void {
  // Skip network errors - these are user problems, not bugs
  if (isNetworkError(error)) {
    return;
  }

  const errorMessage = error?.message || error?.mensaje || String(error);

  // Normalize error to Error instance for Sentry
  // This handles custom error objects from API responses
  let normalizedError: Error;

  if (error instanceof Error) {
    normalizedError = error;
  } else if (typeof error === 'object' && error !== null) {
    // Handle custom error objects (e.g., {codigo, mensaje, titulo})
    const errorTitle = error.titulo || error.title || 'Error';
    const errorMsg = error.mensaje || error.message || JSON.stringify(error);
    normalizedError = new Error(`${errorTitle}: ${errorMsg}`);

    // Preserve original error data in the error object
    (normalizedError as any).originalError = error;
  } else {
    normalizedError = new Error(String(error));
  }

  Sentry.captureException(normalizedError, {
    level,
    tags: {
      operation,
      module: context.module || 'unknown',
      location: context.location || 'unknown',
    },
    contexts: {
      operation_context: {
        operation,
        errorMessage,
        // Include original error structure if it's a custom object
        ...(error && typeof error === 'object' && !(error instanceof Error)
          ? { originalError: error }
          : {}),
        ...context,
      },
    },
  });
}

/**
 * Reports AsyncStorage operation errors
 *
 * @example
 * try {
 *   await AsyncStorage.setItem('key', value);
 * } catch (error) {
 *   reportAsyncStorageError('setItem', error, { key: 'session_data' });
 * }
 */
export function reportAsyncStorageError(
  operation: 'getItem' | 'setItem' | 'removeItem' | 'multiSet' | 'multiRemove' | 'clear',
  error: any,
  additionalContext?: Record<string, any>
): void {
  reportError(
    `async_storage_${operation}`,
    error,
    {
      module: 'storage',
      location: 'async-storage',
      storageOperation: operation,
      ...additionalContext,
    },
    'error'
  );
}

/**
 * Reports location tracking errors
 *
 * @param phase - Which tracking phase failed (startup, runtime, submission, restoration)
 * @param error - The error object
 * @param context - Additional context (orderData, locationCount, etc.)
 */
export function reportLocationTrackingError(
  phase: 'startup' | 'runtime' | 'submission' | 'restoration' | 'cleanup',
  error: any,
  context?: Record<string, any>
): void {
  const level: SentryLevel = phase === 'submission' ? 'warning' : 'error';

  reportError(
    `location_tracking_${phase}`,
    error,
    {
      module: 'geolocation',
      location: 'background-geolocation-service',
      trackingPhase: phase,
      ...context,
    },
    level
  );
}

/**
 * Reports mutation errors from view models (React Query)
 * Automatically filters out network errors
 *
 * @example
 * onError: (error: any) => {
 *   if (error.message === 'NO_INTERNET_CONNECTION') {
 *     Toast.show({ type: 'error', text1: 'Sin conexión' });
 *     return;
 *   }
 *   reportMutationError('login', error, { module: 'auth', email: data.email });
 *   Toast.show({ type: 'error', text1: 'Error al iniciar sesión' });
 * }
 */
export function reportMutationError(
  mutationName: string,
  error: any,
  context: Partial<ErrorContext>
): void {
  // Double-check network errors (should be checked before calling this)
  if (isNetworkError(error)) {
    return;
  }

  const isApiError = error?.response?.status !== undefined;

  reportError(
    `mutation_${mutationName}`,
    error,
    {
      ...context,
      isApiError,
      statusCode: error?.response?.status,
      apiEndpoint: error?.config?.url,
      httpMethod: error?.config?.method,
    },
    'error'
  );
}

/**
 * Reports token refresh errors with queue context
 *
 * @param phase - Which refresh phase failed (refresh_attempt, clear_tokens, queue_processing)
 * @param error - The error object
 * @param context - Additional context (queueLength, attempt, etc.)
 */
export function reportTokenRefreshError(
  phase: 'refresh_attempt' | 'clear_tokens' | 'queue_processing',
  error: any,
  context?: Record<string, any>
): void {
  // Token refresh failures are critical - use 'error' level
  // Queue processing issues are less critical - use 'warning'
  const level: SentryLevel = phase === 'queue_processing' ? 'warning' : 'error';

  reportError(
    `token_refresh_${phase}`,
    error,
    {
      module: 'auth',
      location: 'token-service',
      refreshPhase: phase,
      ...context,
    },
    level
  );
}

/**
 * Reports batch processing errors (for visita/novedad processing)
 * Only reports catastrophic errors, not individual item failures
 *
 * @param batchType - Type of batch operation (entrega, novedad, etc.)
 * @param error - The error object
 * @param context - Batch context (totalCount, processedCount, etc.)
 */
export function reportBatchProcessingError(
  batchType: 'entrega' | 'novedad' | 'location',
  error: any,
  context: Record<string, any>
): void {
  reportError(
    `batch_processing_${batchType}`,
    error,
    {
      module: batchType === 'location' ? 'geolocation' : 'visita',
      location: `${batchType}-processing`,
      batchType,
      ...context,
    },
    'error'
  );
}

/**
 * Checks if an error is a network connectivity error
 * These should NOT be reported to Sentry (user problem, not a bug)
 */
export function isNetworkError(error: any): boolean {
  if (!error) return false;

  const message = error?.message || '';
  const code = error?.code || '';

  // Check common network error patterns
  return (
    message === 'NO_INTERNET_CONNECTION' ||
    message.includes('Network request failed') ||
    message.includes('Network Error') ||
    code === 'ECONNABORTED' ||
    code === 'ENOTFOUND' ||
    code === 'ENETUNREACH' ||
    (error?.isAxiosError === true && !error?.response) // No response = network issue
  );
}

/**
 * Checks if an error is a permission denial (user choice)
 * These should NOT be reported to Sentry
 */
export function isPermissionError(error: any): boolean {
  if (!error) return false;

  const message = error?.message || '';

  return (
    message.includes('permission') ||
    message.includes('Permission') ||
    message.includes('PERMISSION_DENIED') ||
    message.includes('User denied')
  );
}

/**
 * Utility to create a Sentry breadcrumb for tracking operation flow
 * Useful for understanding the sequence of events leading to an error
 *
 * @example
 * addSentryBreadcrumb('location_tracking', 'Started tracking for order 123', { orderId: 123 });
 */
export function addSentryBreadcrumb(
  category: string,
  message: string,
  data?: Record<string, any>,
  level: 'debug' | 'info' | 'warning' | 'error' = 'info'
): void {
  Sentry.addBreadcrumb({
    category,
    message,
    level,
    data,
  });
}
