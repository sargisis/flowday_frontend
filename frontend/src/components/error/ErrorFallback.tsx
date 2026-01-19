import { AlertTriangle, Home } from "lucide-react";
import { RetryButton } from "./RetryButton";

interface ErrorFallbackProps {
    error: Error | null;
    resetErrorBoundary?: () => void;
    retry?: () => void;
    showDetails?: boolean;
}

export function ErrorFallback({ 
    error, 
    resetErrorBoundary, 
    retry,
    showDetails = import.meta.env.DEV 
}: ErrorFallbackProps) {
    const handleGoHome = () => {
        window.location.href = "/app/v1/dashboard";
    };

    const errorMessage = error?.message || "Произошла неожиданная ошибка";
    const userFriendlyMessage = getUserFriendlyMessage(errorMessage);

    return (
        <div className="min-h-[400px] flex items-center justify-center p-6">
            <div className="max-w-md w-full text-center">
                {/* Icon */}
                <div className="flex items-center justify-center w-16 h-16 mx-auto mb-6 rounded-full bg-red-500/10 border border-red-500/20">
                    <AlertTriangle className="text-red-400" size={32} />
                </div>

                {/* Title */}
                <h2 className="text-xl font-bold text-zinc-200 mb-2">
                    Что-то пошло не так
                </h2>
                <p className="text-zinc-400 mb-6">
                    {userFriendlyMessage}
                </p>

                {/* Error details (only in development) */}
                {showDetails && error && (
                    <div className="mb-6 p-4 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-left">
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
                    {(retry || resetErrorBoundary) && (
                        <RetryButton 
                            onRetry={retry || resetErrorBoundary || (() => {})} 
                        />
                    )}
                    <button
                        onClick={handleGoHome}
                        className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2 border border-zinc-700"
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
    );
}

function getUserFriendlyMessage(errorMessage: string): string {
    const errorMap: Record<string, string> = {
        'Network Error': 'Проблема с подключением. Проверьте интернет.',
        'Failed to fetch': 'Не удалось подключиться к серверу. Проверьте интернет.',
        '401': 'Сессия истекла. Пожалуйста, войдите снова.',
        '403': 'У вас нет доступа к этому ресурсу.',
        '404': 'Ресурс не найден.',
        '500': 'Ошибка сервера. Попробуйте позже.',
        'timeout': 'Запрос занял слишком много времени. Попробуйте снова.',
    };

    for (const [key, message] of Object.entries(errorMap)) {
        if (errorMessage.toLowerCase().includes(key.toLowerCase())) {
            return message;
        }
    }

    return 'Произошла неожиданная ошибка. Не волнуйтесь, ваши данные в безопасности.';
}
