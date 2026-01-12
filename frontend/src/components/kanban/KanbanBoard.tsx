import { useState, useMemo, useEffect } from "react";
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
import { sortableKeyboardCoordinates} from "@dnd-kit/sortable";
import type { Task } from "../../api/tasks";
import KanbanColumn from "./KanbanColumn";
import KanbanCard from "./KanbanCard";

interface KanbanBoardProps {
    tasks: Task[];
    onTaskUpdate: (taskId: string, newStatus: string) => void;
    onTaskDelete?: (taskId: string) => void;
    onTaskClick?: (task: Task) => void;
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

export default function KanbanBoard({ tasks: initialTasks, onTaskUpdate, onTaskDelete, onTaskClick }: KanbanBoardProps) {
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

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    // We only rely on handleDragEnd for the status change to avoid state loops
    const handleDragOver = (_: DragOverEvent) => {
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);

        if (!over) return;

        const activeId = active.id as string;
        const overId = over.id as string;

        // Find the final column ID
        let finalStatus = overId;
        // Check if dropped on a task
        const overTask = tasks.find(t => t.id === overId);
        if (overTask) {
            finalStatus = overTask.status;
        }

        // Normalize
        const s = finalStatus.toLowerCase();
        let normalizedStatus = finalStatus;

        if (['review'].includes(s)) {
            normalizedStatus = 'In_Progress';
        } else if (s === 'todo') {
            normalizedStatus = 'Todo';
        } else if (s === 'done') {
            normalizedStatus = 'Done';
        } else if (s === 'blocked') {
            normalizedStatus = 'Blocked';
        } else if (s === 'in_progress') {
            normalizedStatus = 'In_Progress';
        }

        // Commit the change to backend
        // We find the original task from 'initialTasks' to see if it actually changed
        // Or we just trust the drag result.
        // It helps to always call update if we dropped in a valid zone, to ensure persistence.
        onTaskUpdate(activeId, normalizedStatus);

        // Re-sync local state to be safe (in case backend fails or returns slightly diff data)
        // Actually, preventing flicker: we leave local state as is, and let the useEffect above sync it when next props come in.
    };

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
                {/* 2x2 Grid Layout */}
                <div className="grid grid-cols-2 grid-rows-2 gap-6 w-full h-full mx-auto pb-4">
                    {/* Row 1 */}
                    <div className="min-h-0">
                        <KanbanColumn id="Todo" title="To Do" tasks={todoTasks} onDelete={onTaskDelete} onTaskClick={onTaskClick} />
                    </div>
                    <div className="min-h-0">
                        <KanbanColumn id="In_Progress" title="In Progress" tasks={inProgressTasks} onDelete={onTaskDelete} onTaskClick={onTaskClick} />
                    </div>

                    {/* Row 2 */}
                    <div className="min-h-0">
                        <KanbanColumn id="Blocked" title="Blocked" tasks={blockedTasks} onDelete={onTaskDelete} onTaskClick={onTaskClick} />
                    </div>
                    <div className="min-h-0">
                        <KanbanColumn id="Done" title="Done" tasks={doneTasks} onDelete={onTaskDelete} onTaskClick={onTaskClick} />
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
