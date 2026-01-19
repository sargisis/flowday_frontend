interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    className?: string;
    text?: string;
}

const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
};

export function LoadingSpinner({ size = 'md', className = '', text }: LoadingSpinnerProps) {
    return (
        <div className={`flex flex-col items-center justify-center gap-2 ${text ? 'gap-2' : ''}' : ''} ${className}`}>
            <div
                className={`${sizeClasses[size]} border-2 border-zinc-800/50 border-t-indigo-500 rounded-full animate-spin`}
            />
            {text && (
                <span className="text-sm text-zinc-400">{text}</span>
            )}
        </div>
    );
}
