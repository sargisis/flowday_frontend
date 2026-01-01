import { useState, useEffect, useCallback } from "react";
import { Search, Layout, CheckSquare, Users, Settings, Timer, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useProject } from "../context/ProjectContext";
import { useTasks } from "../context/TaskContext";
import { getTasksByProject, type Task } from "../api/tasks";

export default function CommandPalette() {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { activeProjectId } = useProject();
    const { openDetailsModal, refreshTrigger } = useTasks();

    const fetchTasks = useCallback(async () => {
        if (!activeProjectId) return;
        setIsLoading(true);
        try {
            const data = await getTasksByProject(activeProjectId);
            setTasks(data);
        } catch (error) {
            console.error("Failed to fetch tasks for command palette", error);
        } finally {
            setIsLoading(false);
        }
    }, [activeProjectId, refreshTrigger]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "k") {
                e.preventDefault();
                setIsOpen(prev => !prev);
            }
            if (e.key === "Escape") {
                setIsOpen(false);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    useEffect(() => {
        if (isOpen && activeProjectId) {
            fetchTasks();
            setQuery("");
        }
    }, [isOpen, activeProjectId, fetchTasks]);

    const filteredTasks = query.trim() === ""
        ? []
        : tasks.filter(t => t.title.toLowerCase().includes(query.toLowerCase())).slice(0, 5);

    const navigations = [
        { name: "Go to Dashboard", path: "/app/v1/dashboard", icon: Layout },
        { name: "Check Tasks", path: "/app/v1/tasks", icon: CheckSquare },
        { name: "Team Hub", path: "/app/v1/team", icon: Users },
        { name: "Focus Mode", path: "/app/v1/focus", icon: Timer },
        { name: "Settings", path: "/app/v1/settings", icon: Settings },
    ].filter(nav => nav.name.toLowerCase().includes(query.toLowerCase()));

    const handleNavigate = (path: string) => {
        navigate(path);
        setIsOpen(false);
    };

    const handleTaskSelect = (task: Task) => {
        openDetailsModal(task);
        setIsOpen(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
                onClick={() => setIsOpen(false)}
            />

            {/* Palette Container */}
            <div className="w-full max-w-2xl bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 relative z-10">
                <div className="flex items-center px-6 py-4 border-b border-white/5">
                    <Search className="h-5 w-5 text-zinc-500 mr-4" />
                    <input
                        autoFocus
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Type to search tasks or navigate..."
                        className="flex-1 bg-transparent border-none text-white focus:outline-none placeholder:text-zinc-600 font-medium"
                    />
                    <div className="flex items-center gap-2">
                        <kbd className="px-2 py-1 bg-white/5 border border-white/10 rounded text-[10px] text-zinc-500 font-mono">
                            ESC
                        </kbd>
                    </div>
                </div>

                <div className="max-h-[60vh] overflow-y-auto custom-scrollbar p-2">
                    {/* Navigation Results */}
                    {navigations.length > 0 && (
                        <div className="mb-2">
                            <h3 className="px-4 py-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Navigation</h3>
                            {navigations.map(nav => (
                                <button
                                    key={nav.path}
                                    onClick={() => handleNavigate(nav.path)}
                                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 rounded-xl transition-all group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-zinc-800 text-zinc-400 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                                            <nav.icon size={16} />
                                        </div>
                                        <span className="text-sm font-medium text-zinc-300 group-hover:text-white">{nav.name}</span>
                                    </div>
                                    <ArrowRight size={14} className="text-zinc-700 group-hover:text-zinc-400 group-hover:translate-x-1 transition-all" />
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Task Search Results */}
                    {isLoading ? (
                        <div className="p-8 text-center text-zinc-600 text-sm italic">
                            Searching tasks...
                        </div>
                    ) : filteredTasks.length > 0 ? (
                        <div>
                            <h3 className="px-4 py-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Tasks</h3>
                            {filteredTasks.map(task => (
                                <button
                                    key={task.id}
                                    onClick={() => handleTaskSelect(task)}
                                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 rounded-xl transition-all group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`h-2 w-2 rounded-full ${task.priority === 'high' ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]' :
                                            task.priority === 'medium' ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]' :
                                                'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]'
                                            }`} />
                                        <div className="text-left">
                                            <p className="text-sm font-medium text-zinc-300 group-hover:text-white leading-none mb-1">{task.title}</p>
                                            <p className="text-[10px] text-zinc-600 uppercase font-bold tracking-wider">{task.status}</p>
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-medium text-zinc-600 group-hover:text-indigo-400 transition-colors">Select task</span>
                                </button>
                            ))}
                        </div>
                    ) : query.trim() !== "" && (
                        <div className="p-8 text-center">
                            <p className="text-zinc-500 text-sm">No results found for "{query}"</p>
                        </div>
                    )}

                    {!query && (
                        <div className="p-8 text-center">
                            <p className="text-zinc-500 text-xs mb-4 uppercase tracking-widest font-bold">Try searching for tasks or use a shortcut</p>
                            <div className="grid grid-cols-2 gap-2 text-[10px] text-zinc-700 font-mono">
                                <div><span className="text-zinc-500">C</span> - Create Task</div>
                                <div><kbd>?</kbd> - Shortcuts</div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-3 bg-black/40 border-t border-white/5 flex items-center justify-between text-[10px] text-zinc-600">
                    <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1"><kbd className="bg-zinc-800 px-1.5 py-0.5 rounded border border-white/5">↑↓</kbd> to navigate</span>
                        <span className="flex items-center gap-1"><kbd className="bg-zinc-800 px-1.5 py-0.5 rounded border border-white/5">↵</kbd> to select</span>
                    </div>
                    <span>Flowday Command Palette v1.0</span>
                </div>
            </div>
        </div>
    );
}
