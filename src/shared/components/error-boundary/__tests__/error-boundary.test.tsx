import React from 'react';
import { Text } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';
import { ErrorBoundary } from '../error-boundary.component';
import { FallbackErrorComponent } from '../fallback-error.component';

// Component that throws an error
const ThrowError: React.FC<{ shouldThrow: boolean }> = ({ shouldThrow }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <Text>No error</Text>;
};

// Suppress console.error for tests (since we're intentionally throwing errors)
const originalError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalError;
});

describe('ErrorBoundary', () => {
  it('should render children when there is no error', () => {
    const { getByText } = render(
      <ErrorBoundary>
        <Text>Test content</Text>
      </ErrorBoundary>
    );

    expect(getByText('Test content')).toBeTruthy();
  });

  it('should render fallback UI when error is caught', () => {
    const { getByText, queryByText } = render(
      <ErrorBoundary level="component">
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    // Should not render children
    expect(queryByText('No error')).toBeNull();

    // Should render fallback error message
    expect(getByText('Error')).toBeTruthy();
    expect(
      getByText('Hubo un problema al mostrar este contenido. Intenta nuevamente.')
    ).toBeTruthy();
  });

  it('should call onError callback when error occurs', () => {
    const onError = jest.fn();

    render(
      <ErrorBoundary level="form" onError={onError}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Test error',
      }),
      expect.objectContaining({
        componentStack: expect.any(String),
      })
    );
  });

  it('should reset error state when reset button is clicked', () => {
    const { getByText, rerender } = render(
      <ErrorBoundary level="form">
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    // Should show error
    expect(getByText('Error en el formulario')).toBeTruthy();

    // Click reset button
    const resetButton = getByText('Intentar nuevamente');
    fireEvent.press(resetButton);

    // After reset, re-render with shouldThrow=false
    rerender(
      <ErrorBoundary level="form">
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    );

    // Should render children again
    expect(getByText('No error')).toBeTruthy();
  });

  it('should render custom fallback when provided', () => {
    const CustomFallback = <Text>Custom error UI</Text>;

    const { getByText } = render(
      <ErrorBoundary fallback={CustomFallback}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(getByText('Custom error UI')).toBeTruthy();
  });

  it('should show different messages for different error levels', () => {
    const levels: Array<'root' | 'navigation' | 'form' | 'component'> = [
      'root',
      'navigation',
      'form',
      'component',
    ];

    const expectedTitles = {
      root: 'Algo salió mal',
      navigation: 'Error de navegación',
      form: 'Error en el formulario',
      component: 'Error',
    };

    levels.forEach(level => {
      const { getByText } = render(
        <ErrorBoundary level={level}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(getByText(expectedTitles[level])).toBeTruthy();
    });
  });
});

describe('FallbackErrorComponent', () => {
  const mockError = new Error('Test error message');
  const mockErrorInfo: React.ErrorInfo = {
    componentStack: 'at ThrowError\n  at ErrorBoundary',
  };

  it('should render error details in development mode', () => {
    // Mock __DEV__ to be true
    (global as any).__DEV__ = true;

    const { getByText } = render(
      <FallbackErrorComponent
        error={mockError}
        errorInfo={mockErrorInfo}
        onReset={jest.fn()}
        level="component"
      />
    );

    // Should show error details
    expect(getByText('Test error message')).toBeTruthy();
    expect(
      getByText('Detalles del error (solo en desarrollo):')
    ).toBeTruthy();
  });

  it('should not render error details in production mode', () => {
    // Mock __DEV__ to be false
    (global as any).__DEV__ = false;

    const { queryByText } = render(
      <FallbackErrorComponent
        error={mockError}
        errorInfo={mockErrorInfo}
        onReset={jest.fn()}
        level="component"
      />
    );

    // Should not show error details
    expect(queryByText('Test error message')).toBeNull();
    expect(
      queryByText('Detalles del error (solo en desarrollo):')
    ).toBeNull();

    // Reset __DEV__ to true for other tests
    (global as any).__DEV__ = true;
  });

  it('should call onReset when reset button is pressed', () => {
    const onReset = jest.fn();

    const { getByText } = render(
      <FallbackErrorComponent
        error={mockError}
        errorInfo={mockErrorInfo}
        onReset={onReset}
        level="form"
      />
    );

    const resetButton = getByText('Intentar nuevamente');
    fireEvent.press(resetButton);

    expect(onReset).toHaveBeenCalledTimes(1);
  });
});
