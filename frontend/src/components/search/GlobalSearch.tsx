import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Search, X, CheckCircle2, Clock, ArrowRight, Filter, Bookmark, BookmarkCheck } from 'lucide-react';
import { getAllTasks, type Task } from '../../api/tasks';
import { getTaskComments, type Comment } from '../../api/comments';
import { useTasks } from '../../context/TaskContext';
import { useProject } from '../../context/ProjectContext';
import { useDebounce } from '../../hooks/useDebounce';
import { useSavedSearches } from '../../hooks/useSavedSearches';
import { searchTasks, parseSearchQuery, type SearchFilters, type SearchResult } from '../../utils/searchUtils';
import { toast } from 'sonner';

interface GlobalSearchProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function GlobalSearch({ isOpen, onClose }: GlobalSearchProps) {
    const [query, setQuery] = useState('');
    const [allTasks, setAllTasks] = useState<Task[]>([]);
    const [commentsMap, setCommentsMap] = useState<Map<string, Comment[]>>(new Map());
    const [isLoading, setIsLoading] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState<SearchFilters>({});
    const [showSavedSearches, setShowSavedSearches] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const { openDetailsModal } = useTasks();
    const { activeProjectId } = useProject();
    const { savedSearches, saveSearch, deleteSearch } = useSavedSearches();

    // Debounce search query
    const debouncedQuery = useDebounce(query, 300);

    // Parse query and merge with filters
    const { searchText, filters: parsedFilters } = useMemo(() => {
        return parseSearchQuery(debouncedQuery);
    }, [debouncedQuery]);

    const mergedFilters: SearchFilters = useMemo(() => {
        return {
            ...filters,
            ...parsedFilters,
            projectId: filters.projectId || activeProjectId || undefined,
        };
    }, [filters, parsedFilters, activeProjectId]);

    // Search results with fuzzy matching
    const results = useMemo(() => {
        if (!searchText.trim() && Object.keys(mergedFilters).length === 0) {
            return [];
        }

        return searchTasks(allTasks, searchText, mergedFilters, commentsMap).slice(0, 20);
    }, [searchText, allTasks, mergedFilters, commentsMap]);

