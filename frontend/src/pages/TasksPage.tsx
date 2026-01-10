import { useEffect, useState } from "react";
import { type Task, getTasksByProject } from "../api/tasks";
import { useProject } from "../context/ProjectContext";
import { useTasks } from "../context/TaskContext";
import KanbanBoard from "../components/kanban/KanbanBoard";
import EmptyState from "../components/state/EmptyState";
import { CheckSquare } from "lucide-react";
import useSound from "../hooks/useSound";

export default function TasksPage() {
    const { activeProjectId } = useProject();
    const { openCreateModal, openDetailsModal, handleUpdateTask, handleDeleteTask, refreshTrigger } = useTasks();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Use a premium "glass" sounding chime
    const playSuccess = useSound("https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3", 0.6);

    // Initial load when project changes
    useEffect(() => {
        const initProject = async () => {
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
        initProject();
    }, [activeProjectId]);

    // Silent refresh when data changes (e.g. from drag and drop)
    useEffect(() => {
        const silentRefresh = async () => {
            if (activeProjectId) {
                const data = await getTasksByProject(activeProjectId);
                setTasks(data);
            }
        };

        // Skip calling this on mount/project change since the first effect handles it
        // Only run when refreshTrigger changes
        if (refreshTrigger > 0) {
            silentRefresh();
        }
    }, [refreshTrigger, activeProjectId]);

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
            <div className="h-full flex items-center justify-center p-8">
                <EmptyState
                    icon={CheckSquare}
                    title="No Project Selected"
                    description="Select a project from the sidebar to view your mission tasks and manage deliverables."
                />
            </div>
        );
    }


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
        <div className="h-full flex flex-col p-8 lg:p-14 overflow-hidden animate-in fade-in duration-1000">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-10 mb-14 shrink-0">
                <div className="space-y-5">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.8)] animate-pulse" />
                        <p className="text-[10px] font-black text-indigo-400 tracking-[0.3em] uppercase">Task Repository</p>
                    </div>
                    <h1 className="text-5xl lg:text-6xl font-black bg-gradient-to-r from-white via-white to-zinc-500 bg-clip-text text-transparent tracking-tighter font-[Outfit]">
                        Mission Control
                    </h1>
                </div>
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => openCreateModal()}
                        className="bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 text-white px-8 py-4 rounded-[2rem] text-[11px] font-black transition-all hover:-translate-y-1 shadow-2xl flex items-center gap-4 uppercase tracking-widest group"
                    >
                        <span>Create Task</span>
                        <span className="px-2 py-1 bg-indigo-500/20 rounded-lg text-[9px] text-indigo-400 border border-indigo-500/30 group-hover:bg-indigo-500 group-hover:text-white transition-all">C</span>
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
