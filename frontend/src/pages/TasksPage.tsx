import { useEffect, useState, useMemo, useCallback } from "react";
import { type Task, getTasksByProject, bulkDeleteTasks } from "../api/tasks";
import { useProject } from "../context/ProjectContext";
import { useTasks } from "../context/TaskContext";
import KanbanBoard from "../components/kanban/KanbanBoard";
import EmptyState from "../components/state/EmptyState";
import { KanbanColumnSkeleton } from "../components/skeletons/KanbanColumnSkeleton";
import { CheckSquare, LayoutList, Activity, CheckCircle2, AlertCircle, Filter, Trash2, FileText, Keyboard, Sparkles } from "lucide-react";
import { toast } from "sonner";
import useSound from "../hooks/useSound";
import SavedViewsDropdown from "../components/saved-views/SavedViewsDropdown";
import TaskTemplateModal from "../components/templates/TaskTemplateModal";
import ExportImportButtons from "../components/export-import/ExportImportButtons";
import KeyboardShortcutsModal from "../components/keyboard-shortcuts/KeyboardShortcutsModal";
import { useKeyboardShortcuts, COMMON_SHORTCUTS } from "../hooks/useKeyboardShortcuts";
import { useTaskFilters } from "../hooks/useTaskFilters";
import { useURLFilters } from "../hooks/useURLFilters";
import FilterPanel from "../components/filters/FilterPanel";
import GroupingSelector from "../components/filters/GroupingSelector";
import { DEFAULT_PRESETS, type GroupBy, type GroupingOptions } from "../types/filters";
import { useTaskGrouping } from "../hooks/useTaskGrouping";
import GlobalSearch from "../components/search/GlobalSearch";

