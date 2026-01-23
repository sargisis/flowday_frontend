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
    duration: 150,
    easing: 'ease-out', // Simple easing for smooth drop
    sideEffects: defaultDropAnimationSideEffects({
        styles: {
            active: {
                opacity: '0.3',
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
    const [overColumnId, setOverColumnId] = useState<string | null>(null);

    // Sync local state when props change (e.g. from backend refresh)
    useEffect(() => {
        setTasks(initialTasks);
    }, [initialTasks]);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5, // Distance in pixels before drag starts
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragStart = useCallback((event: DragStartEvent) => {
        const draggedId = event.active.id as string;
        setActiveId(draggedId);

        // If in selection mode and this task is selected, we'll handle multi-drag
        if (isSelectionMode && selectedTaskIds?.has(draggedId)) {
            // Multi-select drag - we'll handle all selected tasks
            // For now, just drag the active one, but we can enhance this
        }

        // Add haptic feedback if available
        if ('vibrate' in navigator) {
            navigator.vibrate(50);
        }
    }, [isSelectionMode, selectedTaskIds]);

    // Track which column we're hovering over for visual feedback
    // Use requestAnimationFrame to batch updates and prevent jank
    const handleDragOver = useCallback((event: DragOverEvent) => {
        requestAnimationFrame(() => {
            const { over } = event;
            if (!over) {
                setOverColumnId(null);
                return;
            }

            const overData = over.data.current;
            const overId = over.id as string;

            // Determine column ID
            let columnId: string | null = null;

            if (overData?.type === 'Column' || overData?.columnId) {
                columnId = overData.columnId || overId;
            } else {
                // Check if overId is a column ID
                const columnIds = ['Todo', 'In_Progress', 'Blocked', 'Done'];
                if (columnIds.includes(overId)) {
                    columnId = overId;
                } else {
                    // Check if dropped on a task - find its column
                    const overTask = tasks.find(t => t.id === overId);
                    if (overTask) {
                        columnId = overTask.status;
                    }
                }
            }

            setOverColumnId(columnId);
        });
    }, [tasks]);

    const handleDragEnd = useCallback((event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);
        setOverColumnId(null);

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

        // Multi-select drag: if in selection mode and multiple tasks selected, update all
        if (isSelectionMode && selectedTaskIds && selectedTaskIds.size > 1 && selectedTaskIds.has(activeId)) {
            // Update all selected tasks
            const tasksToUpdate = Array.from(selectedTaskIds);
            tasksToUpdate.forEach(taskId => {
                const task = tasks.find(t => t.id === taskId);
                if (task && task.status !== normalizedStatus) {
                    onTaskUpdate(taskId, normalizedStatus);
                }
            });
        } else {
            // Single task drag
            onTaskUpdate(activeId, normalizedStatus);
        }

        // Re-sync local state to be safe (in case backend fails or returns slightly diff data)
        // Actually, preventing flicker: we leave local state as is, and let the useEffect above sync it when next props come in.
    }, [tasks, onTaskUpdate, isSelectionMode, selectedTaskIds]);

    // Filter tasks for columns (Case-insensitive)
    const todoTasks = useMemo(() => tasks.filter(t => t.status.toLowerCase() === "todo"), [tasks]);

    const inProgressTasks = useMemo(() => tasks.filter(t => {
        const s = t.status.toLowerCase();
        return ["in_progress", "review"].includes(s);
    }), [tasks]);

    const blockedTasks = useMemo(() => tasks.filter(t => t.status.toLowerCase() === "blocked"), [tasks]);

    const doneTasks = useMemo(() => tasks.filter(t => t.status.toLowerCase() === "done"), [tasks]);

    const activeTask = useMemo(() => tasks.find(t => t.id === activeId), [tasks, activeId]);

    // ✅ MOBILE: Active column state
    const [activeMobileColumn, setActiveMobileColumn] = useState<'Todo' | 'In_Progress' | 'Blocked' | 'Done'>('Todo');

    // Column definitions for mapping
    const columns = [
        { id: 'Todo', title: 'To Do', tasks: todoTasks, color: 'blue' },
        { id: 'In_Progress', title: 'In Progress', tasks: inProgressTasks, color: 'amber' },
        { id: 'Blocked', title: 'Blocked', tasks: blockedTasks, color: 'rose' },
        { id: 'Done', title: 'Done', tasks: doneTasks, color: 'emerald' }
    ] as const;

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
                    y: 0.15, // Start scrolling within top/bottom 15% area
                },
                acceleration: 20, // Lower acceleration for smoother scrolling
                interval: 16,     // Match 60fps (16ms per frame)
            }}
            measuring={{
                droppable: {
                    strategy: 0, // Use default strategy for better accuracy
                },
            }}
        >
            <div className="h-full w-full overflow-hidden p-2 flex flex-col">
                {/* ✅ MOBILE: Tab Bar */}
                <div className="md:hidden flex items-center justify-between bg-zinc-100 dark:bg-zinc-800/50 p-1 rounded-lg mb-4 shrink-0 overflow-x-auto no-scrollbar">
                    {columns.map((col) => (
                        <button
                            key={col.id}
                            onClick={() => setActiveMobileColumn(col.id)}
                            className={`flex-1 py-2 px-3 text-xs font-bold uppercase tracking-wider rounded-md transition-all whitespace-nowrap ${activeMobileColumn === col.id
                                    ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm'
                                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
                                }`}
                        >
                            {col.title}
                            <span className="ml-1.5 opacity-60 text-[10px]">{col.tasks.length}</span>
                        </button>
                    ))}
                </div>

                {/* Responsive Grid: Single column on mobile, 2x2 grid on desktop */}
                <div
                    className="flex-1 md:grid md:grid-cols-2 gap-3 sm:gap-6 w-full h-full mx-auto pb-4 min-h-0"
                    style={window.innerWidth >= 768 ? { gridTemplateRows: '1fr 1fr' } : {}}
                >
                    {columns.map((col) => (
                        <div
                            key={col.id}
                            className={`min-h-0 h-full flex-col ${
                                // Mobile: Show only active column
                                // Desktop: Show all columns
                                activeMobileColumn === col.id ? 'flex' : 'hidden md:flex'
                                } min-w-0`}
                        >
                            <KanbanColumn
                                id={col.id}
                                title={col.title}
                                tasks={col.tasks}
                                onDelete={onTaskDelete}
                                onTaskClick={onTaskClick}
                                isSelectionMode={isSelectionMode}
                                selectedTaskIds={selectedTaskIds}
                                onToggleTaskSelection={onToggleTaskSelection}
                                keyboardSelectedTaskId={keyboardSelectedTaskId}
                                isDragOver={overColumnId === col.id && activeId !== null}
                            />
                        </div>
                    ))}
                </div>
            </div>

            <DragOverlay
                dropAnimation={dropAnimation}
                style={{ cursor: 'grabbing' }}
            >
                {activeId && activeTask ? (
                    <div className="w-[300px] shadow-2xl relative z-50" style={{ willChange: 'transform' }}>
                        <KanbanCard task={activeTask} overlay={true} />
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
}

// Memoize KanbanBoard to prevent unnecessary re-renders
export default memo(KanbanBoard);
