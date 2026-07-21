import { Component } from 'react';
import { theme } from '../theme';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
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
