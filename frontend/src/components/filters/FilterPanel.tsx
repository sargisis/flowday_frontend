import { useState } from 'react';
import { X, Filter, ChevronDown, ChevronUp, Tag, FileText, List, Paperclip, Search, ArrowUpDown } from 'lucide-react';
import type { TaskFilters, TaskSort, SortField } from '../../types/filters';

interface FilterPanelProps {
    filters: TaskFilters;
    sort?: TaskSort;
    onFiltersChange: (filters: TaskFilters) => void;
    onSortChange: (sort: TaskSort) => void;
    onClose?: () => void;
}

export default function FilterPanel({ filters, sort, onFiltersChange, onSortChange, onClose }: FilterPanelProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    const updateFilters = (updates: Partial<TaskFilters>) => {
        onFiltersChange({ ...filters, ...updates });
    };

    const toggleStatus = (status: 'Todo' | 'In_Progress' | 'Blocked' | 'Done') => {
        const current = filters.status || [];
        const newStatus = current.includes(status)
            ? current.filter(s => s !== status)
            : [...current, status];
        updateFilters({ status: newStatus.length > 0 ? newStatus : undefined });
    };

    const togglePriority = (priority: 'high' | 'medium' | 'low') => {
        const current = filters.priority || [];
        const newPriority = current.includes(priority)
            ? current.filter(p => p !== priority)
            : [...current, priority];
        updateFilters({ priority: newPriority.length > 0 ? newPriority : undefined });
    };

    const clearFilters = () => {
        onFiltersChange({});
    };

    const hasActiveFilters = !!(
        filters.status?.length ||
        filters.priority?.length ||
        filters.dueDate ||
        filters.createdDate ||
        filters.search ||
        filters.hasDescription !== undefined ||
        filters.hasSubtasks !== undefined ||
        filters.hasAttachments !== undefined
    );

    return (
        <div className="bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/10 rounded-xl p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <Filter size={16} className="text-zinc-600 dark:text-zinc-400" />
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider">
                        Filters & Sort
                    </h3>
                    {hasActiveFilters && (
                        <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-400 text-[10px] font-bold rounded">
                            Active
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    {hasActiveFilters && (
                        <button
                            onClick={clearFilters}
                            className="text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white font-medium"
                        >
                            Clear All
                        </button>
                    )}
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="p-1.5 rounded-lg hover:bg-zinc-200 dark:hover:bg-white/10 transition-colors"
                    >
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="p-1.5 rounded-lg hover:bg-zinc-200 dark:hover:bg-white/10 transition-colors"
                        >
                            <X size={16} />
                        </button>
                    )}
                </div>
            </div>

            {isExpanded && (
                <div className="space-y-4 pt-2 border-t border-zinc-200 dark:border-white/10">
                    {/* Search */}
                    <div>
                        <label className="flex items-center gap-2 text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-2 uppercase tracking-wider">
                            <Search size={14} />
                            Search
                        </label>
                        <input
                            type="text"
                            value={filters.search || ''}
                            onChange={(e) => updateFilters({ search: e.target.value || undefined })}
                            placeholder="Search tasks..."
                            className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-white/10 rounded-lg text-sm text-zinc-900 dark:text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    {/* Status Filter */}
                    <div>
                        <label className="flex items-center gap-2 text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-2 uppercase tracking-wider">
                            <List size={14} />
                            Status
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {(['Todo', 'In_Progress', 'Blocked', 'Done'] as const).map(status => (
                                <button
                                    key={status}
                                    onClick={() => toggleStatus(status)}
                                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                                        filters.status?.includes(status)
                                            ? status === 'Todo'
                                                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                                : status === 'In_Progress'
                                                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                                : status === 'Blocked'
                                                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                            : 'bg-zinc-100 dark:bg-white/5 text-zinc-600 dark:text-zinc-400 border border-zinc-300 dark:border-white/10 hover:border-zinc-400 dark:hover:border-white/20'
                                    }`}
                                >
                                    {status.replace('_', ' ')}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Priority Filter */}
                    <div>
                        <label className="flex items-center gap-2 text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-2 uppercase tracking-wider">
                            <Tag size={14} />
                            Priority
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {(['high', 'medium', 'low'] as const).map(priority => (
                                <button
                                    key={priority}
                                    onClick={() => togglePriority(priority)}
                                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                                        filters.priority?.includes(priority)
                                            ? priority === 'high'
                                                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                                : priority === 'medium'
                                                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                            : 'bg-zinc-100 dark:bg-white/5 text-zinc-600 dark:text-zinc-400 border border-zinc-300 dark:border-white/10 hover:border-zinc-400 dark:hover:border-white/20'
                                    }`}
                                >
                                    {priority}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Quick Filters */}
                    <div>
                        <label className="flex items-center gap-2 text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-2 uppercase tracking-wider">
                            <FileText size={14} />
                            Quick Filters
                        </label>
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => updateFilters({ 
                                    hasDescription: filters.hasDescription === true ? undefined : true 
                                })}
                                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                                    filters.hasDescription === true
                                        ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                                        : 'bg-zinc-100 dark:bg-white/5 text-zinc-600 dark:text-zinc-400 border border-zinc-300 dark:border-white/10 hover:border-zinc-400 dark:hover:border-white/20'
                                }`}
                            >
                                Has Description
                            </button>
                            <button
                                onClick={() => updateFilters({ 
                                    hasSubtasks: filters.hasSubtasks === true ? undefined : true 
                                })}
                                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                                    filters.hasSubtasks === true
                                        ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                                        : 'bg-zinc-100 dark:bg-white/5 text-zinc-600 dark:text-zinc-400 border border-zinc-300 dark:border-white/10 hover:border-zinc-400 dark:hover:border-white/20'
                                }`}
                            >
                                Has Subtasks
                            </button>
                            <button
                                onClick={() => updateFilters({ 
                                    hasAttachments: filters.hasAttachments === true ? undefined : true 
                                })}
                                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                                    filters.hasAttachments === true
                                        ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                                        : 'bg-zinc-100 dark:bg-white/5 text-zinc-600 dark:text-zinc-400 border border-zinc-300 dark:border-white/10 hover:border-zinc-400 dark:hover:border-white/20'
                                }`}
                            >
                                <Paperclip size={12} className="inline mr-1" />
                                Has Attachments
                            </button>
                        </div>
                    </div>

                    {/* Sort */}
                    <div>
                        <label className="flex items-center gap-2 text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-2 uppercase tracking-wider">
                            <ArrowUpDown size={14} />
                            Sort By
                        </label>
                        <div className="flex items-center gap-2">
                            <select
                                value={sort?.field || 'title'}
                                onChange={(e) => onSortChange({
                                    field: e.target.value as SortField,
                                    direction: sort?.direction || 'asc'
                                })}
                                className="px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-white/10 rounded-lg text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="title">Title</option>
                                <option value="priority">Priority</option>
                                <option value="status">Status</option>
                                <option value="dueDate">Due Date</option>
                                <option value="createdDate">Created Date</option>
                                <option value="updatedDate">Updated Date</option>
                            </select>
                            <button
                                onClick={() => onSortChange({
                                    field: sort?.field || 'title',
                                    direction: sort?.direction === 'asc' ? 'desc' : 'asc'
                                })}
                                className={`px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                                    sort?.direction === 'desc'
                                        ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                                        : 'bg-zinc-100 dark:bg-white/5 text-zinc-600 dark:text-zinc-400 border border-zinc-300 dark:border-white/10'
                                }`}
                            >
                                {sort?.direction === 'asc' ? '↑ Asc' : '↓ Desc'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
