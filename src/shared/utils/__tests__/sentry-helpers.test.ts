import * as Sentry from '@sentry/react-native';
import {
  withSentryErrorTracking,
  reportError,
  reportAsyncStorageError,
  reportLocationTrackingError,
  reportMutationError,
  reportTokenRefreshError,
  reportBatchProcessingError,
  isNetworkError,
  isPermissionError,
  addSentryBreadcrumb,
} from '../sentry-helpers';

// Mock Sentry
jest.mock('@sentry/react-native', () => ({
  captureException: jest.fn(),
  addBreadcrumb: jest.fn(),
}));

describe('sentry-helpers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('withSentryErrorTracking', () => {
    it('should execute callback successfully without errors', () => {
      const callback = jest.fn(() => 'success');
      const wrapped = withSentryErrorTracking('test_operation', callback, {
        module: 'test',
        location: 'test-file',
      });

      const result = wrapped('arg1', 'arg2');

      expect(result).toBe('success');
      expect(callback).toHaveBeenCalledWith('arg1', 'arg2');
      expect(Sentry.captureException).not.toHaveBeenCalled();
    });

    it('should catch synchronous errors and report to Sentry', () => {
      const error = new Error('Test error');
      const callback = jest.fn(() => {
        throw error;
      });
      const wrapped = withSentryErrorTracking('test_operation', callback, {
        module: 'test',
        location: 'test-file',
      });

      expect(() => wrapped()).toThrow(error);
      expect(Sentry.captureException).toHaveBeenCalledWith(
        error,
        expect.objectContaining({
          level: 'error',
          tags: {
            operation: 'test_operation',
            module: 'test',
            location: 'test-file',
          },
        })
      );
    });

    it('should catch promise rejections and report to Sentry', async () => {
      const error = new Error('Async error');
      const callback = jest.fn(() => Promise.reject(error));
      const wrapped = withSentryErrorTracking('async_operation', callback, {
        module: 'test',
        location: 'test-file',
      });

      await expect(wrapped()).rejects.toThrow(error);
      expect(Sentry.captureException).toHaveBeenCalledWith(
        error,
        expect.objectContaining({
          level: 'error',
          tags: {
            operation: 'async_operation',
            module: 'test',
            location: 'test-file',
          },
        })
      );
    });

    it('should use custom severity level', () => {
      const error = new Error('Warning error');
      const callback = jest.fn(() => {
        throw error;
      });
      const wrapped = withSentryErrorTracking(
        'test_operation',
        callback,
        { module: 'test', location: 'test-file' },
        'warning'
      );

      expect(() => wrapped()).toThrow(error);
      expect(Sentry.captureException).toHaveBeenCalledWith(
        error,
        expect.objectContaining({
          level: 'warning',
        })
      );
    });

    it('should not report network errors', () => {
      const networkError = new Error('NO_INTERNET_CONNECTION');
      const callback = jest.fn(() => {
        throw networkError;
      });
      const wrapped = withSentryErrorTracking('test_operation', callback, {
        module: 'test',
        location: 'test-file',
      });

      expect(() => wrapped()).toThrow(networkError);
      expect(Sentry.captureException).not.toHaveBeenCalled();
    });
  });

  describe('reportError', () => {
    it('should report error with correct tags and context', () => {
      const error = new Error('Test error');
      reportError('test_operation', error, {
        module: 'auth',
        location: 'login-service',
        userId: '123',
      });

      expect(Sentry.captureException).toHaveBeenCalledWith(
        error,
        expect.objectContaining({
          level: 'error',
          tags: {
            operation: 'test_operation',
            module: 'auth',
            location: 'login-service',
          },
          contexts: {
            operation_context: expect.objectContaining({
              operation: 'test_operation',
              errorMessage: 'Test error',
              module: 'auth',
              location: 'login-service',
              userId: '123',
            }),
          },
        })
      );
    });

    it('should not report network errors', () => {
      const networkError = new Error('Network request failed');
      reportError('test_operation', networkError, {
        module: 'test',
        location: 'test-file',
      });

      expect(Sentry.captureException).not.toHaveBeenCalled();
    });

    it('should normalize string errors to Error instances', () => {
      reportError('test_operation', 'String error', {
        module: 'test',
        location: 'test-file',
      });

      expect(Sentry.captureException).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({
          contexts: {
            operation_context: expect.objectContaining({
              errorMessage: 'String error',
            }),
          },
        })
      );

      const capturedError = (Sentry.captureException as jest.Mock).mock.calls[0][0];
      expect(capturedError).toBeInstanceOf(Error);
      expect(capturedError.message).toBe('String error');
    });

    it('should normalize custom error objects (backend errors)', () => {
      const customError = {
        codigo: 404,
        mensaje: 'Usuario no encontrado',
        titulo: 'Error de validación',
        isRetryable: false,
      };

      reportError('test_operation', customError, {
        module: 'auth',
        location: 'register-view-model',
      });

      expect(Sentry.captureException).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({
          contexts: {
            operation_context: expect.objectContaining({
              errorMessage: 'Usuario no encontrado',
              originalError: customError,
              module: 'auth',
              location: 'register-view-model',
            }),
          },
        })
      );

      const capturedError = (Sentry.captureException as jest.Mock).mock.calls[0][0];
      expect(capturedError).toBeInstanceOf(Error);
      expect(capturedError.message).toBe('Error de validación: Usuario no encontrado');
      expect((capturedError as any).originalError).toEqual(customError);
    });

    it('should handle custom error objects without mensaje field', () => {
      const customError = {
        codigo: 500,
        titulo: 'Error del servidor',
      };

      reportError('test_operation', customError, {
        module: 'test',
        location: 'test-file',
      });

      const capturedError = (Sentry.captureException as jest.Mock).mock.calls[0][0];
      expect(capturedError).toBeInstanceOf(Error);
      expect(capturedError.message).toContain('Error del servidor');
    });
  });

  describe('reportAsyncStorageError', () => {
    it('should report AsyncStorage errors with correct context', () => {
      const error = new Error('Storage full');
      reportAsyncStorageError('setItem', error, { key: 'user_session' });

      expect(Sentry.captureException).toHaveBeenCalledWith(
        error,
        expect.objectContaining({
          level: 'error',
          tags: {
            operation: 'async_storage_setItem',
            module: 'storage',
            location: 'async-storage',
          },
          contexts: {
            operation_context: expect.objectContaining({
              storageOperation: 'setItem',
              key: 'user_session',
            }),
          },
        })
      );
    });
  });

  describe('reportLocationTrackingError', () => {
    it('should report submission errors as warnings', () => {
      const error = new Error('Location submission failed');
      reportLocationTrackingError('submission', error, {
        locationCount: 5,
        errorCount: 3,
      });

      expect(Sentry.captureException).toHaveBeenCalledWith(
        error,
        expect.objectContaining({
          level: 'warning',
          tags: {
            operation: 'location_tracking_submission',
            module: 'geolocation',
            location: 'background-geolocation-service',
          },
          contexts: {
            operation_context: expect.objectContaining({
              trackingPhase: 'submission',
              locationCount: 5,
              errorCount: 3,
            }),
          },
        })
      );
    });

    it('should report startup errors as errors', () => {
      const error = new Error('Failed to start tracking');
      reportLocationTrackingError('startup', error);

      expect(Sentry.captureException).toHaveBeenCalledWith(
        error,
        expect.objectContaining({
          level: 'error',
        })
      );
    });
  });

  describe('reportMutationError', () => {
    it('should report mutation errors with API context', () => {
      const error = {
        message: 'Invalid credentials',
        response: { status: 401 },
        config: { url: '/api/auth/login', method: 'POST' },
      };

      reportMutationError('login', error, { module: 'auth', email: 'test@example.com' });

      expect(Sentry.captureException).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({
          contexts: {
            operation_context: expect.objectContaining({
              isApiError: true,
              statusCode: 401,
              apiEndpoint: '/api/auth/login',
              httpMethod: 'POST',
              module: 'auth',
              email: 'test@example.com',
              originalError: error,
            }),
          },
        })
      );

      const capturedError = (Sentry.captureException as jest.Mock).mock.calls[0][0];
      expect(capturedError).toBeInstanceOf(Error);
    });

    it('should report standard Error instances without modification', () => {
      const error = new Error('Standard error');
      (error as any).response = { status: 500 };

      reportMutationError('save', error, { module: 'data' });

      expect(Sentry.captureException).toHaveBeenCalledWith(
        error,
        expect.objectContaining({
          contexts: {
            operation_context: expect.objectContaining({
              isApiError: true,
              statusCode: 500,
            }),
          },
        })
      );

      const capturedError = (Sentry.captureException as jest.Mock).mock.calls[0][0];
      expect(capturedError).toBe(error); // Same instance, not normalized
    });

    it('should not report network errors', () => {
      const networkError = { message: 'NO_INTERNET_CONNECTION' };
      reportMutationError('login', networkError, { module: 'auth' });

      expect(Sentry.captureException).not.toHaveBeenCalled();
    });
  });

  describe('reportTokenRefreshError', () => {
    it('should report refresh attempts as errors', () => {
      const error = new Error('Invalid refresh token');
      reportTokenRefreshError('refresh_attempt', error, {
        attempt: 1,
        queueLength: 5,
      });

      expect(Sentry.captureException).toHaveBeenCalledWith(
        error,
        expect.objectContaining({
          level: 'error',
          tags: {
            operation: 'token_refresh_refresh_attempt',
            module: 'auth',
            location: 'token-service',
          },
        })
      );
    });

    it('should report queue processing as warnings', () => {
      const error = new Error('Queue processing failed');
      reportTokenRefreshError('queue_processing', error);

      expect(Sentry.captureException).toHaveBeenCalledWith(
        error,
        expect.objectContaining({
          level: 'warning',
        })
      );
    });
  });

  describe('reportBatchProcessingError', () => {
    it('should report batch processing errors', () => {
      const error = new Error('Batch failed');
      reportBatchProcessingError('entrega', error, {
        totalCount: 10,
        processedCount: 7,
        failedCount: 3,
      });

      expect(Sentry.captureException).toHaveBeenCalledWith(
        error,
        expect.objectContaining({
          tags: {
            operation: 'batch_processing_entrega',
            module: 'visita',
            location: 'entrega-processing',
          },
          contexts: {
            operation_context: expect.objectContaining({
              batchType: 'entrega',
              totalCount: 10,
              processedCount: 7,
              failedCount: 3,
            }),
          },
        })
      );
    });
  });

  describe('isNetworkError', () => {
    it('should detect NO_INTERNET_CONNECTION errors', () => {
      expect(isNetworkError({ message: 'NO_INTERNET_CONNECTION' })).toBe(true);
    });

    it('should detect Network request failed errors', () => {
      expect(isNetworkError({ message: 'Network request failed' })).toBe(true);
    });

    it('should detect axios errors without response', () => {
      expect(isNetworkError({ isAxiosError: true, response: undefined })).toBe(true);
    });

    it('should not detect axios errors with response', () => {
      expect(isNetworkError({ isAxiosError: true, response: { status: 500 } })).toBe(false);
    });

    it('should detect network error codes', () => {
      expect(isNetworkError({ code: 'ECONNABORTED' })).toBe(true);
      expect(isNetworkError({ code: 'ENOTFOUND' })).toBe(true);
      expect(isNetworkError({ code: 'ENETUNREACH' })).toBe(true);
    });

    it('should return false for non-network errors', () => {
      expect(isNetworkError({ message: 'Invalid credentials' })).toBe(false);
      expect(isNetworkError(null as any)).toBe(false);
      expect(isNetworkError(undefined as any)).toBe(false);
    });
  });

  describe('isPermissionError', () => {
    it('should detect permission denied errors', () => {
      expect(isPermissionError({ message: 'PERMISSION_DENIED' })).toBe(true);
      expect(isPermissionError({ message: 'User denied permission' })).toBe(true);
      expect(isPermissionError({ message: 'Location permission required' })).toBe(true);
    });

    it('should return false for non-permission errors', () => {
      expect(isPermissionError({ message: 'Network error' })).toBe(false);
      expect(isPermissionError(null)).toBe(false);
      expect(isPermissionError(undefined)).toBe(false);
    });
  });

  describe('addSentryBreadcrumb', () => {
    it('should add breadcrumb with default level', () => {
      addSentryBreadcrumb('test_category', 'Test message', { key: 'value' });

      expect(Sentry.addBreadcrumb).toHaveBeenCalledWith({
        category: 'test_category',
        message: 'Test message',
        level: 'info',
        data: { key: 'value' },
      });
    });

    it('should add breadcrumb with custom level', () => {
      addSentryBreadcrumb('error_category', 'Error message', undefined, 'error');

      expect(Sentry.addBreadcrumb).toHaveBeenCalledWith({
        category: 'error_category',
        message: 'Error message',
        level: 'error',
        data: undefined,
      });
    });
  });
});
