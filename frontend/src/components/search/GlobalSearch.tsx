import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Search, X, CheckCircle2, Clock, ArrowRight } from 'lucide-react';
import { getAllTasks, type Task } from '../../api/tasks';
import { useTasks } from '../../context/TaskContext';
import { useDebounce } from '../../hooks/useDebounce';

interface GlobalSearchProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function GlobalSearch({ isOpen, onClose }: GlobalSearchProps) {
    const [query, setQuery] = useState('');
    const [allTasks, setAllTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const { openDetailsModal } = useTasks();

    // Debounce search query to avoid excessive filtering
    const debouncedQuery = useDebounce(query, 300);

    // Filter results with memoization (using debounced query)
    const results = useMemo(() => {
        if (!debouncedQuery.trim()) return [];

        const lowerQuery = debouncedQuery.toLowerCase();
        const filtered = allTasks.filter(task => {
            const searchStr = `${task.title} ${task.description || ''} ${task.status} ${task.priority}`.toLowerCase();
            return searchStr.includes(lowerQuery);
        });

        return filtered.slice(0, 10);
    }, [debouncedQuery, allTasks]);

    // Load tasks only when modal opens
    useEffect(() => {
        if (isOpen && allTasks.length === 0) {
            setIsLoading(true);
            getAllTasks()
                .then(setAllTasks)
                .catch(console.error)
                .finally(() => setIsLoading(false));
        }

        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 50);
            setSelectedIndex(0);
        }
    }, [isOpen]);

    // Reset selection when results change
    useEffect(() => {
        setSelectedIndex(0);
    }, [results.length]);

    // Auto-scroll to selected item
    useEffect(() => {
        const selectedElement = document.getElementById(`search-result-${selectedIndex}`);
        selectedElement?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }, [selectedIndex]);

    const handleTaskClick = useCallback((task: Task) => {
        openDetailsModal(task);
        onClose();
        setQuery('');
    }, [openDetailsModal, onClose]);

    // Keyboard navigation
    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => Math.max(prev - 1, 0));
        } else if (e.key === 'Enter' && results.length > 0) {
            e.preventDefault();
            handleTaskClick(results[selectedIndex]);
        } else if (e.key === 'Escape') {
            onClose();
        }
    }, [results, selectedIndex, handleTaskClick, onClose]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-[200] flex items-start justify-center bg-black/60 backdrop-blur-sm pt-[20vh] p-4"
            onClick={onClose}
        >
            <div
                className="relative w-full max-w-2xl bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                {/* Search Input */}
                <div className="flex items-center gap-3 p-4 border-b border-white/5">
                    <Search size={20} className="text-zinc-500 shrink-0" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Search tasks..."
                        className="flex-1 bg-transparent text-white placeholder-zinc-600 outline-none text-lg"
                        autoComplete="off"
                    />
                    {query && (
                        <button
                            onClick={() => setQuery('')}
                            className="p-1 text-zinc-500 hover:text-white"
                        >
                            <X size={16} />
                        </button>
                    )}
                    <kbd className="px-2 py-1 text-xs font-bold text-zinc-600 bg-zinc-800 rounded border border-white/5 shrink-0">
                        ESC
                    </kbd>
                </div>

                {/* Results */}
                <div className="max-h-[400px] overflow-y-auto">
                    {isLoading ? (
                        <div className="p-8 text-center">
                            <div className="inline-block h-6 w-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : !query ? (
                        <div className="p-6 text-center text-zinc-600 text-sm">
                            Start typing to search...
                        </div>
                    ) : results.length === 0 ? (
                        <div className="p-6 text-center text-zinc-600 text-sm">
                            No tasks found
                        </div>
                    ) : (
                        <div className="p-2">
                            {results.map((task, index) => (
                                <button
                                    key={task.id}
                                    id={`search-result-${index}`}
                                    onClick={() => handleTaskClick(task)}
                                    className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-colors ${index === selectedIndex
                                        ? 'bg-indigo-500/10 border border-indigo-500/30'
                                        : 'hover:bg-white/5 border border-transparent'
                                        }`}
                                >
                                    <div className={`shrink-0 ${task.status.toLowerCase() === 'done'
                                        ? 'text-emerald-400'
                                        : 'text-zinc-500'
                                        }`}>
                                        {task.status.toLowerCase() === 'done' ? (
                                            <CheckCircle2 size={18} />
                                        ) : (
                                            <Clock size={18} />
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="text-white font-medium truncate">
                                                {task.title}
                                            </span>
                                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase shrink-0 ${task.priority === 'high' ? 'bg-rose-500/20 text-rose-400' :
                                                task.priority === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                                                    'bg-emerald-500/20 text-emerald-400'
                                                }`}>
                                                {task.priority}
                                            </span>
                                        </div>
                                    </div>

                                    <ArrowRight size={14} className={`shrink-0 ${index === selectedIndex ? 'text-indigo-400' : 'text-zinc-600'
                                        }`} />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Keyboard hints */}
                {results.length > 0 && (
                    <div className="p-2 border-t border-white/5 flex items-center justify-center gap-4 text-[10px] text-zinc-600">
                        <span><kbd className="px-1 bg-zinc-800 rounded">↑↓</kbd> navigate</span>
                        <span><kbd className="px-1 bg-zinc-800 rounded">Enter</kbd> open</span>
                    </div>
                )}
            </div>
        </div>
    );
}

