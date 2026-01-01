import { useEffect, useState } from "react";
import { type Task, getTasksByProject } from "../api/tasks";
import { useProject } from "../context/ProjectContext";
import { useTasks } from "../context/TaskContext";
import KanbanBoard from "../components/kanban/KanbanBoard";
import EmptyState from "../components/EmptyState";
import { CheckSquare } from "lucide-react";
import useSound from "../hooks/useSound";

export default function TasksPage() {
    const { activeProjectId } = useProject();
    const { openCreateModal, openDetailsModal, handleUpdateTask, handleDeleteTask, refreshTrigger } = useTasks();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadTasks = async () => {
        if (activeProjectId) {
            setIsLoading(true);
            try {
                const data = await getTasksByProject(activeProjectId);
                setTasks(data);
            } finally {
                setIsLoading(false);
            }
        }
    };

    useEffect(() => {
        loadTasks();
    }, [activeProjectId, refreshTrigger]);

    // Keyboard shortcut 'c' to open modal
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key.toLowerCase() === 'c' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
                e.preventDefault();
                openCreateModal();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [openCreateModal]);

    if (!activeProjectId) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center h-[50vh]">
                <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center mb-4 border border-zinc-800">
                    <span className="text-2xl">📂</span>
                </div>
                <h3 className="text-lg font-medium text-white mb-2">No Project Selected</h3>
                <p className="text-zinc-500 max-w-sm">Select a project from the sidebar to view and manage your tasks.</p>
            </div>
        );
    }

    // Use a premium "glass" sounding chime
    const playSuccess = useSound("https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3", 0.6);

    const onTaskUpdateOptimistic = async (id: string, status: string) => {
        // Play sound if completing task
        if (status.toLowerCase() === 'done') {
            playSuccess();
        }

        // Optimistic update
        setTasks(prev => prev.map(t => t.id === id ? { ...t, status } : t));

        try {
            await handleUpdateTask(id, { status });
        } catch (error) {
            // Revert on error
            if (activeProjectId) {
                const data = await getTasksByProject(activeProjectId);
                setTasks(data);
            }
        }
    };

    return (
        <div className="h-full flex flex-col p-8 overflow-hidden">
            <header className="flex items-center justify-between mb-8 shrink-0">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">Tasks</h1>
                    <p className="text-zinc-500 text-sm mt-1">Manage your project deliverables</p>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => openCreateModal()}
                        className="btn-add-task"
                    >
                        <span>Add Task</span>
                        <span className="shortcut-key">C</span>
                    </button>
                </div>
            </header>

            <div className="flex-1 overflow-hidden min-h-0 bg-transparent rounded-3xl">
                {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
                    </div>
                ) : tasks.length === 0 ? (
                    <EmptyState
                        icon={CheckSquare}
                        title="No tasks yet"
                        description="Get started by creating your first task for this project."
                        action={{
                            label: "Create Task",
                            onClick: () => openCreateModal()
                        }}
                        className="h-full bg-black/10 backdrop-blur-sm border-white/5"
                    />
                ) : (
                    <KanbanBoard
                        tasks={tasks}
                        onTaskUpdate={onTaskUpdateOptimistic}
                        onTaskDelete={handleDeleteTask}
                        onTaskClick={openDetailsModal}
                    />
                )}
            </div>
        </div>
    );
}
