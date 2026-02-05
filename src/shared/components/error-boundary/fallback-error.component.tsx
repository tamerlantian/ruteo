import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { ErrorInfo } from 'react';

interface FallbackErrorProps {
  error: Error | null;
  errorInfo: ErrorInfo | null;
  onReset: () => void;
  level: 'root' | 'navigation' | 'form' | 'component';
}

/**
 * Fallback Error UI Component
 * Displayed when an error boundary catches an error
 */
export const FallbackErrorComponent: React.FC<FallbackErrorProps> = ({
  error,
  errorInfo,
  onReset,
  level,
}) => {
  const isProduction = !__DEV__;

  // Different messages based on error level
  const getLevelMessage = () => {
    switch (level) {
      case 'root':
        return {
          title: 'Algo salió mal',
          message:
            'La aplicación ha encontrado un error inesperado. Por favor, reinicia la aplicación.',
          showReset: true,
        };
      case 'navigation':
        return {
          title: 'Error de navegación',
          message:
            'Hubo un problema al cargar esta pantalla. Intenta volver atrás.',
          showReset: true,
        };
      case 'form':
        return {
          title: 'Error en el formulario',
          message:
            'No se pudo procesar el formulario. Por favor, verifica los datos e intenta nuevamente.',
          showReset: true,
        };
      case 'component':
        return {
          title: 'Error',
          message:
            'Hubo un problema al mostrar este contenido. Intenta nuevamente.',
          showReset: true,
        };
      default:
        return {
          title: 'Error',
          message: 'Algo salió mal. Por favor, intenta nuevamente.',
          showReset: true,
        };
    }
  };

  const { title, message, showReset } = getLevelMessage();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Error Icon */}
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>⚠️</Text>
        </View>

        {/* Error Title */}
        <Text style={styles.title}>{title}</Text>

        {/* Error Message */}
        <Text style={styles.message}>{message}</Text>

        {/* Reset Button */}
        {showReset && (
          <TouchableOpacity style={styles.button} onPress={onReset}>
            <Text style={styles.buttonText}>Intentar nuevamente</Text>
          </TouchableOpacity>
        )}

        {/* Error Details (Development Only) */}
        {!isProduction && error && (
          <ScrollView style={styles.errorDetails}>
            <Text style={styles.errorDetailsTitle}>
              Detalles del error (solo en desarrollo):
            </Text>
            <Text style={styles.errorName}>{error.name}</Text>
            <Text style={styles.errorMessage}>{error.message}</Text>
            {error.stack && (
              <Text style={styles.errorStack}>{error.stack}</Text>
            )}
            {errorInfo?.componentStack && (
              <>
                <Text style={styles.errorDetailsTitle}>Component Stack:</Text>
                <Text style={styles.errorStack}>
                  {errorInfo.componentStack}
                </Text>
              </>
            )}
          </ScrollView>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  icon: {
    fontSize: 48,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  errorDetails: {
    marginTop: 24,
    maxHeight: 200,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
  },
  errorDetailsTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
    marginTop: 8,
  },
  errorName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#d32f2f',
    marginBottom: 4,
  },
  errorMessage: {
    fontSize: 13,
    color: '#d32f2f',
    marginBottom: 8,
  },
  errorStack: {
    fontSize: 11,
    color: '#666',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    lineHeight: 16,
  },
});
