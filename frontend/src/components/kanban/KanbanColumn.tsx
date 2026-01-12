import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Task } from "../../api/tasks";
import KanbanCard from "./KanbanCard";
import { useMemo } from "react";

interface KanbanColumnProps {
    id: string;
    title: string;
    tasks: Task[];
    onDelete?: (taskId: string) => void;
    onTaskClick?: (task: Task) => void;
    isSelectionMode?: boolean;
    selectedTaskIds?: Set<string>;
    onToggleTaskSelection?: (taskId: string) => void;
}

export default function KanbanColumn({ id, title, tasks, onDelete, onTaskClick, isSelectionMode, selectedTaskIds, onToggleTaskSelection }: KanbanColumnProps) {
    const {
        setNodeRef,
        attributes,
        listeners,
        transform,
        transition,
        isOver,
    } = useSortable({
        id,
        data: {
            type: "Column",
            tasks,
        },
    });

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
    };

    const taskIds = useMemo(() => tasks.map((task) => task.id), [tasks]);

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`flex flex-col bg-zinc-900/40 border-2 rounded-2xl p-4 h-full transition-colors duration-200 ${isOver ? "border-indigo-500/50 bg-indigo-500/5" : "border-white/5"
                }`}
        >
            {/* Column Header */}
            <div {...attributes} {...listeners} className="flex items-center justify-between mb-4 cursor-grab active:cursor-grabbing shrink-0">
                <div>
                    <h3 className={`text-sm font-bold uppercase tracking-wider transition-colors ${isOver ? "text-indigo-400" : "text-zinc-400"
                        }`}>
                        {title}
                    </h3>
                    <span className="text-xs text-zinc-600">{tasks.length} tasks</span>
                </div>
            </div>

            {/* Task List - With Internal Scroll */}
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 -mr-2 space-y-3 min-h-0">
                <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
                    {tasks.map((task) => (
                        <KanbanCard
                            key={task.id}
                            task={task}
                            onDelete={onDelete}
                            onClick={onTaskClick}
                            isSelectionMode={isSelectionMode}
                            isSelected={selectedTaskIds?.has(task.id)}
                            onToggleSelection={onToggleTaskSelection}
                        />
                    ))}
                    {tasks.length === 0 && (
                        <div className="h-24 rounded-xl border-2 border-dashed border-zinc-800/50 flex items-center justify-center text-zinc-700 text-sm italic">
                            Drop tasks here
                        </div>
                    )}
                </SortableContext>
            </div>
        </div>
    );
}
