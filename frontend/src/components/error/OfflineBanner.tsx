import { WifiOff } from "lucide-react";
import { useOffline } from "../../hooks/useOffline";

export function OfflineBanner() {
    const isOffline = useOffline();

    if (!isOffline) return null;

    return (
        <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500/90 backdrop-blur-sm border-b border-amber-600/50">
            <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-center gap-2 text-white text-sm font-medium">
                <WifiOff size={16} />
                <span>Нет подключения к интернету. Некоторые функции могут быть недоступны.</span>
            </div>
        </div>
    );
}
