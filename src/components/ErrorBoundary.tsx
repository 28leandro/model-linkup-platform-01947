import React from 'react';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    if (import.meta.env.DEV) {
      console.error('ErrorBoundary caught:', error, info);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
    if (typeof window !== 'undefined') window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-background">
          <div className="max-w-md w-full text-center space-y-4">
            <h1 className="text-2xl font-bold text-foreground">Algo deu errado</h1>
            <p className="text-sm text-muted-foreground">
              Ocorreu um erro inesperado. Por favor, recarregue a página ou tente novamente em alguns instantes.
            </p>
            <button
              type="button"
              onClick={this.handleReset}
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 min-h-11"
            >
              Recarregar
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;