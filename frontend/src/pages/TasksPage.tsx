import { useEffect, useState, useMemo } from "react";
import { type Task, getTasksByProject } from "../api/tasks";
import { useProject } from "../context/ProjectContext";
import { useTasks } from "../context/TaskContext";
import KanbanBoard from "../components/kanban/KanbanBoard";
import EmptyState from "../components/state/EmptyState";
import { KanbanBoardSkeleton } from "../components/SkeletonLoader";
import { CheckSquare, LayoutList, Activity, CheckCircle2, AlertCircle, Filter } from "lucide-react";
import useSound from "../hooks/useSound";

export default function TasksPage() {
    const { activeProjectId } = useProject();
    const { openCreateModal, openDetailsModal, handleUpdateTask, handleDeleteTask, refreshTrigger } = useTasks();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [activeFilter, setActiveFilter] = useState<'all' | 'high' | 'due-soon'>('all');

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

    // Calculate stats
    const stats = useMemo(() => {
        const todo = tasks.filter(t => t.status.toLowerCase() === 'todo').length;
        const inProgress = tasks.filter(t => {
            const s = t.status.toLowerCase();
            return ['in_progress', 'review'].includes(s);
        }).length;
        const done = tasks.filter(t => t.status.toLowerCase() === 'done').length;
        const blocked = tasks.filter(t => t.status.toLowerCase() === 'blocked').length;
        const total = tasks.length;
        const completionRate = total > 0 ? Math.round((done / total) * 100) : 0;

        return { todo, inProgress, done, blocked, total, completionRate };
    }, [tasks]);

    // Filter tasks
    const filteredTasks = useMemo(() => {
        if (activeFilter === 'all') return tasks;

        if (activeFilter === 'high') {
            return tasks.filter(t => t.priority === 'high');
        }

        if (activeFilter === 'due-soon') {
            const threeDaysFromNow = new Date();
            threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
            return tasks.filter(t => {
                if (!t.due_date) return false;
                const dueDate = new Date(t.due_date);
                return dueDate <= threeDaysFromNow && t.status !== 'done';
            });
        }

        return tasks;
    }, [tasks, activeFilter]);

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
        <div className="h-full flex flex-col p-4 lg:p-6 overflow-hidden animate-in fade-in duration-700">
            {/* Compact Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                        <LayoutList size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight">Tasks</h1>
                        <p className="text-xs text-zinc-500 mt-0.5">{stats.total} tasks • {stats.completionRate}% complete</p>
                    </div>
                </div>

                <button
                    onClick={() => openCreateModal()}
                    className="bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 text-white px-5 py-2.5 rounded-lg text-[10px] font-bold transition-all hover:-translate-y-0.5 flex items-center gap-2.5 uppercase tracking-wider group"
                >
                    <span>Create Task</span>
                    <span className="px-1.5 py-0.5 bg-indigo-500/20 rounded text-[9px] text-indigo-400 border border-indigo-500/30 group-hover:bg-indigo-500 group-hover:text-white transition-all">C</span>
                </button>
            </header>

            {/* Quick Stats Bar */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6 shrink-0">
                <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/10">
                    <div className="flex items-center gap-2 mb-1">
                        <LayoutList size={14} className="text-blue-400" />
                        <span className="text-[9px] text-zinc-500 uppercase font-bold">To Do</span>
                    </div>
                    <p className="text-2xl font-bold text-blue-400">{stats.todo}</p>
                </div>

                <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/10">
                    <div className="flex items-center gap-2 mb-1">
                        <Activity size={14} className="text-amber-400" />
                        <span className="text-[9px] text-zinc-500 uppercase font-bold">In Progress</span>
                    </div>
                    <p className="text-2xl font-bold text-amber-400">{stats.inProgress}</p>
                </div>

                <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                    <div className="flex items-center gap-2 mb-1">
                        <CheckCircle2 size={14} className="text-emerald-400" />
                        <span className="text-[9px] text-zinc-500 uppercase font-bold">Done</span>
                    </div>
                    <p className="text-2xl font-bold text-emerald-400">{stats.done}</p>
                </div>

                <div className="p-3 rounded-lg bg-rose-500/5 border border-rose-500/10">
                    <div className="flex items-center gap-2 mb-1">
                        <AlertCircle size={14} className="text-rose-400" />
                        <span className="text-[9px] text-zinc-500 uppercase font-bold">Blocked</span>
                    </div>
                    <p className="text-2xl font-bold text-rose-400">{stats.blocked}</p>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="flex items-center gap-2 mb-4 shrink-0">
                <div className="flex items-center gap-2 text-xs text-zinc-500">
                    <Filter size={14} />
                    <span className="font-bold uppercase tracking-wider">Filter:</span>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setActiveFilter('all')}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${activeFilter === 'all'
                            ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                            : 'bg-white/[0.03] text-zinc-500 border border-white/5 hover:border-white/10'
                            }`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setActiveFilter('high')}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${activeFilter === 'high'
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            : 'bg-white/[0.03] text-zinc-500 border border-white/5 hover:border-white/10'
                            }`}
                    >
                        High Priority
                    </button>
                    <button
                        onClick={() => setActiveFilter('due-soon')}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${activeFilter === 'due-soon'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-white/[0.03] text-zinc-500 border border-white/5 hover:border-white/10'
                            }`}
                    >
                        Due Soon
                    </button>
                </div>
                {activeFilter !== 'all' && (
                    <span className="text-xs text-zinc-600">
                        ({filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'})
                    </span>
                )}
            </div>

            <div className="flex-1 overflow-hidden min-h-0 bg-transparent rounded-xl">
                {isLoading ? (
                    <KanbanBoardSkeleton />
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
                        tasks={filteredTasks}
                        onTaskUpdate={onTaskUpdateOptimistic}
                        onTaskDelete={handleDeleteTask}
                        onTaskClick={openDetailsModal}
                    />
                )}
            </div>
        </div>
    );
}
