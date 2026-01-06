import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
        errorInfo: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error, errorInfo: null };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ errorInfo });
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="p-6 bg-red-900/20 border border-red-500/50 rounded-xl text-white max-h-[80vh] overflow-auto">
                    <h2 className="text-xl font-bold text-red-400 mb-4">Something went wrong</h2>
                    <div className="font-mono text-sm bg-black/50 p-4 rounded mb-4">
                        {this.state.error && this.state.error.toString()}
                    </div>
                    {this.state.errorInfo && (
                        <details className="text-xs text-gray-400">
                            <summary className="cursor-pointer hover:text-white mb-2">Stack Trace</summary>
                            <pre className="whitespace-pre-wrap">
                                {this.state.errorInfo.componentStack}
                            </pre>
                        </details>
                    )}
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
