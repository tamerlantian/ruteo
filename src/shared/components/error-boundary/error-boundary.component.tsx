import React, { Component, ErrorInfo, ReactNode } from 'react';
import { FallbackErrorComponent } from './fallback-error.component';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  level?: 'root' | 'navigation' | 'form' | 'component';
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Error Boundary Component
 * Catches JavaScript errors anywhere in the child component tree
 *
 * Usage:
 * <ErrorBoundary level="root" onError={logErrorToService}>
 *   <App />
 * </ErrorBoundary>
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error details
    const { level = 'component', onError } = this.props;

    console.error(
      `[ErrorBoundary - ${level}] Error caught:`,
      error,
      errorInfo
    );

    // Call custom error handler if provided
    if (onError) {
      onError(error, errorInfo);
    }

    // Store error info in state
    this.setState({
      errorInfo,
    });

    // TODO: Log to crash reporting service (Sentry)
    // Sentry.captureException(error, {
    //   contexts: {
    //     react: {
    //       componentStack: errorInfo.componentStack,
    //       level,
    //     },
    //   },
    // });
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render(): ReactNode {
    const { hasError, error, errorInfo } = this.state;
    const { children, fallback, level = 'component' } = this.props;

    if (hasError) {
      // If custom fallback provided, use it
      if (fallback) {
        return fallback;
      }

      // Otherwise, use default fallback component
      return (
        <FallbackErrorComponent
          error={error}
          errorInfo={errorInfo}
          onReset={this.handleReset}
          level={level}
        />
      );
    }

    return children;
  }
}
