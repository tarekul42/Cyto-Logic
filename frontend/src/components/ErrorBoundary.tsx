import { Component, type ReactNode, type ErrorInfo } from 'react';
import { theme } from '../theme';

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', height: '100vh',
          background: theme.color.canvas, color: theme.color.textPrimary,
          fontFamily: theme.font.body, padding: 20,
        }}>
          <div style={{ fontSize: 48, marginBottom: 16, color: theme.color.error }}>&#x26A0;</div>
          <h1 style={{ color: theme.color.error, fontSize: 24, margin: '0 0 8px' }}>Something went wrong</h1>
          <p style={{ color: theme.color.textSecondary, marginBottom: 24, fontSize: theme.size.font.body }}>
            {this.state.error?.message || 'An unexpected error occurred.'}
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '10px 24px', background: theme.color.primary,
              color: theme.color.textPrimary, border: 'none',
              borderRadius: theme.size.radius.button, cursor: 'pointer',
              fontSize: theme.size.font.body, fontWeight: 600,
              boxShadow: theme.shadow.glow,
            }}
          >
            Reload Application
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
