import { useState, useEffect, useRef } from "react";
import { X, Calendar } from "lucide-react";

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

    useEffect(() => {
        if (isOpen) {
            setTitle("");
            setPriority("medium");
            setDueDate(initialDate || "");
            // Focus input after a small delay to allow modal animation
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [isOpen, initialDate]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;
        onCreate(title, priority, dueDate || undefined);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-md bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl p-6 animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-white font-[Outfit]">New Task</h2>
                    <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">
                                Task Title
                            </label>
                            <input
                                ref={inputRef}
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="What needs to be done?"
                                className="w-full bg-zinc-800/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">
                                Priority
                            </label>
                            <div className="flex gap-2">
                                {['low', 'medium', 'high'].map((p) => (
                                    <button
                                        key={p}
                                        type="button"
                                        onClick={() => setPriority(p)}
                                        className={`flex-1 py-2 rounded-lg text-sm font-medium capitalize border transition-all ${priority === p
                                            ? p === 'high'
                                                ? 'bg-rose-500/20 border-rose-500/50 text-rose-400'
                                                : p === 'medium'
                                                    ? 'bg-amber-500/20 border-amber-500/50 text-amber-400'
                                                    : 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                                            : 'bg-zinc-800/50 border-white/5 text-zinc-400 hover:bg-zinc-800'
                                            }`}
                                    >
                                        {p}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2 flex justify-between items-center">
                                Due Date
                                <span className="text-[10px] lowercase py-0.5 px-2 bg-white/5 rounded-full border border-white/5 font-normal">Optional</span>
                            </label>
                            <div className="relative">
                                <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                                <input
                                    type="date"
                                    value={dueDate}
                                    onChange={(e) => setDueDate(e.target.value)}
                                    className="w-full bg-zinc-800/50 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all [color-scheme:dark]"
                                />
                                {!dueDate && (
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-zinc-600 font-medium pointer-events-none italic">

                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-xl text-zinc-400 hover:bg-white/5 transition-colors font-medium text-sm"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-all shadow-lg shadow-indigo-500/20"
                        >
                            Create Task
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
