import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    errorMessage: '',
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, errorMessage: error.message || 'Xəta baş verdi' };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Xəta:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-cream flex items-center justify-center p-4 text-primary">
          <div className="max-w-md w-full bg-white border border-borderBeige rounded-2xl p-6 text-center shadow-lg space-y-4">
            <div className="inline-flex p-3 bg-red-100 text-red-600 rounded-xl">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-bold text-primary">
                Xəta baş verdi
              </h2>
              <p className="text-secondary text-xs sm:text-sm">
                Səhifəni yeniləyərək yenidən cəhd edin.
              </p>
            </div>

            {this.state.errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-left text-xs font-mono text-red-700 break-words">
                {this.state.errorMessage}
              </div>
            )}

            <button
              onClick={this.handleReload}
              className="inline-flex items-center space-x-2 px-5 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition shadow-sm"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Yenilə</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
