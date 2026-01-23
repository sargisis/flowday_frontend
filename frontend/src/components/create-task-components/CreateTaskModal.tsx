import { useState, useEffect, useRef } from "react";
import { X, Calendar } from "lucide-react";
import { useAutoSave } from "../../hooks/useAutoSave";

interface CreateTaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (title: string, priority: string, dueDate?: string) => void;
    initialDate?: string;
}

export default function CreateTaskModal({ isOpen, onClose, onCreate, initialDate }: CreateTaskModalProps) {
    const [title, setTitle] = useState("");
    const [priority, setPriority] = useState("medium");
    const [dueDate, setDueDate] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    // Auto-save draft to localStorage
    const formData = { title, priority, dueDate };
    const { clearDraft } = useAutoSave({
        data: formData,
        onSave: async () => {
            // Just save to localStorage, no API call
            // This is handled by the storageKey option
        },
        storageKey: 'task-draft',
        delay: 1500,
        enabled: isOpen && title.trim().length > 0, // Only save if modal is open and has content
    });

    useEffect(() => {
        if (isOpen) {
            // Try to load draft from localStorage
            try {
                const saved = localStorage.getItem('task-draft');
                if (saved) {
                    const parsed = JSON.parse(saved);
                    setTitle(parsed.title || "");
                    setPriority(parsed.priority || "medium");
                    setDueDate(parsed.dueDate || initialDate || "");
                } else {
                    setTitle("");
                    setPriority("medium");
                    setDueDate(initialDate || "");
                }
            } catch {
                // If parsing fails, use defaults
                setTitle("");
                setPriority("medium");
                setDueDate(initialDate || "");
            }
            // Focus input after a small delay to allow modal animation
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [isOpen, initialDate]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;
        onCreate(title, priority, dueDate || undefined);
        clearDraft(); // Clear draft after successful creation
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
            <div className="w-full h-full sm:h-auto sm:max-w-md bg-zinc-900/95 border-0 sm:border border-zinc-800/50 rounded-none sm:rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center px-4 sm:px-6 py-3 sm:py-4 border-b border-zinc-800/50 bg-zinc-900/50 shrink-0">
                    <h2 className="text-lg sm:text-xl font-semibold text-white">New Task</h2>
                    <button 
                        onClick={onClose} 
                        className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                    <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 flex-1 overflow-y-auto">
                        <div>
                            <label className="block text-xs font-semibold text-zinc-400 mb-2 uppercase tracking-wide">
                                Task Title
                            </label>
                            <input
                                ref={inputRef}
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="What needs to be done?"
                                className="w-full bg-zinc-800/80 border border-zinc-700/50 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-base font-medium transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-zinc-400 mb-2 uppercase tracking-wide">
                                Priority
                            </label>
                            <div className="flex gap-2">
                                {['low', 'medium', 'high'].map((p) => (
                                    <button
                                        key={p}
                                        type="button"
                                        onClick={() => setPriority(p)}
                                        className={`flex-1 px-3 py-3 sm:py-2 rounded-lg sm:rounded-md text-xs sm:text-[11px] font-bold uppercase tracking-wide transition-all touch-manipulation ${
                                            priority === p
                                                ? p === 'high' 
                                                    ? 'bg-red-500 text-white shadow-md shadow-red-500/20'
                                                    : p === 'medium' 
                                                        ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                                                        : 'bg-green-500 text-white shadow-md shadow-green-500/20'
                                                : 'bg-zinc-700/60 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-300'
                                        }`}
                                    >
                                        {p}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-zinc-400 mb-2 uppercase tracking-wide">
                                Due Date
                            </label>
                            <div className="relative">
                                <Calendar size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
                                <input
                                    type="date"
                                    value={dueDate}
                                    onChange={(e) => setDueDate(e.target.value)}
                                    className="w-full bg-zinc-900/60 border border-zinc-700/40 rounded-md pl-9 pr-2.5 py-2.5 text-sm font-medium text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 [color-scheme:dark] transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="px-4 sm:px-6 py-3 sm:py-4 bg-zinc-900/50 border-t border-zinc-800/50 flex justify-end gap-2 sm:gap-3 shrink-0">
                        <button
                            type="button"
                            onClick={() => {
                                onClose();
                            }}
                            className="px-4 sm:px-5 py-2.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 text-sm font-medium transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-5 sm:px-6 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white text-sm font-semibold shadow-lg shadow-blue-500/20 transition-all"
                        >
                            Create Task
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
