import { useState, useMemo, useEffect, memo, useCallback } from "react";
import {
    DndContext,
    DragOverlay,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    type DragStartEvent,
    type DragOverEvent,
    type DragEndEvent,
    defaultDropAnimationSideEffects,
    type DropAnimation,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import type { Task } from "../../api/tasks";
import KanbanColumn from "./KanbanColumn";
import KanbanCard from "./KanbanCard";

interface KanbanBoardProps {
    tasks: Task[];
    onTaskUpdate: (taskId: string, newStatus: string) => void;
    onTaskDelete?: (taskId: string) => void;
    onTaskClick?: (task: Task) => void;
    isSelectionMode?: boolean;
    selectedTaskIds?: Set<string>;
    onToggleTaskSelection?: (taskId: string) => void;
    keyboardSelectedTaskId?: string | null; // For keyboard navigation highlight
}

const dropAnimation: DropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
        styles: {
            active: {
                opacity: '0.5',
            },
        },
    }),
};

function KanbanBoard({
    tasks: initialTasks,
    onTaskUpdate,
    onTaskDelete,
    onTaskClick,
    isSelectionMode,
    selectedTaskIds,
    onToggleTaskSelection,
    keyboardSelectedTaskId
}: KanbanBoardProps) {
    // Local state for optimistic updates (smooth dragging)
    const [tasks, setTasks] = useState<Task[]>(initialTasks);
    const [activeId, setActiveId] = useState<string | null>(null);

    // Sync local state when props change (e.g. from backend refresh)
    useEffect(() => {
        setTasks(initialTasks);
    }, [initialTasks]);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragStart = useCallback((event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    }, []);

    // We only rely on handleDragEnd for the status change to avoid state loops
    const handleDragOver = useCallback((_: DragOverEvent) => {
    }, []);

    const handleDragEnd = useCallback((event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);

        if (!over) return;

        const activeId = active.id as string;
        const overId = over.id as string;
        const overData = over.data.current;

        // Debug logging
        console.log('Drag end:', { activeId, overId, overData });

        // Find the final column ID
        let finalStatus: string | null = null;
        
        // Strategy 1: Check if overId is a column ID directly
        const columnIds = ['Todo', 'In_Progress', 'Blocked', 'Done'];
        if (columnIds.includes(overId)) {
            finalStatus = overId;
            console.log('✅ Dropped directly on column:', finalStatus);
        }
        // Strategy 2: Check if over.data indicates a Column
        else if (overData?.type === 'Column' || overData?.columnId) {
            finalStatus = overData.columnId || overId;
            console.log('✅ Dropped on column (from data):', finalStatus);
        }
        // Strategy 3: Dropped on a task - find which column that task belongs to
        else {
            const overTask = tasks.find(t => t.id === overId);
            if (overTask) {
                // Use the task's current status as the target column
                finalStatus = overTask.status;
                console.log('✅ Dropped on task, using task status:', finalStatus);
            } else {
                // Strategy 4: Last resort - check if overId looks like a column ID (case-insensitive)
                const overIdLower = overId.toLowerCase();
                const columnMap: Record<string, string> = {
                    'todo': 'Todo',
                    'in_progress': 'In_Progress',
                    'in progress': 'In_Progress',
                    'blocked': 'Blocked',
                    'done': 'Done'
                };
                
                if (columnMap[overIdLower]) {
                    finalStatus = columnMap[overIdLower];
                    console.log('✅ Dropped on column (mapped from overId):', finalStatus);
                } else {
                    console.warn('❌ Unknown drop target:', { overId, overData });
                    // Don't update if we can't determine the column
                    return;
                }
            }
        }

        if (!finalStatus) {
            console.warn('❌ Could not determine target column');
            return;
        }

        // Normalize status - handle both column IDs (In_Progress) and task statuses (in_progress)
        const s = finalStatus.toLowerCase();
        let normalizedStatus: string;

        // Map all possible status formats to normalized format
        if (finalStatus === 'In_Progress' || s === 'in_progress' || s === 'in progress' || s === 'review') {
            normalizedStatus = 'In_Progress';
        } else if (finalStatus === 'Todo' || s === 'todo') {
            normalizedStatus = 'Todo';
        } else if (finalStatus === 'Done' || s === 'done') {
            normalizedStatus = 'Done';
        } else if (finalStatus === 'Blocked' || s === 'blocked') {
            normalizedStatus = 'Blocked';
        } else {
            // Fallback: use original status (shouldn't happen, but just in case)
            console.warn('⚠️ Unknown status format:', finalStatus);
            normalizedStatus = finalStatus;
        }

        console.log('📤 Updating task:', { taskId: activeId, from: tasks.find(t => t.id === activeId)?.status, to: normalizedStatus });

        // Only update if status actually changed
        const currentTask = tasks.find(t => t.id === activeId);
        if (currentTask && currentTask.status === normalizedStatus) {
            console.log('ℹ️ Status unchanged, skipping update');
            return;
        }

        // Commit the change to backend
        onTaskUpdate(activeId, normalizedStatus);

        // Re-sync local state to be safe (in case backend fails or returns slightly diff data)
        // Actually, preventing flicker: we leave local state as is, and let the useEffect above sync it when next props come in.
    }, [tasks, onTaskUpdate]);

    // Filter tasks for columns (Case-insensitive)
    const todoTasks = useMemo(() => tasks.filter(t => t.status.toLowerCase() === "todo"), [tasks]);

    const inProgressTasks = useMemo(() => tasks.filter(t => {
        const s = t.status.toLowerCase();
        return ["in_progress", "review"].includes(s);
    }), [tasks]);

    const blockedTasks = useMemo(() => tasks.filter(t => t.status.toLowerCase() === "blocked"), [tasks]);

    const doneTasks = useMemo(() => tasks.filter(t => t.status.toLowerCase() === "done"), [tasks]);

    const activeTask = useMemo(() => tasks.find(t => t.id === activeId), [tasks, activeId]);

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
            autoScroll={{
                threshold: {
                    x: 0,
                    y: 0.25, // Start scrolling within top/bottom 25% area
                },
                acceleration: 60, // Much stronger acceleration (was 20)
                interval: 4,      // Slightly faster updates (was 5)
            }}
            measuring={{
                droppable: {
                    strategy: 0,
                },
            }}
        >
            <div className="h-full w-full overflow-hidden p-2">
                {/* 2x2 Grid Layout - Fixed height with equal rows */}
                <div 
                    className="grid grid-cols-2 gap-6 w-full h-full mx-auto pb-4 min-h-0"
                    style={{ gridTemplateRows: '1fr 1fr' }}
                >
                    {/* Row 1 */}
                    <div className="min-h-0 h-full flex flex-col">
                        <KanbanColumn
                            id="Todo"
                            title="To Do"
                            tasks={todoTasks}
                            onDelete={onTaskDelete}
                            onTaskClick={onTaskClick}
                            isSelectionMode={isSelectionMode}
                            selectedTaskIds={selectedTaskIds}
                            onToggleTaskSelection={onToggleTaskSelection}
                            keyboardSelectedTaskId={keyboardSelectedTaskId}
                        />
                    </div>
                    <div className="min-h-0 h-full flex flex-col">
                        <KanbanColumn
                            id="In_Progress"
                            title="In Progress"
                            tasks={inProgressTasks}
                            onDelete={onTaskDelete}
                            onTaskClick={onTaskClick}
                            isSelectionMode={isSelectionMode}
                            selectedTaskIds={selectedTaskIds}
                            onToggleTaskSelection={onToggleTaskSelection}
                            keyboardSelectedTaskId={keyboardSelectedTaskId}
                        />
                    </div>

                    {/* Row 2 */}
                    <div className="min-h-0 h-full flex flex-col">
                        <KanbanColumn
                            id="Blocked"
                            title="Blocked"
                            tasks={blockedTasks}
                            onDelete={onTaskDelete}
                            onTaskClick={onTaskClick}
                            isSelectionMode={isSelectionMode}
                            selectedTaskIds={selectedTaskIds}
                            onToggleTaskSelection={onToggleTaskSelection}
                            keyboardSelectedTaskId={keyboardSelectedTaskId}
                        />
                    </div>
                    <div className="min-h-0 h-full flex flex-col">
                        <KanbanColumn
                            id="Done"
                            title="Done"
                            tasks={doneTasks}
                            onDelete={onTaskDelete}
                            onTaskClick={onTaskClick}
                            isSelectionMode={isSelectionMode}
                            selectedTaskIds={selectedTaskIds}
                            onToggleTaskSelection={onToggleTaskSelection}
                            keyboardSelectedTaskId={keyboardSelectedTaskId}
                        />
                    </div>
                </div>
            </div>

            <DragOverlay dropAnimation={dropAnimation}>
                {activeId && activeTask ? (
                    <div className="cursor-grabbing w-[300px] shadow-2xl relative z-50">
                        <KanbanCard task={activeTask} overlay={true} />
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
}

// Memoize KanbanBoard to prevent unnecessary re-renders
export default memo(KanbanBoard);
