// client/src/components/ErrorBoundary.tsx
// Tətbiqin hər hansı hissəsində baş verən gözlənilməz render xətalarını
// tutaraq istifadəçiyə zərif və anlaşıqlı Azərbaycan dilində xəta ekranı göstərən Error Boundary.

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
    return { hasError: true, errorMessage: error.message || 'Gözlənilməz xəta baş verdi' };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary tərəfindən tutulan xəta:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-cream flex items-center justify-center p-6 text-primary">
          <div className="max-w-md w-full bg-white border border-borderBeige rounded-3xl p-8 text-center shadow-xl space-y-6">
            <div className="inline-flex p-4 bg-red-100 text-red-700 rounded-2xl shadow-sm">
              <AlertTriangle className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-black tracking-tight text-primary">
                Gözlənilməz Xəta Baş Verdi
              </h2>
              <p className="text-secondary text-sm leading-relaxed">
                Tətbiqin icrası zamanı xəta yarandı. Zəhmət olmasa səhifəni yeniləyin və ya yenidən cəhd edin.
              </p>
            </div>

            {this.state.errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-left text-xs font-mono text-red-700 break-words">
                {this.state.errorMessage}
              </div>
            )}

            <button
              onClick={this.handleReload}
              className="inline-flex items-center space-x-2 px-6 py-3.5 bg-primary hover:bg-primary-hover text-white text-sm font-bold rounded-2xl transition shadow-md shadow-primary/20"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Səhifəni Yeniləyin</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
