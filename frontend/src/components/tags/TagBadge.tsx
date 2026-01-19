import { X } from 'lucide-react';
import type { Tag } from '../../types/tags';
import { getTagColorClasses } from '../../types/tags';

interface TagBadgeProps {
    tag: Tag | { name: string; color?: string };
    onRemove?: () => void;
    size?: 'sm' | 'md' | 'lg';
    showRemove?: boolean;
}

export default function TagBadge({ tag, onRemove, size = 'md', showRemove = false }: TagBadgeProps) {
    const color = 'color' in tag ? tag.color : 'blue';
    const classes = getTagColorClasses(color as any);
    
    const sizeClasses = {
        sm: 'px-1.5 py-0.5 text-[9px]',
        md: 'px-2 py-1 text-[10px]',
        lg: 'px-3 py-1.5 text-xs',
    };

    return (
        <span
            className={`
                inline-flex items-center gap-1 rounded-md font-bold uppercase tracking-wider
                ${classes.bg} ${classes.text} ${classes.border} border
                ${sizeClasses[size]}
                ${showRemove && onRemove ? 'pr-1' : ''}
            `}
        >
            {tag.name}
            {showRemove && onRemove && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onRemove();
                    }}
                    className="ml-0.5 hover:opacity-70 transition-opacity"
                >
                    <X size={10} />
                </button>
            )}
        </span>
    );
}
