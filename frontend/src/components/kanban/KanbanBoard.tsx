import { useState, useMemo, useEffect, memo, useCallback } from "react";
import {
    DndContext,
    DragOverlay,
    closestCorners,
    KeyboardSensor,
    MouseSensor,
    TouchSensor,
    useSensor,
    useSensors,
    type DragStartEvent,
    type DragOverEvent,
    type DragEndEvent,
    defaultDropAnimationSideEffects,
    type DropAnimation,
} from "@dnd-kit/core";
import { restrictToWindowEdges } from "@dnd-kit/modifiers";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import type { Task } from "../../api/tasks";
import KanbanColumn from "./KanbanColumn";
import KanbanCard from "./KanbanCard";
import { toast } from "sonner";

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
    duration: 250, // Slightly longer for a more natural feel
    easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)', // Soft bounce easing
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
    const [overColumnId, setOverColumnId] = useState<string | null>(null);

    // Sync local state when props change (e.g. from backend refresh)
    useEffect(() => {
        setTasks(initialTasks);
    }, [initialTasks]);

    const sensors = useSensors(
        useSensor(MouseSensor, {
            // Lower distance for immediate response
            activationConstraint: {
                distance: 3,
            },
        }),
        useSensor(TouchSensor, {
            // Touch sensor for mobile devices
            activationConstraint: {
                delay: 250,
                tolerance: 5,
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

    // Filter tasks for columns (Case-insensitive)
    const todoTasks = useMemo(() => tasks.filter(t => t.status.toLowerCase() === "todo"), [tasks]);

    const inProgressTasks = useMemo(() => tasks.filter(t => {
        const s = t.status.toLowerCase();
        return ["in_progress", "review"].includes(s);
    }), [tasks]);

    const blockedTasks = useMemo(() => tasks.filter(t => t.status.toLowerCase() === "blocked"), [tasks]);

    const doneTasks = useMemo(() => tasks.filter(t => t.status.toLowerCase() === "done"), [tasks]);

    // Column definitions
    const columns = useMemo(() => [
        { id: 'Todo', title: 'To Do', tasks: todoTasks, color: 'blue' },
        { id: 'In_Progress', title: 'In Progress', tasks: inProgressTasks, color: 'amber' },
        { id: 'Blocked', title: 'Blocked', tasks: blockedTasks, color: 'rose' },
        { id: 'Done', title: 'Done', tasks: doneTasks, color: 'emerald' }
    ] as const, [todoTasks, inProgressTasks, blockedTasks, doneTasks]);

    const handleDragEnd = useCallback((event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);
        setOverColumnId(null);

        if (!over) return;

        const activeId = active.id as string;
        const overId = over.id as string;
        const overData = over.data.current;

        // Determine target column with simplified logic
        let targetColumnId: string | null = null;

        // Check 1: Is it a column ID?
        if (columns.some(col => col.id === overId)) {
            targetColumnId = overId;
        }
        // Check 2: Does over.data contain column info?
        else if (overData?.columnId) {
            targetColumnId = overData.columnId;
        }
        // Check 3: Dropped on a task - use that task's column
        else {
            const targetTask = tasks.find(t => t.id === overId);
            if (targetTask) {
                targetColumnId = targetTask.status;
            }
        }

        // Validate and report errors
        if (!targetColumnId) {
            console.error('Drop target could not be determined:', { overId, overData });
            toast.error('Could not move task. Please try again.');
            return;
        }

        // Validate column ID
        if (!columns.some(col => col.id === targetColumnId)) {
            console.error('Invalid column ID:', targetColumnId);
            toast.error('Invalid destination. Please try again.');
            return;
        }

        // Check if status actually changed
        const currentTask = tasks.find(t => t.id === activeId);
        if (!currentTask) {
            console.error('Task not found:', activeId);
            return;
        }

        if (currentTask.status === targetColumnId) {
            // Status unchanged, no need to update
            return;
        }

        // Multi-select drag
        if (isSelectionMode && selectedTaskIds && selectedTaskIds.size > 1 && selectedTaskIds.has(activeId)) {
            const tasksToUpdate = Array.from(selectedTaskIds);
            tasksToUpdate.forEach(taskId => {
                const task = tasks.find(t => t.id === taskId);
                if (task && task.status !== targetColumnId) {
                    onTaskUpdate(taskId, targetColumnId);
                }
            });
            toast.success(`Moved ${tasksToUpdate.length} tasks to ${columns.find(c => c.id === targetColumnId)?.title}`);
        } else {
            // Single task drag
            onTaskUpdate(activeId, targetColumnId);
        }
    }, [tasks, onTaskUpdate, isSelectionMode, selectedTaskIds, columns]);

    const activeTask = useMemo(() => tasks.find(t => t.id === activeId), [tasks, activeId]);

    // ✅ MOBILE: Active column state
    const [activeMobileColumn, setActiveMobileColumn] = useState<'Todo' | 'In_Progress' | 'Blocked' | 'Done'>('Todo');

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
            modifiers={[restrictToWindowEdges]}
            autoScroll={{
                threshold: {
                    x: 0,
                    y: 0.1, // Tighter threshold
                },
                acceleration: 10, // Slower, more controlled scroll
                interval: 10,     // More frequent updates for smoothness
            }}
            measuring={{
                droppable: {
                    strategy: 1, // Always measure for accuracy
                },
            }}
        >
            <div className="h-full w-full overflow-hidden p-2 flex flex-col relative" id="kanban-board-container">
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
