import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import type { Task } from "../../api/tasks";
import KanbanCard from "./KanbanCard";
import { useMemo, memo } from "react";

interface KanbanColumnProps {
    id: string;
    title: string;
    tasks: Task[];
    onDelete?: (taskId: string) => void;
    onTaskClick?: (task: Task) => void;
    isSelectionMode?: boolean;
    selectedTaskIds?: Set<string>;
    onToggleTaskSelection?: (taskId: string) => void;
    keyboardSelectedTaskId?: string | null;
    isDragOver?: boolean; // Visual feedback when dragging over this column
}

function KanbanColumn({ id, title, tasks, onDelete, onTaskClick, isSelectionMode, selectedTaskIds, onToggleTaskSelection, keyboardSelectedTaskId, isDragOver }: KanbanColumnProps) {
    // Use useDroppable to make the column a drop zone for tasks
    const { setNodeRef, isOver } = useDroppable({
        id,
        data: {
            type: "Column",
            columnId: id,
            tasks,
        },
    });

    const taskIds = useMemo(() => tasks.map((task) => task.id), [tasks]);

    return (
        <div
            ref={setNodeRef}
            className={`flex flex-col bg-zinc-900/40 border-2 rounded-2xl p-4 h-full min-h-0 ${
                isDragOver 
                    ? "border-indigo-500 bg-indigo-500/15 shadow-xl shadow-indigo-500/30 transition-colors duration-150" 
                    : isOver 
                        ? "border-indigo-500/60 bg-indigo-500/8 shadow-md shadow-indigo-500/10 transition-colors duration-150" 
                        : "border-white/5"
            }`}
        >
            {/* Column Header */}
            <div className="flex items-center justify-between mb-4 shrink-0">
                <div>
                    <h3 className={`text-sm font-bold uppercase tracking-wider transition-colors ${
                        isDragOver 
                            ? "text-indigo-300" 
                            : isOver 
                                ? "text-indigo-400" 
                                : "text-zinc-400"
                    }`}>
                        {title}
                        {isDragOver && (
                            <span className="ml-2 text-xs text-indigo-400 animate-pulse">← Drop here</span>
                        )}
                    </h3>
                    <span className="text-xs text-zinc-600">{tasks.length} tasks</span>
                </div>
            </div>

            {/* Task List - With Internal Scroll - Fixed height with scroll */}
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 -mr-2 space-y-3 min-h-0 max-h-full">
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
                            isKeyboardSelected={keyboardSelectedTaskId === task.id}
                        />
                    ))}
                </SortableContext>
                {/* Empty state - outside SortableContext so it doesn't interfere with drops */}
                {tasks.length === 0 && (
                    <div className={`h-24 rounded-xl border-2 border-dashed flex items-center justify-center text-sm italic pointer-events-none transition-all ${
                        isDragOver
                            ? "border-indigo-500/50 bg-indigo-500/5 text-indigo-400"
                            : "border-zinc-800/50 text-zinc-700"
                    }`}>
                        {isDragOver ? "Release to drop" : "Drop tasks here"}
                    </div>
                )}
            </div>
        </div>
    );
}

// Memoize KanbanColumn to prevent unnecessary re-renders
export default memo(KanbanColumn, (prevProps, nextProps) => {
    // Custom comparison for better performance
    if (prevProps.id !== nextProps.id) return false;
    if (prevProps.title !== nextProps.title) return false;
    if (prevProps.tasks.length !== nextProps.tasks.length) return false;
    if (prevProps.isSelectionMode !== nextProps.isSelectionMode) return false;
    
    // Check if tasks array changed
    if (prevProps.tasks.length !== nextProps.tasks.length) return false;
    for (let i = 0; i < prevProps.tasks.length; i++) {
        if (prevProps.tasks[i].id !== nextProps.tasks[i].id) return false;
    }
    
    // Check selectedTaskIds Set
    if (prevProps.selectedTaskIds?.size !== nextProps.selectedTaskIds?.size) return false;
    if (prevProps.selectedTaskIds && nextProps.selectedTaskIds) {
        for (const id of prevProps.selectedTaskIds) {
            if (!nextProps.selectedTaskIds.has(id)) return false;
        }
    }
    
    // Check keyboardSelectedTaskId
    if (prevProps.keyboardSelectedTaskId !== nextProps.keyboardSelectedTaskId) return false;
    
    // Check isDragOver
    if (prevProps.isDragOver !== nextProps.isDragOver) return false;
    
    return true;
});