    // Load tasks and comments when modal opens
    useEffect(() => {
        if (isOpen && allTasks.length === 0) {
            setIsLoading(true);
            Promise.all([
                getAllTasks().then(setAllTasks).catch(console.error),
                // Load comments for all tasks (optional, can be lazy loaded)
                getAllTasks().then(async (tasks) => {
                    const comments = new Map<string, Comment[]>();
                    // Load comments for first 50 tasks only (to avoid too many requests)
                    const tasksToLoad = tasks.slice(0, 50);
                    await Promise.all(
                        tasksToLoad.map(async (task) => {
                            try {
                                const taskComments = await getTaskComments(task.id);
                                if (taskComments.length > 0) {
                                    comments.set(task.id, taskComments);
                                }
                            } catch (err) {
                                // Silently fail for comments
                            }
                        })
                    );
                    setCommentsMap(comments);
                }).catch(console.error),
            ]).finally(() => setIsLoading(false));
        }

        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 50);
            setSelectedIndex(0);
        } else {
            setQuery('');
            setFilters({});
            setShowFilters(false);
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

    const handleTaskClick = useCallback((result: SearchResult) => {
        openDetailsModal(result.task);
        onClose();
        setQuery('');
    }, [openDetailsModal, onClose]);

    const handleSaveSearch = useCallback(() => {
        if (!query.trim()) {
            toast.error('Enter a search query first');
            return;
        }
        const name = prompt('Name for this search:');
        if (name) {
            saveSearch(name, query, mergedFilters);
            toast.success('Search saved');
        }
    }, [query, mergedFilters, saveSearch]);

    const handleLoadSavedSearch = useCallback((saved: typeof savedSearches[0]) => {
        setQuery(saved.query);
        if (saved.filters) {
            setFilters(saved.filters);
        }
        setShowSavedSearches(false);
        inputRef.current?.focus();
    }, []);

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
        } else if (e.key === 's' && (e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            handleSaveSearch();
        }
    }, [results, selectedIndex, handleTaskClick, onClose, handleSaveSearch]);

    if (!isOpen) return null;

    const activeFiltersCount = Object.keys(mergedFilters).filter(
        key => key !== 'projectId' && mergedFilters[key as keyof SearchFilters]
    ).length;

    return (
        <div
            className="fixed inset-0 z-[200] flex items-start justify-center bg-black/60 backdrop-blur-sm pt-[15vh] p-4"
            onClick={onClose}
        >
            <div
                className="relative w-full max-w-3xl bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
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
                        placeholder="Search tasks... (try: status:done priority:high or in:comments)"
                        className="flex-1 bg-transparent text-white placeholder-zinc-600 outline-none text-lg"
                        autoComplete="off"
                    />
                    {query && (
                        <button
                            onClick={() => setQuery('')}
                            className="p-1 text-zinc-500 hover:text-white transition-colors"
                            title="Clear"
                        >
                            <X size={16} />
                        </button>
                    )}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowSavedSearches(!showSavedSearches)}
                            className="p-1.5 text-zinc-500 hover:text-indigo-400 transition-colors relative"
                            title="Saved searches"
                        >
                            <Bookmark size={16} />
                            {savedSearches.length > 0 && (
                                <span className="absolute -top-1 -right-1 w-4 h-4 bg-indigo-500 text-white text-[10px] rounded-full flex items-center justify-center">
                                    {savedSearches.length}
                                </span>
                            )}
                        </button>
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`p-1.5 transition-colors relative ${
                                activeFiltersCount > 0
                                    ? 'text-indigo-400'
                                    : 'text-zinc-500 hover:text-indigo-400'
                            }`}
                            title="Filters"
                        >
                            <Filter size={16} />
                            {activeFiltersCount > 0 && (
                                <span className="absolute -top-1 -right-1 w-4 h-4 bg-indigo-500 text-white text-[10px] rounded-full flex items-center justify-center">
                                    {activeFiltersCount}
                                </span>
                            )}
                        </button>
                        <kbd className="px-2 py-1 text-xs font-bold text-zinc-600 bg-zinc-800 rounded border border-white/5 shrink-0">
                            ESC
                        </kbd>
                    </div>
                </div>

                {/* Saved Searches Dropdown */}
                {showSavedSearches && savedSearches.length > 0 && (
                    <div className="border-b border-white/5 p-2 max-h-40 overflow-y-auto">
                        <div className="text-xs text-zinc-500 px-2 py-1 mb-1">Saved Searches</div>
                        {savedSearches.map((saved) => (
                            <div
                                key={saved.id}
                                className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 group"
                            >
                                <button
                                    onClick={() => handleLoadSavedSearch(saved)}
                                    className="flex-1 text-left text-sm text-zinc-300 hover:text-white"
                                >
                                    <div className="font-medium">{saved.name}</div>
                                    <div className="text-xs text-zinc-500 truncate">{saved.query}</div>
                                </button>
                                <button
                                    onClick={() => deleteSearch(saved.id)}
                                    className="p-1 text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Filters Panel */}
                {showFilters && (
                    <div className="border-b border-white/5 p-4 space-y-3 bg-zinc-950/50">
                        <div className="grid grid-cols-2 gap-3">
                            {/* Status Filter */}
                            <div>
                                <label className="text-xs text-zinc-500 mb-1 block">Status</label>
                                <div className="flex flex-wrap gap-1">
                                    {['todo', 'in_progress', 'done', 'blocked'].map((status) => (
                                        <button
                                            key={status}
                                            onClick={() => {
                                                setFilters(prev => ({
                                                    ...prev,
                                                    status: prev.status?.includes(status)
                                                        ? prev.status.filter(s => s !== status)
                                                        : [...(prev.status || []), status],
                                                }));
                                            }}
                                            className={`px-2 py-1 text-xs rounded ${
                                                filters.status?.includes(status)
                                                    ? 'bg-indigo-500 text-white'
                                                    : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                                            }`}
                                        >
                                            {status}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Priority Filter */}
                            <div>
                                <label className="text-xs text-zinc-500 mb-1 block">Priority</label>
                                <div className="flex flex-wrap gap-1">
                                    {['high', 'medium', 'low'].map((priority) => (
                                        <button
                                            key={priority}
                                            onClick={() => {
                                                setFilters(prev => ({
                                                    ...prev,
                                                    priority: prev.priority?.includes(priority)
                                                        ? prev.priority.filter(p => p !== priority)
                                                        : [...(prev.priority || []), priority],
                                                }));
                                            }}
                                            className={`px-2 py-1 text-xs rounded ${
                                                filters.priority?.includes(priority)
                                                    ? 'bg-indigo-500 text-white'
                                                    : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                                            }`}
                                        >
                                            {priority}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Additional Options */}
                        <div className="flex items-center gap-4">
                            <label className="flex items-center gap-2 text-sm text-zinc-400 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={filters.searchInComments || false}
                                    onChange={(e) => setFilters(prev => ({
                                        ...prev,
                                        searchInComments: e.target.checked,
                                    }))}
                                    className="w-4 h-4 rounded border-zinc-700 bg-zinc-800 text-indigo-500"
                                />
                                <span>Search in comments</span>
                            </label>
                        </div>
                    </div>
                )}

                {/* Results */}
                <div className="max-h-[400px] overflow-y-auto">
                    {isLoading ? (
                        <div className="p-8 text-center">
                            <div className="inline-block h-6 w-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : !query && Object.keys(mergedFilters).length === 0 ? (
                        <div className="p-6 text-center text-zinc-600 text-sm space-y-2">
                            <p>Start typing to search...</p>
                            <div className="text-xs text-zinc-700 space-y-1 mt-4">
                                <p><kbd className="px-1.5 py-0.5 bg-zinc-800 rounded">status:done</kbd> Filter by status</p>
                                <p><kbd className="px-1.5 py-0.5 bg-zinc-800 rounded">priority:high</kbd> Filter by priority</p>
                                <p><kbd className="px-1.5 py-0.5 bg-zinc-800 rounded">in:comments</kbd> Search in comments</p>
                            </div>
                        </div>
                    ) : results.length === 0 ? (
                        <div className="p-6 text-center text-zinc-600 text-sm">
                            No tasks found
                        </div>
                    ) : (
                        <div className="p-2">
                            <div className="text-xs text-zinc-600 px-2 py-1 mb-1">
                                {results.length} result{results.length !== 1 ? 's' : ''}
                            </div>
                            {results.map((result, index) => (
                                <button
                                    key={result.task.id}
                                    id={`search-result-${index}`}
                                    onClick={() => handleTaskClick(result)}
                                    className={`w-full flex items-start gap-3 p-3 rounded-xl text-left transition-colors ${
                                        index === selectedIndex
                                            ? 'bg-indigo-500/10 border border-indigo-500/30'
                                            : 'hover:bg-white/5 border border-transparent'
                                    }`}
                                >
                                    <div className={`shrink-0 mt-0.5 ${
                                        result.task.status.toLowerCase() === 'done'
                                            ? 'text-emerald-400'
                                            : 'text-zinc-500'
                                    }`}>
                                        {result.task.status.toLowerCase() === 'done' ? (
                                            <CheckCircle2 size={18} />
                                        ) : (
                                            <Clock size={18} />
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span
                                                className="text-white font-medium"
                                                dangerouslySetInnerHTML={{ __html: result.highlightedTitle }}
                                            />
                                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase shrink-0 ${
                                                result.task.priority === 'high' ? 'bg-rose-500/20 text-rose-400' :
                                                result.task.priority === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                                                'bg-emerald-500/20 text-emerald-400'
                                            }`}>
                                                {result.task.priority}
                                            </span>
                                        </div>
                                        {result.highlightedDescription && (
                                            <div
                                                className="text-xs text-zinc-400 line-clamp-2"
                                                dangerouslySetInnerHTML={{ __html: result.highlightedDescription }}
                                            />
                                        )}
                                        <div className="flex items-center gap-2 mt-1.5">
                                            {result.matchedFields.map(field => (
                                                <span key={field} className="text-[10px] text-zinc-600 bg-zinc-800 px-1.5 py-0.5 rounded">
                                                    {field}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <ArrowRight size={14} className={`shrink-0 mt-1 ${
                                        index === selectedIndex ? 'text-indigo-400' : 'text-zinc-600'
                                    }`} />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-2 border-t border-white/5 flex items-center justify-between text-[10px] text-zinc-600">
                    <div className="flex items-center gap-4">
                        <span><kbd className="px-1 bg-zinc-800 rounded">↑↓</kbd> navigate</span>
                        <span><kbd className="px-1 bg-zinc-800 rounded">Enter</kbd> open</span>
                        <span><kbd className="px-1 bg-zinc-800 rounded">Ctrl+S</kbd> save</span>
                    </div>
                    {results.length > 0 && (
                        <button
                            onClick={handleSaveSearch}
                            className="flex items-center gap-1 text-zinc-500 hover:text-indigo-400 transition-colors"
                        >
                            <BookmarkCheck size={12} />
                            <span>Save search</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
