import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Task } from "../../api/tasks";
import { GripVertical, Trash2 } from "lucide-react";
import { memo, useState } from "react";
import { deleteTask } from "../../api/tasks";

interface KanbanCardProps {
    task: Task;
    overlay?: boolean;
    onDelete?: (taskId: string) => void;
    onClick?: (task: Task) => void;
}

function KanbanCard({ task, overlay, onDelete, onClick }: KanbanCardProps) {
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
        disabled: overlay,
    });

    const style = {
        transform: overlay ? undefined : CSS.Transform.toString(transform),
        transition: overlay ? undefined : transition,
    };

    const handleDelete = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm(`Delete task "${task.title}"?`)) return;

        setIsDeleting(true);
        try {
            await deleteTask(task.id);
            onDelete?.(task.id);
        } catch (error) {
            console.error("Failed to delete task:", error);
            alert("Failed to delete task");
        } finally {
            setIsDeleting(false);
        }
    };

    if (overlay) {
        return (
            <div
                className={`
            p-4 rounded-xl 
            bg-zinc-800 
            border border-zinc-700
            shadow-2xl cursor-grabbing
            w-full
          `}
            >
                <div className="flex justify-between items-start mb-2">
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
                className="opacity-30 bg-zinc-800 p-4 rounded-xl border border-white/10 h-[100px]"
            />
        );
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            onClick={() => onClick?.(task)}
            className={`
        group relative p-4 rounded-xl 
        bg-zinc-900/40 backdrop-blur-md 
        border border-white/5 hover:border-white/10 active:border-indigo-500/50
        transition-all duration-200
        hover:shadow-lg hover:shadow-black/20
        cursor-grab active:cursor-grabbing
        ${isDeleting ? 'opacity-50 pointer-events-none' : ''}
      `}
        >
            <div className="flex justify-between items-start mb-2">
                <span className={`
            px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider
            ${task.priority === 'high' ? 'bg-rose-500/10 text-rose-400' :
                        task.priority === 'medium' ? 'bg-amber-500/10 text-amber-400' :
                            'bg-emerald-500/10 text-emerald-400'}
        `}>
                    {task.priority}
                </span>
                <div className="flex items-center gap-1">
                    <button
                        onClick={handleDelete}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-500/10 text-zinc-600 hover:text-red-400 transition-all z-10"
                        title="Delete task"
                    >
                        <Trash2 size={14} />
                    </button>
                    <div className="text-zinc-600">
                        <GripVertical size={14} />
                    </div>
                </div>
            </div>

            <h4 className="text-sm font-medium text-zinc-200 leading-snug mb-1">
                {task.title}
            </h4>

            {task.description && (
                <p className="text-xs text-zinc-500 line-clamp-2">
                    {task.description}
                </p>
            )}
        </div>
    );
}

export default memo(KanbanCard);
