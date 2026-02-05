import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

/**
 * Componente de prueba para Error Boundaries
 *
 * INSTRUCCIONES DE USO:
 * 1. Importa este componente en cualquier pantalla
 * 2. Agrega <ErrorBoundaryTester /> en el render
 * 3. Presiona los botones para simular diferentes tipos de errores
 * 4. Verifica que el error boundary muestre la UI de fallback
 * 5. Elimina este componente antes de producción
 */

// Componente que lanza un error de render
const ThrowErrorComponent: React.FC<{ shouldThrow: boolean }> = ({ shouldThrow }) => {
  if (shouldThrow) {
    throw new Error('💥 Error de prueba: Este error fue lanzado intencionalmente');
  }
  return <Text style={styles.successText}>✅ Sin errores</Text>;
};

export const ErrorBoundaryTester: React.FC = () => {
  const [throwError, setThrowError] = useState(false);

  const triggerRenderError = () => {
    console.log('🧪 Activando error de render...');
    setThrowError(true);
  };

  const triggerAsyncError = () => {
    console.log('🧪 Activando error asíncrono (NO capturado por error boundary)...');
    setTimeout(() => {
      throw new Error('Error asíncrono - esto NO será capturado por error boundary');
    }, 100);
  };

  const triggerEventHandlerError = () => {
    console.log('🧪 Activando error en event handler (NO capturado por error boundary)...');
    throw new Error('Error en event handler - esto NO será capturado por error boundary');
  };

  const reset = () => {
    setThrowError(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🧪 Error Boundary Tester</Text>
        <Text style={styles.subtitle}>
          Presiona un botón para probar el error boundary
        </Text>
      </View>

      {/* Componente que puede lanzar error */}
      <ThrowErrorComponent shouldThrow={throwError} />

      <View style={styles.buttonsContainer}>
        {/* Este error SÍ será capturado */}
        <TouchableOpacity
          style={[styles.button, styles.dangerButton]}
          onPress={triggerRenderError}
        >
          <Text style={styles.buttonText}>
            ✓ Lanzar Error de Render
          </Text>
          <Text style={styles.buttonSubtext}>(SÍ capturado)</Text>
        </TouchableOpacity>

        {/* Este error NO será capturado */}
        <TouchableOpacity
          style={[styles.button, styles.warningButton]}
          onPress={triggerAsyncError}
        >
          <Text style={styles.buttonText}>
            ✗ Lanzar Error Asíncrono
          </Text>
          <Text style={styles.buttonSubtext}>(NO capturado)</Text>
        </TouchableOpacity>

        {/* Este error NO será capturado (causará crash) */}
        <TouchableOpacity
          style={[styles.button, styles.warningButton]}
          onPress={triggerEventHandlerError}
        >
          <Text style={styles.buttonText}>
            ✗ Lanzar Error en Handler
          </Text>
          <Text style={styles.buttonSubtext}>(NO capturado)</Text>
        </TouchableOpacity>

        {/* Reset */}
        <TouchableOpacity
          style={[styles.button, styles.successButton]}
          onPress={reset}
        >
          <Text style={styles.buttonText}>🔄 Resetear</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.info}>
        <Text style={styles.infoTitle}>ℹ️ Qué esperar:</Text>
        <Text style={styles.infoText}>
          • Error de Render: Deberías ver la UI de fallback del error boundary
        </Text>
        <Text style={styles.infoText}>
          • Error Asíncrono: La app crasheará (error boundaries NO capturan estos)
        </Text>
        <Text style={styles.infoText}>
          • Error en Handler: La app crasheará (error boundaries NO capturan estos)
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    margin: 16,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  successText: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '600',
    marginVertical: 8,
    textAlign: 'center',
  },
  buttonsContainer: {
    marginTop: 12,
    gap: 8,
  },
  button: {
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  dangerButton: {
    backgroundColor: '#f44336',
  },
  warningButton: {
    backgroundColor: '#ff9800',
  },
  successButton: {
    backgroundColor: '#4CAF50',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonSubtext: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    marginTop: 2,
  },
  info: {
    marginTop: 16,
    padding: 12,
    backgroundColor: 'white',
    borderRadius: 8,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    lineHeight: 18,
  },
});
