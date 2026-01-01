import { useState, useMemo } from "react";
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
}

const dropAnimation: DropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
        styles: {
            active: {
                opacity: '1',
            },
        },
    }),
};

export default function KanbanBoard({ tasks, onTaskUpdate, onTaskDelete, onTaskClick }: KanbanBoardProps) {
    const [activeId, setActiveId] = useState<string | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5, // Prevent accidental drags
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragOver = (_: DragOverEvent) => {
        // We only rely on handleDragEnd for the simple status change
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (!over) {
            setActiveId(null);
            return;
        }

        const taskId = active.id as string;
        const overId = over.id as string;

        // Determine the new status based on where it was dropped
        let newStatus = overId;

        // 1. If dropped directly on a Column
        // 2. If dropped on task, get its status
        const droppedOnTask = tasks.find(t => t.id === overId);
        if (droppedOnTask) {
            newStatus = droppedOnTask.status;
        }

        // Fix for mapped statuses
        const s = newStatus.toLowerCase();

        if (['review'].includes(s)) {
            newStatus = 'In_Progress';
        } else if (s === 'todo') {
            newStatus = 'Todo';
        } else if (s === 'done') {
            newStatus = 'Done';
        } else if (s === 'blocked') {
            newStatus = 'Blocked';
        } else if (s === 'in_progress') {
            newStatus = 'In_Progress';
        }

        if (active.id !== over.id) {
            onTaskUpdate(taskId, newStatus);
        }
        setActiveId(null);
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
                    <div className="cursor-grabbing w-[300px] shadow-2xl">
                        <KanbanCard task={activeTask} overlay={true} />
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
}
