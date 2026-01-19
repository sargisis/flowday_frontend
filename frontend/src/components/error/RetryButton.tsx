import { RefreshCw } from "lucide-react";

interface RetryButtonProps {
    onRetry: () => void;
    isLoading?: boolean;
    className?: string;
}

export function RetryButton({ onRetry, isLoading = false, className = "" }: RetryButtonProps) {
    return (
        <button
            onClick={onRetry}
            disabled={isLoading}
            className={`px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${className}`}
        >
            {isLoading ? (
                <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Загрузка...</span>
                </>
            ) : (
                <>
                    <RefreshCw size={18} />
                    <span>Попробовать снова</span>
                </>
            )}
        </button>
    );
}
