import { useEffect, useState } from "react";
import { type Task, getTasksByProject } from "../api/tasks";
import { useProject } from "../context/ProjectContext";
import CreateTaskForm from "../components/CreateTaskForm";
import TaskItem from "../components/TaskItem";

export default function TasksPage() {
    const { activeProjectId } = useProject();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);

    const loadTasks = () => {
        if (activeProjectId) {
            getTasksByProject(activeProjectId).then(setTasks);
        }
    };

    useEffect(() => {
        loadTasks();
    }, [activeProjectId]);

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
        <div className="startup-container">
            <header className="startup-header">
                <div>
                    <h1 className="startup-title">Tasks</h1>
                    <p className="startup-subtitle">Manage your project deliverables</p>
                </div>
                <CreateTaskForm />
            </header>

            <div className="task-list">
                {/* List Header */}
                <div className="task-list-header">
                    <div>Title</div>
                    <div>Priority</div>
                    <div>Status</div>
                    <div className="text-right">Actions</div>
                </div>

                {/* List Body */}
                <div>
                    {tasks.map((t) => (
                        <TaskItem
                            key={t.id}
                            task={t}
                            onUpdate={loadTasks}
                            onView={(task) => setSelectedTask(task)}
                        />
                    ))}

                    {tasks.length === 0 && (
                        <div style={{ padding: '5rem 0', textAlign: 'center' }}>
                            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 mb-4">
                                <span className="text-xl text-zinc-600">✨</span>
                            </div>
                            <h3 className="text-zinc-400 font-medium text-sm">No tasks yet</h3>
                            <p className="text-zinc-600 text-xs mt-1">Add a task to get started</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Description Modal */}
            {selectedTask && (
                <div className="modal-overlay" onClick={() => setSelectedTask(null)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <button className="modal-close" onClick={() => setSelectedTask(null)}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                        </button>
                        <h2 className="text-2xl font-bold text-white mb-4 pr-8">{selectedTask.title}</h2>
                        <div className="text-zinc-300 leading-relaxed whitespace-pre-wrap text-sm max-h-[60vh] overflow-y-auto pr-2">
                            {selectedTask.description}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
