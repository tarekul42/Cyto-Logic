import { Component, type ReactNode, type ErrorInfo } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("ErrorBoundary caught:", error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="flex items-center justify-center h-full p-6 text-center"
          style={{
            color: "var(--color-text-secondary)",
            fontSize: "var(--size-font-body)",
          }}
        >
          <div>
            <div className="text-[32px] mb-3">⚠</div>
            <div className="font-bold mb-2">Something went wrong</div>
            <div
              style={{
                color: "var(--color-text-tertiary)",
                fontSize: "var(--size-font-small)",
              }}
            >
              {this.state.error?.message}
            </div>
            <button
              onClick={this.handleReset}
              className="mt-4 px-4 py-2 rounded-md font-semibold text-[13px] border-none cursor-pointer"
              style={{
                background: "var(--color-primary)",
                color: "var(--color-text-primary)",
              }}
            >
              Try again
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
