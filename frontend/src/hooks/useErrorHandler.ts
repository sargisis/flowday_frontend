import { useCallback } from 'react';
import { toast } from 'sonner';

interface ErrorMapping {
    [key: string]: string;
}

const ERROR_MESSAGES: ErrorMapping = {
    'Network Error': 'Проблема с подключением. Проверьте интернет.',
    'Failed to fetch': 'Не удалось подключиться к серверу. Проверьте интернет.',
    '401': 'Сессия истекла. Пожалуйста, войдите снова.',
    '403': 'У вас нет доступа к этому ресурсу.',
    '404': 'Ресурс не найден.',
    '500': 'Ошибка сервера. Попробуйте позже.',
    'timeout': 'Запрос занял слишком много времени. Попробуйте снова.',
    'ECONNREFUSED': 'Сервер недоступен. Попробуйте позже.',
    'ENOTFOUND': 'Не удалось найти сервер. Проверьте подключение.',
};

export function useErrorHandler() {
    const handleError = useCallback((error: unknown, customMessage?: string) => {
        let message = customMessage || 'Произошла ошибка';

        if (error instanceof Error) {
            // Проверяем сообщение об ошибке
            message = ERROR_MESSAGES[error.message] || error.message || message;
            
            // Проверяем код ошибки если есть
            if ((error as any).code) {
                const codeMessage = ERROR_MESSAGES[(error as any).code];
                if (codeMessage) {
                    message = codeMessage;
                }
            }

            // Проверяем response status если это HTTP ошибка
            if ((error as any).response?.status) {
                const status = String((error as any).response.status);
                const statusMessage = ERROR_MESSAGES[status];
                if (statusMessage) {
                    message = statusMessage;
                }
            }
        } else if (typeof error === 'string') {
            message = ERROR_MESSAGES[error] || error;
        }

        toast.error(message);
        
        // Логировать в Sentry в продакшене
        if (import.meta.env.PROD) {
            import('@sentry/react').then((Sentry) => {
                Sentry.captureException(error);
            }).catch(() => {
                // Sentry не доступен, просто логируем
                console.error('Error:', error);
            });
        } else {
            // В разработке просто логируем
            console.error('Error:', error);
        }
    }, []);

    return { handleError };
}
