import React, { Component } from "react";
import type { ReactNode } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: React.ErrorInfo | null;
}

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
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        // Log error to console in development
        if (import.meta.env.DEV) {
            console.error("ErrorBoundary caught an error:", error, errorInfo);
        }

        // Send error to Sentry if available
        if (import.meta.env.VITE_SENTRY_DSN) {
            import("@sentry/react").then((Sentry) => {
                Sentry.captureException(error, {
                    contexts: {
                        react: {
                            componentStack: errorInfo.componentStack,
                        },
                    },
                });
            });
        }

        this.setState({
            error,
            errorInfo,
        });
    }

    handleReset = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null,
        });
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return <ErrorFallback error={this.state.error} onReset={this.handleReset} />;
        }

        return this.props.children;
    }
}

// Error Fallback Component
function ErrorFallback({ error, onReset }: { error: Error | null; onReset: () => void }) {
    // ✅ FIX: Use window.location instead of useNavigate() since ErrorBoundary is outside Router context
    const handleGoHome = () => {
        window.location.href = "/app/v1/dashboard";
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center p-6 bg-zinc-950 relative overflow-hidden">
            {/* Background gradient */}
            <div className="absolute inset-0 pointer-events-none z-0">
                <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-red-600/10 blur-[120px] rounded-full opacity-20" />
                <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 blur-[120px] rounded-full opacity-20" />
            </div>

            <div className="max-w-2xl w-full relative z-10">
                <div className="bg-zinc-900/80 backdrop-blur-xl border border-red-500/20 rounded-2xl p-8 shadow-2xl">
                    {/* Icon */}
                    <div className="flex items-center justify-center w-16 h-16 mx-auto mb-6 rounded-full bg-red-500/10 border border-red-500/20">
                        <AlertTriangle className="text-red-400" size={32} />
                    </div>

                    {/* Title */}
                    <h1 className="text-2xl font-bold text-center text-white mb-2">
                        Что-то пошло не так
                    </h1>
                    <p className="text-center text-zinc-400 mb-6">
                        Произошла неожиданная ошибка. Не волнуйтесь, ваши данные в безопасности.
                    </p>

                    {/* Error details (only in development) */}
                    {import.meta.env.DEV && error && (
                        <div className="mb-6 p-4 bg-zinc-800/50 border border-zinc-700/50 rounded-lg">
                            <p className="text-xs font-mono text-red-400 mb-2 font-semibold">
                                {error.name}: {error.message}
                            </p>
                            {error.stack && (
                                <pre className="text-xs text-zinc-500 overflow-auto max-h-48 font-mono">
                                    {error.stack}
                                </pre>
                            )}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <button
                            onClick={onReset}
                            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20"
                        >
                            <RefreshCw size={18} />
                            Попробовать снова
                        </button>
                        <button
                            onClick={handleGoHome}
                            className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 border border-zinc-700"
                        >
                            <Home size={18} />
                            На главную
                        </button>
                    </div>

                    {/* Help text */}
                    <p className="text-center text-xs text-zinc-500 mt-6">
                        Если проблема повторяется, пожалуйста,{" "}
                        <a
                            href="mailto:support@flowday.app"
                            className="text-indigo-400 hover:text-indigo-300 underline"
                        >
                            свяжитесь с поддержкой
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}

// HOC для простого использования
export function withErrorBoundary<P extends object>(
    Component: React.ComponentType<P>,
    fallback?: ReactNode
) {
    const WrappedComponent = (props: P) => (
        <ErrorBoundary fallback={fallback}>
            <Component {...props} />
        </ErrorBoundary>
    );

    WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

    return WrappedComponent;
}
