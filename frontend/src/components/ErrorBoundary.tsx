import React, { Component } from "react";
import type { ReactNode } from "react";
import { ErrorFallback } from "./error/ErrorFallback";

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
        // Always log error to console for debugging
        console.error("🚨 ErrorBoundary caught an error:", error);
        console.error("Error stack:", error.stack);
        console.error("Component stack:", errorInfo.componentStack);
        
        // Log error to console in development
        if (import.meta.env.DEV) {
            console.error("Full error info:", errorInfo);
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

            return (
                <ErrorFallback 
                    error={this.state.error} 
                    resetErrorBoundary={this.handleReset}
                />
            );
        }

        return this.props.children;
    }
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
