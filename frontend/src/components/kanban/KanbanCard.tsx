import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Task } from "../../api/tasks";
import { GripVertical, Trash2, Sparkles } from "lucide-react";
import { memo, useState, useEffect } from "react";
import TagBadge from "../tags/TagBadge";

interface KanbanCardProps {
    task: Task;
    overlay?: boolean;
    onDelete?: (taskId: string) => void;
    onClick?: (task: Task) => void;
    isSelectionMode?: boolean;
    isSelected?: boolean;
    onToggleSelection?: (taskId: string) => void;
    isKeyboardSelected?: boolean; // For keyboard navigation highlight
}

function KanbanCard({ task, overlay, onDelete, onClick, isSelectionMode, isSelected, onToggleSelection, isKeyboardSelected }: KanbanCardProps) {
    const [isDeleting, setIsDeleting] = useState(false);

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: task.id,
        data: {
            type: "Task",
            task,
        },
        disabled: overlay || isSelectionMode, // Disable drag when in selection mode
    });

    const style = {
        transform: overlay ? undefined : CSS.Transform.toString(transform),
        transition: overlay || isDragging ? 'none' : transition, // No transition when dragging
        willChange: isDragging ? 'transform' : 'auto', // Optimize for dragging
    };

    const handleDelete = async (e: React.MouseEvent) => {
        // CRITICAL: Stop propagation so the click doesn't trigger onClick of the card
        e.stopPropagation();
        e.preventDefault();

        if (!confirm(`Delete task "${task.title}"?`)) return;

        setIsDeleting(true);
        try {
            await onDelete?.(task.id);
        } catch (error) {
            console.error("Failed to delete task:", error);
        } finally {
            setIsDeleting(false);
        }
    };

    // Track if we're in a drag operation
    const [wasDragging, setWasDragging] = useState(false);

    const handleCardClick = (e: React.MouseEvent) => {
        // Don't trigger if dragging or just finished dragging
        if (isDragging || wasDragging) {
            setWasDragging(false);
            return;
        }
        
        // Don't trigger if clicking on interactive elements (buttons)
        const target = e.target as HTMLElement;
        if (
            target.closest('button') || 
            target.closest('a')
        ) {
            return;
        }

        if (isSelectionMode) {
            e.preventDefault();
            e.stopPropagation();
            onToggleSelection?.(task.id);
        } else {
            e.preventDefault();
            e.stopPropagation();
            onClick?.(task);
        }
    };

    if (overlay) {
        return (
            <div
                className={`
            p-3.5 rounded-2xl 
            bg-gradient-to-br from-zinc-900/50 via-zinc-900/40 to-zinc-800/30
            border-2 border-indigo-500/60
            shadow-2xl
            w-full
            backdrop-blur-sm
          `}
                style={{ willChange: 'transform' }}
            >
                <div className="flex justify-between items-start mb-1.5">
                    <span className={`
                px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider
                ${task.priority === 'high' ? 'bg-rose-500/10 text-rose-400' :
                            task.priority === 'medium' ? 'bg-amber-500/10 text-amber-400' :
                                'bg-emerald-500/10 text-emerald-400'}
            `}>
                        {task.priority}
                    </span>
                    <button className="text-zinc-600">
                        <GripVertical size={14} />
                    </button>
                </div>
                <h4 className="text-sm font-medium text-zinc-100 leading-snug mb-1">
                    {task.title}
                </h4>
            </div>
        );
    }

    // Track drag state changes
    useEffect(() => {
        if (isDragging) {
            setWasDragging(true);
        } else if (wasDragging) {
            // Reset after a short delay to prevent click after drag
            const timer = setTimeout(() => setWasDragging(false), 100);
            return () => clearTimeout(timer);
        }
    }, [isDragging, wasDragging]);

    if (isDragging) {
        return (
            <div
                ref={setNodeRef}
                style={{
                    ...style,
                    opacity: 0.3,
                    transition: 'none',
                    willChange: 'transform',
                }}
                className="bg-zinc-800/40 p-3.5 rounded-xl border-2 border-dashed border-indigo-500/40 h-[90px]"
            />
        );
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...(!isSelectionMode ? attributes : {})}
            {...(!isSelectionMode ? listeners : {})}
            onClick={handleCardClick}
            id={`task-item-${task.id}`}
            className={`
        group relative p-3.5 rounded-2xl 
        bg-gradient-to-br from-zinc-900/50 via-zinc-900/40 to-zinc-800/30
        backdrop-blur-sm
        border 
        ${isSelectionMode ? 'cursor-pointer' : 'cursor-grab active:cursor-grabbing'}
        ${isSelected
                    ? 'border-indigo-500/80 bg-indigo-500/15 shadow-lg shadow-indigo-500/20 ring-2 ring-indigo-500/30'
                    : isKeyboardSelected
                        ? 'border-indigo-400/60 bg-indigo-500/8 ring-2 ring-indigo-400/25 shadow-md shadow-indigo-500/10'
                        : 'border-white/5 hover:border-white/15 hover:bg-zinc-900/60'}
        ${isDeleting ? 'opacity-50 pointer-events-none' : ''}
        ${!isDragging ? 'transition-colors duration-150 hover:shadow-xl hover:shadow-black/20' : 'transition-none'}
      `}
        >
            <div className="flex justify-between items-start mb-1.5">
                <span className={`
            px-2.5 py-1 rounded-lg text-[10px] font-semibold uppercase tracking-wider
            backdrop-blur-sm
            ${task.priority === 'high' ? 'bg-gradient-to-r from-rose-500/20 to-rose-600/10 text-rose-300 border border-rose-500/30' :
                        task.priority === 'medium' ? 'bg-gradient-to-r from-amber-500/20 to-amber-600/10 text-amber-300 border border-amber-500/30' :
                            'bg-gradient-to-r from-emerald-500/20 to-emerald-600/10 text-emerald-300 border border-emerald-500/30'}
        `}>
                    {task.priority}
                </span>

                {isSelectionMode ? (
                    <div className={`
                        w-5 h-5 rounded border flex items-center justify-center transition-colors
                        ${isSelected
                            ? 'bg-indigo-500 border-indigo-500 text-white'
                            : 'border-zinc-600 group-hover:border-zinc-500'}
                    `}>
                        {isSelected && <Sparkles size={12} fill="currentColor" />}
                    </div>
                ) : (
                    <div className="flex items-center gap-1">
                        <button
                            onClick={handleDelete}
                            onMouseDown={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                            }}
                            onPointerDown={(e) => {
                                e.stopPropagation();
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-zinc-500 hover:text-red-400 transition-opacity duration-200 z-50 cursor-pointer"
                            title="Delete task"
                        >
                            <Trash2 size={14} />
                        </button>
                        <div 
                            className="text-zinc-600 p-1.5 hover:text-zinc-400 hover:bg-zinc-800/50 rounded transition-all"
                            onMouseDown={(e) => {
                                // Prevent card click when clicking grip
                                e.stopPropagation();
                            }}
                            onPointerDown={(e) => {
                                // Prevent card click when clicking grip
                                e.stopPropagation();
                            }}
                        >
                            <GripVertical size={14} />
                        </div>
                    </div>
                )}
            </div>

            <div className="flex items-center gap-2 mb-1">
                <h4 className="text-sm font-medium text-zinc-200 leading-snug select-none">
                    {task.title}
                </h4>
                {task.description && !isSelectionMode && (
                    <div className="p-1 bg-indigo-500/10 rounded-md" title="AI Plan available">
                        <Sparkles size={10} className="text-indigo-400" />
                    </div>
                )}
            </div>

            {task.description && !isSelectionMode && (
                <p className="text-xs text-zinc-500 line-clamp-2 select-none">
                    {task.description}
                </p>
            )}

            {task.tags && task.tags.length > 0 && !isSelectionMode && (
                <div className="flex flex-wrap gap-1 mt-2">
                    {task.tags.slice(0, 3).map(tag => (
                        <TagBadge
                            key={tag.id}
                            tag={{ name: tag.name, color: tag.color || 'blue' }}
                            size="sm"
                        />
                    ))}
                    {task.tags.length > 3 && (
                        <span className="text-[9px] text-zinc-500 px-1.5 py-0.5">
                            +{task.tags.length - 3}
                        </span>
                    )}
                </div>
            )}
        </div>
    );
}

export default memo(KanbanCard);
