import { useState, useEffect } from 'react';
import { toast } from 'sonner';

export function useOffline() {
    const [isOffline, setIsOffline] = useState(!navigator.onLine);

    useEffect(() => {
        const handleOnline = () => {
            setIsOffline(false);
            toast.success('Подключение восстановлено', {
                duration: 2000,
            });
        };

        const handleOffline = () => {
            setIsOffline(true);
            toast.warning('Нет подключения к интернету', {
                duration: 3000,
            });
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    return isOffline;
}
