import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-[#F7F8FA] flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-red-100 flex items-center justify-center">
              <AlertTriangle size={40} className="text-red-600" />
            </div>

            <h1 className="text-2xl font-bold text-[#0E1A2B] mb-3">
              Something went wrong
            </h1>

            <p className="text-slate-600 mb-2">
              We encountered an unexpected error. Please try refreshing the page.
            </p>

            {this.state.error && (
              <details className="mt-4 text-left">
                <summary className="cursor-pointer text-sm text-slate-500 hover:text-slate-700">
                  Technical details
                </summary>
                <pre className="mt-2 p-4 bg-slate-100 rounded-xl text-xs overflow-auto max-h-40">
                  {this.state.error.message}
                </pre>
              </details>
            )}

            <button
              onClick={this.handleReload}
              className="mt-6 px-6 py-3 bg-teal-500 text-white rounded-xl font-bold hover:bg-teal-600 transition-colors flex items-center gap-2 mx-auto"
            >
              <RefreshCw size={18} />
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
