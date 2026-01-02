import { useState, useEffect } from "react";
import { X, Calendar, CheckCircle2, Clock, Trash2, Sparkles, Edit3, Eye } from "lucide-react";
import ReactMarkdown from "react-markdown";
import type { Task } from "../../api/tasks";
import { useTasks } from "../../context/TaskContext";

interface TaskDetailsModalProps {
    task: Task | null;
    isOpen: boolean;
    onClose: () => void;
    onUpdate: (taskId: string, updates: Partial<Task>) => Promise<void>;
    onDelete: (taskId: string) => Promise<void>;
}

import { toast } from "sonner";

export default function TaskDetailsModal({ task, isOpen, onClose, onUpdate, onDelete }: TaskDetailsModalProps) {
    const { handleEnrichTask } = useTasks();
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [status, setStatus] = useState("");
    const [priority, setPriority] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [isEnriching, setIsEnriching] = useState(false);
    const [isPreview, setIsPreview] = useState(false);

    useEffect(() => {
        if (task && isOpen) {
            setTitle(task.title || "");
            setDescription(task.description || "");
            setStatus(task.status || "Todo");
            setPriority(task.priority || "medium");
            setDueDate(task.due_date ? new Date(task.due_date).toISOString().split('T')[0] : "");
        }
    }, [task, isOpen]);

    if (!isOpen || !task) return null;

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await onUpdate(task.id, {
                title,
                description,
                status,
                priority,
                due_date: dueDate ? new Date(dueDate).toISOString() : undefined
            });
            onClose();
            toast.success("Task updated");
        } catch (error) {
            console.error("Failed to update task", error);
            toast.error("Failed to save changes");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this task?")) return;
        try {
            await onDelete(task.id);
            onClose();
            toast.success("Task deleted");
        } catch (error) {
            console.error("Failed to delete task", error);
            toast.error("Failed to delete task");
        }
    };

    const handleEnrich = async () => {
        if (!task) return;
        setIsEnriching(true);
        try {
            const newDescription = await handleEnrichTask(task.id);
            setDescription(newDescription);
            toast.success("Magic Plan generated!");
        } catch (error) {
            console.error("AI Enrichment failed", error);
            toast.error("AI Enrichment failed. Check backend logs.");
        } finally {
            setIsEnriching(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 p-4">
            <div className="w-full max-w-2xl bg-zinc-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-white/5">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${status === 'Done' ? 'bg-emerald-500/10 text-emerald-400' :
                            status === 'In_Progress' ? 'bg-indigo-500/10 text-indigo-400' :
                                'bg-zinc-500/10 text-zinc-400'
                            }`}>
                            {status === 'Done' ? <CheckCircle2 size={18} /> : <Clock size={18} />}
                        </div>
                        <h2 className="text-xl font-bold text-white font-[Outfit]">Task Details</h2>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleDelete}
                            className="p-2 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all"
                            title="Delete Task"
                        >
                            <Trash2 size={20} />
                        </button>
                        <button onClick={onClose} className="p-2 text-zinc-500 hover:text-white hover:bg-white/5 rounded-xl transition-all">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                <div className="p-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Main Content */}
                        <div className="md:col-span-2 space-y-6">
                            <div>
                                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">
                                    Title
                                </label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full bg-black/20 border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500/50 transition-all text-lg font-medium"
                                />
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                                        Description
                                    </label>
                                    <button
                                        onClick={() => setIsPreview(!isPreview)}
                                        className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 transition-colors bg-indigo-500/10 px-2 py-1 rounded-md"
                                    >
                                        {isPreview ? <Edit3 size={10} /> : <Eye size={10} />}
                                        {isPreview ? "Edit" : "Preview"}
                                    </button>
                                </div>

                                <div className="min-h-[160px] bg-black/20 border border-white/5 rounded-2xl overflow-hidden focus-within:border-indigo-500/30 transition-all">
                                    {isPreview ? (
                                        <div className="p-4 text-sm text-zinc-300 leading-relaxed prose-premium max-w-none overflow-y-auto max-h-[300px]">
                                            <ReactMarkdown>{description || "*No description yet. Use 'Magic Plan' to generate one!*"}</ReactMarkdown>
                                        </div>
                                    ) : (
                                        <textarea
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            rows={6}
                                            placeholder="Add more details about this task..."
                                            className="w-full bg-transparent p-4 text-zinc-300 placeholder-zinc-700 focus:outline-none transition-all resize-none text-sm leading-relaxed"
                                        />
                                    )}
                                </div>
                            </div>

                            {/* AI Plan Section (Refined) */}
                            <div className="p-1 rounded-3xl bg-gradient-to-br from-indigo-500/20 via-purple-500/10 to-transparent border border-white/10 relative overflow-hidden group/ai shadow-2xl shadow-indigo-500/5">
                                <div className="absolute inset-0 bg-indigo-500/5 backdrop-blur-3xl" />
                                <div className="relative p-5 flex flex-col md:flex-row items-center justify-between gap-5 bg-zinc-900/40 rounded-[22px]">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1.5">
                                            <div className="p-1.5 bg-indigo-500/20 rounded-lg">
                                                <Sparkles size={16} className="text-indigo-400" />
                                            </div>
                                            <h4 className="text-sm font-bold text-white uppercase tracking-wider font-[Outfit]">AI Power-Up</h4>
                                        </div>
                                        <p className="text-xs text-zinc-400 leading-relaxed max-w-[280px]">
                                            Generate an intelligent execution plan with advanced AI in seconds.
                                        </p>
                                    </div>
                                    <button
                                        onClick={handleEnrich}
                                        disabled={isEnriching}
                                        className="relative overflow-hidden whitespace-nowrap px-6 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all shadow-xl shadow-indigo-500/20 flex items-center gap-2 group/btn"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover/btn:animate-shimmer" />
                                        {isEnriching ? (
                                            <span className="flex items-center gap-2">
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Strategizing...
                                            </span>
                                        ) : (
                                            <>
                                                <Sparkles size={16} className="group-hover/btn:rotate-12 transition-transform" />
                                                Magic Plan
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Sidebar info */}
                        <div className="space-y-6 bg-black/20 rounded-2xl p-6 border border-white/5 h-fit">
                            <div>
                                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">
                                    Status
                                </label>
                                <select
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                    className="w-full bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
                                >
                                    <option value="Todo">To Do</option>
                                    <option value="In_Progress">In Progress</option>
                                    <option value="Blocked">Blocked</option>
                                    <option value="Done">Done</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">
                                    Priority
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {['low', 'medium', 'high'].map((p) => (
                                        <button
                                            key={p}
                                            type="button"
                                            onClick={() => setPriority(p)}
                                            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase border transition-all flex-1 min-w-[60px] ${priority === p
                                                ? p === 'high' ? 'bg-rose-500/20 border-rose-500/50 text-rose-400 shadow-[0_0_10px_rgba(244,63,94,0.2)]'
                                                    : p === 'medium' ? 'bg-amber-500/20 border-amber-500/50 text-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                                                        : 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                                                : 'bg-zinc-800 border-white/5 text-zinc-500 hover:text-zinc-400'
                                                }`}
                                        >
                                            {p}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">
                                    Due Date
                                </label>
                                <div className="space-y-2">
                                    <div className="relative">
                                        <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
                                        <input
                                            type="date"
                                            value={dueDate}
                                            onChange={(e) => setDueDate(e.target.value)}
                                            className="w-full bg-zinc-800 border border-white/10 rounded-lg pl-9 pr-2 py-2 text-[13px] text-white focus:outline-none [color-scheme:dark] appearance-none"
                                        />
                                    </div>
                                    {dueDate && (
                                        <button
                                            onClick={() => setDueDate("")}
                                            className="w-full py-1.5 text-[10px] font-bold text-zinc-500 hover:text-zinc-300 bg-white/5 rounded-lg border border-white/5 transition-all"
                                        >
                                            Remove Deadline
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 bg-black/40 border-t border-white/5 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 rounded-xl text-zinc-400 hover:bg-white/5 transition-all text-sm font-medium"
                    >
                        Discard
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="px-8 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-sm transition-all shadow-lg shadow-indigo-500/20"
                    >
                        {isSaving ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </div>
        </div>
    );
}