export default function TasksPage() {
    const { activeProjectId } = useProject();
    const { openCreateModal, openDetailsModal, handleUpdateTask, handleDeleteTask, refreshTrigger } = useTasks();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [activeFilter, setActiveFilter] = useState<'all' | 'high' | 'due-soon'>('all');
    const [showFilterPanel, setShowFilterPanel] = useState(false);
    const [groupBy, setGroupBy] = useState<GroupBy>('none');
    
    // ✅ NEW: Advanced filters and sorting
    const { filters, sort, updateFilters, updateSort } = useURLFilters();
    const filteredAndSortedTasks = useTaskFilters(tasks, filters, sort);
    
    // ✅ NEW: Task grouping
    const grouping: GroupingOptions = { groupBy, showEmptyGroups: false };
    const taskGroups = useTaskGrouping(filteredAndSortedTasks, grouping);

    // Selection state
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [selectedTaskIds, setSelectedTaskIds] = useState<Set<string>>(new Set());
    
    // ✅ NEW FEATURES: Templates and Saved Views
    const [showTemplateModal, setShowTemplateModal] = useState(false);
    const [showShortcutsModal, setShowShortcutsModal] = useState(false);
    const [showGlobalSearch, setShowGlobalSearch] = useState(false);

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

    // Listen for task-updated events (e.g., from duplicate)
    useEffect(() => {
        const handleTaskUpdated = async () => {
            if (activeProjectId) {
                const data = await getTasksByProject(activeProjectId);
                setTasks(data);
            }
        };

        window.addEventListener('task-updated', handleTaskUpdated);
        return () => window.removeEventListener('task-updated', handleTaskUpdated);
    }, [activeProjectId]);

    // State for keyboard navigation
    const [selectedTaskIndex, setSelectedTaskIndex] = useState<number>(-1);
    const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

    // Selection handling functions - defined early so they can be used in useEffect
    const handleBulkDelete = useCallback(async () => {
        if (selectedTaskIds.size === 0) return;
        if (!confirm(`Delete ${selectedTaskIds.size} selected tasks?`)) return;

        setIsLoading(true);
        try {
            await bulkDeleteTasks(Array.from(selectedTaskIds));
            // Trigger refresh
            if (activeProjectId) {
                const data = await getTasksByProject(activeProjectId);
                setTasks(data);
            }
            setIsSelectionMode(false);
            setSelectedTaskIds(new Set());
            toast.success(`Deleted ${selectedTaskIds.size} task${selectedTaskIds.size > 1 ? 's' : ''}`);
        } catch (error) {
            console.error("Failed to bulk delete", error);
            toast.error("Failed to delete tasks");
        } finally {
            setIsLoading(false);
        }
    }, [selectedTaskIds, activeProjectId]);

    const handleBulkStatusChange = useCallback(async (newStatus: string) => {
        if (selectedTaskIds.size === 0) return;

        setIsLoading(true);
        try {
            // Update all selected tasks
            await Promise.all(
                Array.from(selectedTaskIds).map(taskId =>
                    handleUpdateTask(taskId, { status: newStatus })
                )
            );
            
            // Refresh tasks
            if (activeProjectId) {
                const data = await getTasksByProject(activeProjectId);
                setTasks(data);
            }
            
            toast.success(`Updated ${selectedTaskIds.size} task${selectedTaskIds.size > 1 ? 's' : ''} to ${newStatus}`);
            setIsSelectionMode(false);
            setSelectedTaskIds(new Set());
        } catch (error) {
            console.error("Failed to bulk update", error);
            toast.error("Failed to update tasks");
        } finally {
            setIsLoading(false);
        }
    }, [selectedTaskIds, activeProjectId, handleUpdateTask]);

    // ✅ NEW: Enhanced Keyboard Shortcuts
    useKeyboardShortcuts(
        [
            {
                ...COMMON_SHORTCUTS.CREATE_TASK,
                action: () => openCreateModal(),
            },
            {
                ...COMMON_SHORTCUTS.SELECT_MODE,
                action: () => {
                    if (!isSelectionMode) {
                        setIsSelectionMode(true);
                    }
                },
            },
            {
                key: '?',
                shift: true,
                description: 'Show keyboard shortcuts',
                action: () => setShowShortcutsModal(true),
            },
            {
                ...COMMON_SHORTCUTS.SEARCH,
                action: () => setShowGlobalSearch(true),
            },
            {
                key: 'Escape',
                description: 'Close modals / Cancel selection',
                action: () => {
                    if (isSelectionMode) {
                        setIsSelectionMode(false);
                        setSelectedTaskIds(new Set());
                    }
                    setShowTemplateModal(false);
                    setShowShortcutsModal(false);
                    setSelectedTaskId(null);
                    setSelectedTaskIndex(-1);
                },
            },
            // Quick actions for selected task
            {
                key: 'd',
                description: 'Delete selected task',
                action: () => {
                    if (selectedTaskId && !isSelectionMode) {
                        const task = tasks.find(t => t.id === selectedTaskId);
                        if (task && confirm(`Delete task "${task.title}"?`)) {
                            handleDeleteTask(task.id);
                            setSelectedTaskId(null);
                            setSelectedTaskIndex(-1);
                        }
                    }
                },
            },
        ],
        true
    );


    // Keyboard shortcuts for selection mode
    useEffect(() => {
        if (!isSelectionMode) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            // Ignore if typing in input/textarea
            const target = e.target as HTMLElement;
            if (
                ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) ||
                target.isContentEditable
            ) {
                return;
            }

            // Ctrl/Cmd + A: Select all tasks
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'a') {
                e.preventDefault();
                e.stopPropagation();
                const allIds = new Set(tasks.map(t => t.id));
                setSelectedTaskIds(allIds);
                return;
            }

            // Delete/Backspace: Delete selected tasks
            if ((e.key === 'Delete' || e.key === 'Backspace') && selectedTaskIds.size > 0) {
                e.preventDefault();
                e.stopPropagation();
                handleBulkDelete();
                return;
            }

            // Bulk status change: 1-4 keys for quick status change
            if (selectedTaskIds.size > 0 && ['1', '2', '3', '4'].includes(e.key)) {
                e.preventDefault();
                e.stopPropagation();
                const statusMap: Record<string, string> = {
                    '1': 'Todo',
                    '2': 'In_Progress',
                    '3': 'Blocked',
                    '4': 'Done',
                };
                const newStatus = statusMap[e.key];
                if (newStatus) {
                    handleBulkStatusChange(newStatus);
                }
                return;
            }

            // Escape: Cancel selection mode
            if (e.key === 'Escape') {
                e.preventDefault();
                e.stopPropagation();
                setIsSelectionMode(false);
                setSelectedTaskIds(new Set());
                return;
            }
        };

        window.addEventListener('keydown', handleKeyDown, true); // Use capture phase
        return () => window.removeEventListener('keydown', handleKeyDown, true);
    }, [isSelectionMode, selectedTaskIds, tasks, handleBulkDelete, handleBulkStatusChange]);

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

    // Apply legacy quick filters on top of advanced filters
    const filteredTasks = useMemo(() => {
        let result = filteredAndSortedTasks;

        // Apply legacy quick filters if active
        if (activeFilter === 'high') {
            result = result.filter(t => t.priority === 'high');
        } else if (activeFilter === 'due-soon') {
            const threeDaysFromNow = new Date();
            threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
            result = result.filter(t => {
                if (!t.due_date) return false;
                const dueDate = new Date(t.due_date);
                return dueDate <= threeDaysFromNow && t.status !== 'done';
            });
        }

        return result;
    }, [filteredAndSortedTasks, activeFilter]);

    // Keyboard navigation for tasks (after filteredTasks is defined)
    // Use capture phase to handle before other handlers
    useEffect(() => {
        if (isSelectionMode || isLoading) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            // Ignore if typing in input/textarea
            const target = e.target as HTMLElement;
            if (
                ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) ||
                target.isContentEditable
            ) {
                return;
            }

            // Don't handle if modifiers are pressed (let shortcuts handle those)
            // EXCEPT for Shift+? which should be handled by shortcuts
            if (e.ctrlKey || e.metaKey || e.altKey) {
                return;
            }
            
            // Allow Shift only for Shift+? combination
            if (e.shiftKey && e.key !== '?' && e.key !== '/') {
                return;
            }

            // Only handle navigation keys
            const navigationKeys = ['ArrowDown', 'ArrowUp', 'Home', 'End', 'Enter'];
            if (!navigationKeys.includes(e.key)) {
                return;
            }

            if (filteredTasks.length === 0) return;

            switch (e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    e.stopPropagation();
                    setSelectedTaskIndex(prev => {
                        const next = prev + 1;
                        if (next >= filteredTasks.length) return 0; // Loop
                        return next;
                    });
                    break;

                case 'ArrowUp':
                    e.preventDefault();
                    e.stopPropagation();
                    setSelectedTaskIndex(prev => {
                        const next = prev - 1;
                        if (next < 0) return filteredTasks.length - 1; // Loop
                        return next;
                    });
                    break;

                case 'Home':
                    e.preventDefault();
                    e.stopPropagation();
                    setSelectedTaskIndex(0);
                    break;

                case 'End':
                    e.preventDefault();
                    e.stopPropagation();
                    setSelectedTaskIndex(filteredTasks.length - 1);
                    break;

                case 'Enter':
                    if (selectedTaskIndex >= 0 && selectedTaskIndex < filteredTasks.length) {
                        e.preventDefault();
                        e.stopPropagation();
                        const task = filteredTasks[selectedTaskIndex];
                        openDetailsModal(task);
                    }
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown, true); // Use capture phase
        return () => window.removeEventListener('keydown', handleKeyDown, true);
    }, [filteredTasks, isSelectionMode, isLoading, selectedTaskIndex, openDetailsModal]);

    // Update selected task ID when index changes
    useEffect(() => {
        if (selectedTaskIndex >= 0 && selectedTaskIndex < filteredTasks.length) {
            const taskId = filteredTasks[selectedTaskIndex].id;
            setSelectedTaskId(taskId);
            
            // Scroll to selected task
            const taskElement = document.getElementById(`task-item-${taskId}`);
            if (taskElement) {
                taskElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        } else {
            setSelectedTaskId(null);
        }
    }, [selectedTaskIndex, filteredTasks]);

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

    const toggleTaskSelection = (taskId: string) => {
        const newSet = new Set(selectedTaskIds);
        if (newSet.has(taskId)) {
            newSet.delete(taskId);
        } else {
            newSet.add(taskId);
        }
        setSelectedTaskIds(newSet);
    };

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
                        <h1 className="text-2xl lg:text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">Tasks</h1>
                        <p className="text-xs text-zinc-600 dark:text-zinc-500 mt-0.5">{stats.total} tasks • {stats.completionRate}% complete</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {isSelectionMode ? (
                        <>
                            <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400 mr-2 uppercase tracking-wider">
                                {selectedTaskIds.size} Selected
                            </span>
                            {selectedTaskIds.size > 0 && (
                                <>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleBulkStatusChange('Todo')}
                                            className="bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-blue-400 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-colors uppercase tracking-wider"
                                            title="Set to Todo (1)"
                                        >
                                            Todo
                                        </button>
                                        <button
                                            onClick={() => handleBulkStatusChange('In_Progress')}
                                            className="bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-400 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-colors uppercase tracking-wider"
                                            title="Set to In Progress (2)"
                                        >
                                            In Progress
                                        </button>
                                        <button
                                            onClick={() => handleBulkStatusChange('Done')}
                                            className="bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-colors uppercase tracking-wider"
                                            title="Set to Done (4)"
                                        >
                                            Done
                                        </button>
                                    </div>
                                    <button
                                        onClick={handleBulkDelete}
                                        className="bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 px-4 py-2 rounded-lg text-[10px] font-bold transition-colors flex items-center gap-2 uppercase tracking-wider"
                                    >
                                        <Trash2 size={14} />
                                        Delete Selected
                                    </button>
                                </>
                            )}
                            <button
                                onClick={() => {
                                    setIsSelectionMode(false);
                                    setSelectedTaskIds(new Set());
                                }}
                                className="bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 border border-zinc-300 dark:border-white/10 text-zinc-700 dark:text-zinc-300 px-4 py-2 rounded-lg text-[10px] font-bold transition-colors uppercase tracking-wider"
                            >
                                Cancel
                            </button>
                        </>
                    ) : (
                        <>
                            {/* ✅ NEW: Saved Views */}
                            <SavedViewsDropdown
                                projectId={activeProjectId}
                                currentFilters={{ 
                                    status: activeFilter !== 'all' ? [activeFilter] : undefined 
                                }}
                                onApplyFilters={(filters) => {
                                    // Apply saved view filters
                                    if (filters.status && Array.isArray(filters.status) && filters.status.length > 0) {
                                        // Handle status filter - apply first status from array
                                        const firstStatus = filters.status[0];
                                        if (['all', 'high', 'due-soon'].includes(firstStatus)) {
                                            setActiveFilter(firstStatus as 'all' | 'high' | 'due-soon');
                                        }
                                    }
                                }}
                            />
                            
                            {/* ✅ NEW: Export/Import */}
                            <ExportImportButtons
                                projectId={activeProjectId}
                                onImportComplete={() => {
                                    if (activeProjectId) {
                                        getTasksByProject(activeProjectId).then(setTasks);
                                    }
                                }}
                            />
                            
                            {/* ✅ NEW: Templates Button */}
                            <button
                                onClick={() => setShowTemplateModal(true)}
                                className="bg-zinc-100 dark:bg-white/[0.03] hover:bg-zinc-200 dark:hover:bg-white/[0.08] border border-zinc-300 dark:border-white/10 text-zinc-600 dark:text-zinc-400 px-4 py-2 rounded-lg text-[10px] font-bold transition-all flex items-center gap-2 uppercase tracking-wider"
                                title="Task Templates"
                            >
                                <FileText size={14} />
                                Templates
                            </button>
                            
                            {/* ✅ NEW: Keyboard Shortcuts */}
                            <button
                                onClick={() => setShowShortcutsModal(true)}
                                className="bg-zinc-100 dark:bg-white/[0.03] hover:bg-zinc-200 dark:hover:bg-white/[0.08] border border-zinc-300 dark:border-white/10 text-zinc-600 dark:text-zinc-400 px-4 py-2 rounded-lg text-[10px] font-bold transition-all flex items-center gap-2 uppercase tracking-wider"
                                title="Keyboard Shortcuts"
                            >
                                <Keyboard size={14} />
                                Shortcuts
                            </button>
                            
                            <button
                                onClick={() => setIsSelectionMode(true)}
                                className="bg-zinc-100 dark:bg-white/[0.03] hover:bg-zinc-200 dark:hover:bg-white/[0.08] border border-zinc-300 dark:border-white/10 text-zinc-600 dark:text-zinc-400 px-4 py-2 rounded-lg text-[10px] font-bold transition-all flex items-center gap-2 uppercase tracking-wider group hover:text-zinc-900 dark:hover:text-white"
                            >
                                <CheckSquare size={14} />
                                Select
                            </button>
                            <button
                                onClick={() => openCreateModal()}
                                className="bg-blue-600 dark:bg-white/[0.03] hover:bg-blue-500 dark:hover:bg-white/[0.08] border border-blue-500 dark:border-white/10 text-white dark:text-white px-5 py-2.5 rounded-lg text-[10px] font-bold transition-all hover:-translate-y-0.5 flex items-center gap-2.5 uppercase tracking-wider group"
                            >
                                <span>Create Task</span>
                                <span className="px-1.5 py-0.5 bg-indigo-500/20 rounded text-[9px] text-indigo-400 border border-indigo-500/30 group-hover:bg-indigo-500 group-hover:text-white transition-all">C</span>
                            </button>
                        </>
                    )}
                </div>
            </header>

            {/* Quick Stats Bar */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6 shrink-0">
                <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/10">
                    <div className="flex items-center gap-2 mb-1">
                        <LayoutList size={14} className="text-blue-400" />
                        <span className="text-[9px] text-zinc-600 dark:text-zinc-500 uppercase font-bold">To Do</span>
                    </div>
                    <p className="text-2xl font-bold text-blue-400">{stats.todo}</p>
                </div>

                <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/10">
                    <div className="flex items-center gap-2 mb-1">
                        <Activity size={14} className="text-amber-400" />
                        <span className="text-[9px] text-zinc-600 dark:text-zinc-500 uppercase font-bold">In Progress</span>
                    </div>
                    <p className="text-2xl font-bold text-amber-400">{stats.inProgress}</p>
                </div>

                <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                    <div className="flex items-center gap-2 mb-1">
                        <CheckCircle2 size={14} className="text-emerald-400" />
                        <span className="text-[9px] text-zinc-600 dark:text-zinc-500 uppercase font-bold">Done</span>
                    </div>
                    <p className="text-2xl font-bold text-emerald-400">{stats.done}</p>
                </div>

                <div className="p-3 rounded-lg bg-rose-500/5 border border-rose-500/10">
                    <div className="flex items-center gap-2 mb-1">
                        <AlertCircle size={14} className="text-rose-400" />
                        <span className="text-[9px] text-zinc-600 dark:text-zinc-500 uppercase font-bold">Blocked</span>
                    </div>
                    <p className="text-2xl font-bold text-rose-400">{stats.blocked}</p>
                </div>
            </div>

            {/* ✅ NEW: Advanced Filter Panel */}
            {showFilterPanel && (
                <FilterPanel
                    filters={filters}
                    sort={sort}
                    onFiltersChange={updateFilters}
                    onSortChange={updateSort}
                    onClose={() => setShowFilterPanel(false)}
                />
            )}

            {/* Filter & Grouping Bar */}
            <div className="flex items-center gap-4 mb-4 shrink-0 flex-wrap">
                {/* Quick Filters */}
                <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-500">
                        <Filter size={14} />
                        <span className="font-bold uppercase tracking-wider">Quick Filters:</span>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        {/* Preset Filters */}
                        {DEFAULT_PRESETS.slice(0, 4).map((preset) => (
                            <button
                                key={preset.id}
                                onClick={() => {
                                    updateFilters(preset.filters);
                                    if (preset.sort) {
                                        updateSort(preset.sort);
                                    }
                                    setActiveFilter('all'); // Reset legacy filter
                                }}
                                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                                    JSON.stringify(filters) === JSON.stringify(preset.filters)
                                        ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                                        : 'bg-zinc-100 dark:bg-white/[0.03] text-zinc-600 dark:text-zinc-500 border border-zinc-300 dark:border-white/5 hover:border-zinc-400 dark:hover:border-white/10'
                                }`}
                            >
                                {preset.icon && <Sparkles size={12} />}
                                {preset.name}
                            </button>
                        ))}
                        <button
                            onClick={() => setShowFilterPanel(!showFilterPanel)}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                                showFilterPanel
                                    ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                                    : 'bg-zinc-100 dark:bg-white/[0.03] text-zinc-600 dark:text-zinc-500 border border-zinc-300 dark:border-white/5 hover:border-zinc-400 dark:hover:border-white/10'
                            }`}
                        >
                            <Filter size={12} />
                            Advanced
                        </button>
                    </div>
                </div>

                {/* Grouping Selector */}
                <GroupingSelector
                    groupBy={groupBy}
                    onGroupByChange={setGroupBy}
                />

                {(activeFilter !== 'all' || Object.keys(filters).length > 0) && (
                    <span className="text-xs text-zinc-600 dark:text-zinc-400">
                        ({filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'})
                    </span>
                )}
            </div>

            <div className="flex-1 overflow-hidden min-h-0 bg-transparent rounded-xl">
                {isLoading ? (
                    <div className="h-full w-full overflow-hidden p-2">
                        <div className="grid grid-cols-2 gap-6 w-full h-full" style={{ gridTemplateRows: '1fr 1fr' }}>
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="min-h-0 h-full flex flex-col">
                                    <KanbanColumnSkeleton />
                                </div>
                            ))}
                        </div>
                    </div>
                ) : tasks.length === 0 ? (
                    <EmptyState
                        icon={CheckSquare}
                        title="No tasks yet"
                        description="Get started by creating your first task for this project."
                        action={{
                            label: "Create Task",
                            onClick: () => openCreateModal()
                        }}
                        className="h-full bg-zinc-50 dark:bg-black/10 backdrop-blur-sm border-zinc-300 dark:border-white/5"
                    />
                ) : groupBy === 'none' ? (
                    <KanbanBoard
                        tasks={filteredTasks}
                        onTaskUpdate={onTaskUpdateOptimistic}
                        onTaskDelete={handleDeleteTask}
                        onTaskClick={openDetailsModal}
                        isSelectionMode={isSelectionMode}
                        selectedTaskIds={selectedTaskIds}
                        onToggleTaskSelection={toggleTaskSelection}
                        keyboardSelectedTaskId={selectedTaskId}
                    />
                ) : (
                    // ✅ NEW: Grouped view
                    <div className="h-full overflow-y-auto">
                        <div className="space-y-6 pb-4">
                            {taskGroups.map((group) => (
                                <div key={group.id} className="bg-zinc-50 dark:bg-zinc-900/30 rounded-xl p-4 border border-zinc-200 dark:border-white/10">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider">
                                            {group.label}
                                        </h3>
                                        <span className="text-xs text-zinc-600 dark:text-zinc-400 font-medium">
                                            {group.tasks.length} {group.tasks.length === 1 ? 'task' : 'tasks'}
                                        </span>
                                    </div>
                                    <KanbanBoard
                                        tasks={group.tasks}
                                        onTaskUpdate={onTaskUpdateOptimistic}
                                        onTaskDelete={handleDeleteTask}
                                        onTaskClick={openDetailsModal}
                                        isSelectionMode={isSelectionMode}
                                        selectedTaskIds={selectedTaskIds}
                                        onToggleTaskSelection={toggleTaskSelection}
                                        keyboardSelectedTaskId={selectedTaskId}
                                    />
                                </div>
                            ))}
                            {taskGroups.length === 0 && (
                                <EmptyState
                                    icon={CheckSquare}
                                    title="No tasks match filters"
                                    description="Try adjusting your filters or grouping options."
                                    className="h-64 bg-zinc-50 dark:bg-black/10 backdrop-blur-sm border-zinc-300 dark:border-white/5"
                                />
                            )}
                        </div>
                    </div>
                )}
            </div>
            
            {/* ✅ NEW: Task Template Modal */}
            <TaskTemplateModal
                isOpen={showTemplateModal}
                onClose={() => setShowTemplateModal(false)}
                projectId={activeProjectId}
                onSuccess={() => {
                    // Refresh tasks if needed
                    if (activeProjectId) {
                        getTasksByProject(activeProjectId).then(setTasks);
                    }
                }}
            />
            
            {/* ✅ NEW: Keyboard Shortcuts Modal */}
            <KeyboardShortcutsModal
                isOpen={showShortcutsModal}
                onClose={() => setShowShortcutsModal(false)}
            />
            
            {/* ✅ NEW: Global Search */}
            <GlobalSearch
                isOpen={showGlobalSearch}
                onClose={() => setShowGlobalSearch(false)}
            />
        </div>
    );
}
