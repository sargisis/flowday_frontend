import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Task } from "../../api/tasks";
import { GripVertical, Trash2, Sparkles } from "lucide-react";
import { memo, useState } from "react";

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
        transition: overlay ? undefined : transition,
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

    const handleCardClick = (e: React.MouseEvent) => {
        if (isSelectionMode) {
            e.preventDefault();
            e.stopPropagation();
            onToggleSelection?.(task.id);
        } else {
            onClick?.(task);
        }
    };

    if (overlay) {
        return (
            <div
                className={`
            p-3 rounded-xl 
            bg-zinc-800 
            border border-zinc-700
            shadow-2xl cursor-grabbing
            w-full
          `}
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

    if (isDragging) {
        return (
            <div
                ref={setNodeRef}
                style={style}
                className="opacity-30 bg-zinc-800 p-3 rounded-xl border border-white/10 h-[80px]"
            />
        );
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...(!isSelectionMode ? attributes : {})}
            {...(!isSelectionMode ? listeners : {})}
            onClick={isSelectionMode ? handleCardClick : () => onClick?.(task)}
            id={`task-item-${task.id}`}
            className={`
        group relative p-3 rounded-xl 
        bg-zinc-900/40 
        border 
        transition-all duration-200
        ${isSelectionMode ? 'cursor-pointer' : 'cursor-grab active:cursor-grabbing'}
        ${isSelected
                    ? 'border-indigo-500 bg-indigo-500/10'
                    : isKeyboardSelected
                        ? 'border-indigo-400/60 bg-indigo-500/5 ring-2 ring-indigo-400/30'
                        : 'border-white/5 hover:border-white/10'}
        ${isDeleting ? 'opacity-50 pointer-events-none' : ''}
      `}
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
                            onPointerDown={(e) => e.stopPropagation()}
                            className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-zinc-500 hover:text-red-400 transition-opacity duration-200 z-50 cursor-pointer"
                            title="Delete task"
                        >
                            <Trash2 size={14} />
                        </button>
                        <div className="text-zinc-600 p-1.5">
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
        </div>
    );
}

export default memo(KanbanCard);
