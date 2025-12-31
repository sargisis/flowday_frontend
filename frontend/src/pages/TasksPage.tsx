import { useEffect, useState } from "react";
import { type Task, getTasksByProject } from "../api/tasks";
import { useProject } from "../context/ProjectContext";
import { useTasks } from "../context/TaskContext";
import KanbanBoard from "../components/kanban/KanbanBoard";

export default function TasksPage() {
    const { activeProjectId } = useProject();
    const { openCreateModal, openDetailsModal, handleUpdateTask, handleDeleteTask, refreshTrigger } = useTasks();
    const [tasks, setTasks] = useState<Task[]>([]);

    const loadTasks = () => {
        if (activeProjectId) {
            getTasksByProject(activeProjectId).then(setTasks);
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

            <div className="flex-1 overflow-hidden min-h-0">
                <KanbanBoard
                    tasks={tasks}
                    onTaskUpdate={(id, status) => handleUpdateTask(id, { status })}
                    onTaskDelete={handleDeleteTask}
                    onTaskClick={openDetailsModal}
                />
            </div>
        </div>
    );
}
