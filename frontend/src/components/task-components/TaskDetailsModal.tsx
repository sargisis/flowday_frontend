import { useState, useEffect, useRef, useMemo, lazy, Suspense } from "react";
import { X, Calendar, Trash2, Sparkles, Edit3, Eye, CheckSquare, Square, Copy, Paperclip, Image as ImageIcon, File, Upload, Clock, Undo2, Redo2, List, Network, Hash } from "lucide-react";
import { useUndoRedo } from "../../hooks/useUndoRedo";
import { useAutoSave } from "../../hooks/useAutoSave";
import TagInput from "../tags/TagInput";
import type { Tag } from "../../types/tags";

// Lazy load ReactMarkdown (heavy library)
const ReactMarkdown = lazy(() => import("react-markdown"));
import type { Task, Attachment } from "../../api/tasks";
import { duplicateTask, uploadTaskAttachment, getTaskAttachments, deleteTaskAttachment, getTasksByProject } from "../../api/tasks";
import { useTasks } from "../../context/TaskContext";
import { useProject } from "../../context/ProjectContext";
import TaskComments from "./TaskComments";
import TimeTracker from "../time-tracking/TimeTracker";
import TaskDependencies from "../task-dependencies/TaskDependencies";
import { DependencyGraph } from "../task-dependencies/DependencyGraph";
import { getTaskDependencies, getBatchTaskDependencies, type TaskDependency } from "../../api/taskDependencies";
import MentionAutocomplete from "../mentions/MentionAutocomplete";
import SubtasksList from "../subtasks/SubtasksList";

interface TaskDetailsModalProps {
    task: Task | null;
    isOpen: boolean;
    onClose: () => void;
    onUpdate: (taskId: string, updates: Partial<Task>) => Promise<void>;
    onDelete: (taskId: string) => Promise<void>;
}

import { toast } from "sonner";

export default function TaskDetailsModal({ task, isOpen, onClose, onUpdate, onDelete }: TaskDetailsModalProps) {
    const { handleEnrichTask, handleDecomposeTask } = useTasks();
    const { activeProjectId } = useProject();
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [subtasks, setSubtasks] = useState<{ id: string; title: string; completed: boolean }[]>([]);
    const [status, setStatus] = useState("");
    const [priority, setPriority] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [tags, setTags] = useState<Tag[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [isEnriching, setIsEnriching] = useState(false);
    const [isDecomposing, setIsDecomposing] = useState(false);
    const [isPreview, setIsPreview] = useState(false);
    const [attachments, setAttachments] = useState<Attachment[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [allTasks, setAllTasks] = useState<Task[]>([]);
    const [dependenciesMap, setDependenciesMap] = useState<Map<string, TaskDependency>>(new Map());
    const [dependencyViewMode, setDependencyViewMode] = useState<'list' | 'graph'>('list');
    const [isLoadingDependencies, setIsLoadingDependencies] = useState(false);
    const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Undo/Redo functionality
    const taskData = useMemo(() => ({ title, description, subtasks, status, priority, dueDate }), [title, description, subtasks, status, priority, dueDate]);
    const isUpdatingFromUndoRedo = useRef(false);
    const { current: undoRedoData, setValue: setUndoRedoValue, undo, redo, canUndo, canRedo, reset: resetUndoRedo } = useUndoRedo({
        initialValue: taskData,
    });

    // Sync undo/redo state with form state (only when undo/redo is triggered)
    useEffect(() => {
        if (isUpdatingFromUndoRedo.current && undoRedoData) {
            // Only update if values actually changed to prevent unnecessary re-renders
            if (title !== undoRedoData.title) setTitle(undoRedoData.title);
            if (description !== undoRedoData.description) setDescription(undoRedoData.description);
            if (JSON.stringify(subtasks) !== JSON.stringify(undoRedoData.subtasks)) setSubtasks(undoRedoData.subtasks);
            if (status !== undoRedoData.status) setStatus(undoRedoData.status);
            if (priority !== undoRedoData.priority) setPriority(undoRedoData.priority);
            if (dueDate !== undoRedoData.dueDate) setDueDate(undoRedoData.dueDate);
            isUpdatingFromUndoRedo.current = false;
        }
    }, [undoRedoData, title, description, subtasks, status, priority, dueDate]);

    // Update undo/redo history when form changes (but not from undo/redo)
    const prevTaskDataRef = useRef(taskData);
    useEffect(() => {
        if (!isUpdatingFromUndoRedo.current) {
            // Only update if data actually changed
            const hasChanged =
                prevTaskDataRef.current.title !== taskData.title ||
                prevTaskDataRef.current.description !== taskData.description ||
                JSON.stringify(prevTaskDataRef.current.subtasks) !== JSON.stringify(taskData.subtasks) ||
                prevTaskDataRef.current.status !== taskData.status ||
                prevTaskDataRef.current.priority !== taskData.priority ||
                prevTaskDataRef.current.dueDate !== taskData.dueDate;

            if (hasChanged) {
                prevTaskDataRef.current = taskData;
                setUndoRedoValue(taskData, true);
            }
        }
    }, [taskData, setUndoRedoValue]);

    // Auto-save draft & sync to backend
    const { isSaving: isAutoSaving, lastSaved } = useAutoSave({
        data: taskData,
        onSave: async (data) => {
            // Sync to backend
            if (!task) return;
            await onUpdate(task.id, {
                title: data.title,
                description: data.description,
                subtasks: data.subtasks,
                status: data.status,
                priority: data.priority,
                due_date: data.dueDate,
            });
        },
        storageKey: task ? `task-draft-${task.id}` : undefined,
        delay: 2000,
        enabled: isOpen && task !== null,
    });

    // Wrapped undo/redo to set flag
    const handleUndo = () => {
        isUpdatingFromUndoRedo.current = true;
        undo();
    };

    const handleRedo = () => {
        isUpdatingFromUndoRedo.current = true;
        redo();
    };

    // Keyboard shortcuts for undo/redo
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            const isMod = e.metaKey || e.ctrlKey;

            // Don't trigger if typing in input/textarea
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
                if (!isMod) return;
            }

            if (isMod && e.key === 'z' && !e.shiftKey) {
                e.preventDefault();
                handleUndo();
            } else if (isMod && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
                e.preventDefault();
                handleRedo();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen]);

    useEffect(() => {
        if (task && isOpen) {
            const initialData = {
                title: task.title || "",
                description: task.description || "",
                subtasks: task.subtasks || [],
                status: task.status || "Todo",
                priority: task.priority || "medium",
                dueDate: task.due_date ? new Date(task.due_date).toISOString().split('T')[0] : "",
            };

            setTitle(initialData.title);
            setDescription(initialData.description);
            setSubtasks(initialData.subtasks);
            setStatus(initialData.status);
            setPriority(initialData.priority);
            setDueDate(initialData.dueDate);
            setTags((task.tags || []).map(t => ({
                id: t.id,
                name: t.name,
                color: t.color || 'blue',
            })));

            // Reset undo/redo history with initial data
            resetUndoRedo(initialData);

            // Load attachments
            loadAttachments();
            // Load all tasks for dependencies
            if (activeProjectId) {
                getTasksByProject(activeProjectId).then(setAllTasks).catch(console.error);
                loadAllDependencies(activeProjectId);
            }
        }
    }, [task, isOpen, activeProjectId, resetUndoRedo]);

    const loadAllDependencies = async (projectId: string) => {
        setIsLoadingDependencies(true);
        try {
            const tasks = await getTasksByProject(projectId);

            if (tasks.length === 0) {
                setDependenciesMap(new Map());
                return;
            }

            // Use batch endpoint to load all dependencies in one request
            const taskIds = tasks.map(t => t.id);
            const batchDeps = await getBatchTaskDependencies(taskIds);

            const depsMap = new Map<string, TaskDependency>();
            for (const [taskId, deps] of Object.entries(batchDeps)) {
                depsMap.set(taskId, deps as TaskDependency);
            }

            setDependenciesMap(depsMap);
        } catch (error) {
            console.error('Failed to load dependencies:', error);
            // Fallback to individual requests if batch fails
            try {
                const tasks = await getTasksByProject(projectId);
                const depsMap = new Map<string, TaskDependency>();
                await Promise.all(
                    tasks.map(async (t) => {
                        try {
                            const deps = await getTaskDependencies(t.id);
                            depsMap.set(t.id, deps);
                        } catch (err) {
                            console.warn(`Failed to load dependencies for task ${t.id}:`, err);
                        }
                    })
                );
                setDependenciesMap(depsMap);
            } catch (fallbackError) {
                console.error('Fallback dependency loading also failed:', fallbackError);
            }
        } finally {
            setIsLoadingDependencies(false);
        }
    };

    const handleDependencyUpdate = async () => {
        // Refresh tasks list and dependencies
        if (activeProjectId) {
            const tasks = await getTasksByProject(activeProjectId);
            setAllTasks(tasks);
            await loadAllDependencies(activeProjectId);
        }
    };

    const handleTaskClickInGraph = (taskId: string) => {
        setSelectedTaskId(taskId);
    };

    const loadAttachments = async () => {
        if (!task) return;
        try {
            const atts = await getTaskAttachments(task.id);
            setAttachments(atts);
        } catch (error) {
            console.error("Failed to load attachments", error);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !task) return;

        // ✅ ENHANCED: Client-side validation
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            toast.error(`File size exceeds maximum allowed size (10MB). Current size: ${(file.size / (1024 * 1024)).toFixed(2)} MB`);
            if (fileInputRef.current) fileInputRef.current.value = "";
            return;
        }

        if (file.size < 1) {
            toast.error("File is empty or too small");
            if (fileInputRef.current) fileInputRef.current.value = "";
            return;
        }

        setIsUploading(true);
        try {
            const attachment = await uploadTaskAttachment(task.id, file);
            setAttachments([...attachments, attachment]);
            toast.success("File uploaded successfully");
        } catch (error: any) {
            console.error("Failed to upload file", error);
            // ✅ ENHANCED: Handle structured errors from backend
            const errorData = error?.response?.data?.error;
            if (errorData && typeof errorData === 'object') {
                // Structured error with code and message
                toast.error(errorData.message || "Failed to upload file");
            } else {
                // Fallback to simple error message
                const errorMessage = errorData || error?.message || "Failed to upload file";
                toast.error(errorMessage);
            }
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const handleDeleteAttachment = async (attachmentId: string) => {
        if (!task || !confirm("Are you sure you want to delete this attachment?")) return;
        try {
            await deleteTaskAttachment(task.id, attachmentId);
            setAttachments(attachments.filter(att => att.id !== attachmentId));
            toast.success("Attachment deleted");
        } catch (error) {
            console.error("Failed to delete attachment", error);
            toast.error("Failed to delete attachment");
        }
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return bytes + " B";
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
        return (bytes / (1024 * 1024)).toFixed(1) + " MB";
    };

    if (!isOpen || !task) return null;

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await onUpdate(task.id, {
                title,
                description,
                subtasks,
                status,
                priority,
                due_date: dueDate ? new Date(dueDate).toISOString() : null,
                tags: tags.map(t => ({ id: t.id, name: t.name, color: t.color })),
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
            const result = await handleEnrichTask(task.id);
            if (typeof result === 'object' && 'description' in result) {
                setDescription(result.description);
                if (result.subtasks) {
                    setSubtasks(result.subtasks);
                }
                toast.success("Magic Plan generated!");
            } else if (typeof result === 'string') {
                // Fallback
                setDescription(result);
                toast.success("Description generated!");
            }
        } catch (error) {
            console.error("AI Enrichment failed", error);
            toast.error("AI Enrichment failed. Check backend logs.");
        } finally {
            setIsEnriching(false);
        }
    };

    const handleDecompose = async () => {
        if (!task) return;
        setIsDecomposing(true);
        try {
            await handleDecomposeTask(task.id);
            toast.success("Task successfully decomposed into separate cards!");
            onClose(); // Close modal to see the new tasks on the board
        } catch (error) {
            console.error("AI Decomposition failed", error);
            toast.error("AI Decomposition failed. Check backend logs.");
        } finally {
            setIsDecomposing(false);
        }
    };

    const toggleSubtask = (index: number) => {
        const newSubtasks = [...subtasks];
        newSubtasks[index].completed = !newSubtasks[index].completed;
        setSubtasks(newSubtasks);
    };

    const handleDuplicate = async () => {
        if (!task) return;
        try {
            await duplicateTask(task);
            toast.success("Task duplicated!");
            onClose();
            // Trigger refresh - the refreshTrigger will cause components to reload
            window.dispatchEvent(new CustomEvent('task-updated'));
        } catch (error) {
            console.error("Failed to duplicate task", error);
            toast.error("Failed to duplicate task");
        }
    };

    const calculateProgress = () => {
        if (subtasks.length === 0) return 0;
        const completed = subtasks.filter(s => s.completed).length;
        return Math.round((completed / subtasks.length) * 100);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-md p-0 sm:p-4">
            <div className={`
                w-full h-full sm:h-auto bg-gradient-to-br from-white via-white to-zinc-50 dark:from-zinc-900/98 dark:via-zinc-900/95 dark:to-zinc-950/98 border-0 sm:border border-zinc-200/80 dark:border-zinc-700/50 rounded-none sm:rounded-3xl shadow-2xl overflow-hidden backdrop-blur-2xl ring-0 sm:ring-1 ring-white/5 dark:ring-white/10 flex flex-col sm:block transition-all duration-500
                ${dependencyViewMode === 'graph' ? 'sm:max-w-6xl' : 'sm:max-w-3xl'}
            `}>
                {/* Header */}
                <div className="flex justify-between items-center px-4 sm:px-6 py-3 sm:py-4 border-b border-zinc-200/60 dark:border-zinc-800/40 bg-gradient-to-r from-zinc-50/80 to-transparent dark:from-zinc-900/40 dark:to-transparent backdrop-blur-sm shrink-0">
                    <div className="flex items-center gap-3">
                        <h2 className="text-lg sm:text-xl font-semibold text-zinc-900 dark:text-white">Task Details</h2>
                        {isAutoSaving && (
                            <span className="text-xs text-zinc-500 animate-pulse flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                                Saving...
                            </span>
                        )}
                        {!isAutoSaving && lastSaved && (
                            <span className="text-xs text-zinc-400 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500/50"></span>
                                Saved
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-1">
                        {/* Undo/Redo buttons */}
                        <div className="flex items-center gap-1 mr-2 border-r border-zinc-300 dark:border-zinc-700 pr-2">
                            <button
                                onClick={handleUndo}
                                disabled={!canUndo}
                                className="p-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                title="Undo (Ctrl+Z)"
                            >
                                <Undo2 size={18} />
                            </button>
                            <button
                                onClick={handleRedo}
                                disabled={!canRedo}
                                className="p-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                title="Redo (Ctrl+Y)"
                            >
                                <Redo2 size={18} />
                            </button>
                        </div>
                        <button
                            onClick={handleDuplicate}
                            className="p-2.5 text-zinc-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-500/10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
                            title="Duplicate Task"
                        >
                            <Copy size={18} strokeWidth={2.5} />
                        </button>
                        <button
                            onClick={handleDelete}
                            className="p-2.5 text-zinc-600 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
                            title="Delete Task"
                        >
                            <Trash2 size={18} strokeWidth={2.5} />
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2.5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100/80 dark:hover:bg-zinc-800/60 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
                        >
                            <X size={18} strokeWidth={2.5} />
                        </button>
                    </div>
                </div>

                <div className={`p-6 transition-all ${dependencyViewMode === 'graph' ? 'h-[85vh] overflow-hidden' : 'max-h-[70vh] overflow-y-auto'}`}>
                    <div className={`grid grid-cols-1 ${dependencyViewMode === 'graph' ? 'md:grid-cols-4' : 'md:grid-cols-3'} gap-6 h-full`}>
                        {/* Main Content */}
                        <div className={`${dependencyViewMode === 'graph' ? 'md:col-span-3' : 'md:col-span-2'} space-y-5 h-full`}>
                            <div>
                                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-2 uppercase tracking-wide">
                                    Title
                                </label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-300 dark:border-zinc-700/50 rounded-lg px-4 py-3 text-zinc-900 dark:text-white placeholder-zinc-500 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-base font-medium transition-all"
                                    placeholder="Enter task title..."
                                />
                            </div>

                            {/* Subtasks / Magic Checklist Section */}
                            {subtasks.length > 0 && dependencyViewMode !== 'graph' && (
                                <div className="bg-zinc-50 dark:bg-zinc-800/30 rounded-xl p-4 border border-zinc-200 dark:border-zinc-700/50">
                                    <div className="flex items-center justify-between mb-3">
                                        <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wide">
                                            Checklist
                                        </label>
                                        <span className="text-xs font-medium text-blue-400 bg-blue-500/10 px-2 py-1 rounded-full">
                                            {calculateProgress()}% Done
                                        </span>
                                    </div>
                                    <div className="space-y-2">
                                        {subtasks.map((subtask, index) => (
                                            <div
                                                key={subtask.id || index}
                                                onClick={() => toggleSubtask(index)}
                                                className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${subtask.completed
                                                    ? "bg-green-500/10 border-green-500/30"
                                                    : "bg-white dark:bg-zinc-800/50 border-zinc-300 dark:border-zinc-700/50 hover:bg-zinc-100 dark:hover:bg-zinc-800/70 hover:border-zinc-400 dark:hover:border-zinc-600/50"
                                                    }`}
                                            >
                                                <div className={`mt-0.5 transition-colors ${subtask.completed ? "text-green-600 dark:text-green-400" : "text-zinc-500 dark:text-zinc-500"}`}>
                                                    {subtask.completed ? <CheckSquare size={16} /> : <Square size={16} />}
                                                </div>
                                                <span className={`text-sm flex-1 ${subtask.completed ? "text-zinc-500 dark:text-zinc-500 line-through" : "text-zinc-900 dark:text-zinc-200"}`}>
                                                    {subtask.title}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {dependencyViewMode !== 'graph' && (
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wide">
                                            Description
                                        </label>
                                        <button
                                            onClick={() => setIsPreview(!isPreview)}
                                            className="text-xs text-zinc-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-blue-500/10 transition-colors"
                                        >
                                            {isPreview ? <Edit3 size={12} /> : <Eye size={12} />}
                                            {isPreview ? "Edit" : "Preview"}
                                        </button>
                                    </div>

                                    <div className="min-h-[140px] bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-300 dark:border-zinc-700/50 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500/50 focus-within:border-blue-500/50 transition-all">
                                        {isPreview ? (
                                            <div className="p-4 text-sm text-zinc-900 dark:text-zinc-200 leading-relaxed overflow-y-auto max-h-[300px] prose dark:prose-invert prose-sm max-w-none">
                                                <Suspense fallback={<div className="text-zinc-500 italic">Loading markdown...</div>}>
                                                    <ReactMarkdown>{description || "*No description yet.*"}</ReactMarkdown>
                                                </Suspense>
                                            </div>
                                        ) : (
                                            <MentionAutocomplete
                                                value={description}
                                                onChange={setDescription}
                                                projectId={activeProjectId || undefined}
                                                placeholder="Add more details about this task... (Type @ to mention someone)"
                                                className="w-full bg-transparent p-4 text-zinc-900 dark:text-zinc-200 placeholder-zinc-500 dark:placeholder-zinc-600 focus:outline-none resize-none text-sm leading-relaxed"
                                                rows={6}
                                            />
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Attachments Section */}
                            {dependencyViewMode !== 'graph' && (
                                <div className="border-t border-zinc-200 dark:border-zinc-800/50 pt-5">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <Paperclip size={16} className="text-zinc-600 dark:text-zinc-400" />
                                            <h3 className="text-sm font-semibold text-zinc-900 dark:text-white uppercase tracking-wide">Attachments</h3>
                                            {attachments.length > 0 && (
                                                <span className="text-xs text-zinc-600 dark:text-zinc-500 bg-zinc-200 dark:bg-zinc-800 px-2 py-0.5 rounded-full">
                                                    {attachments.length}
                                                </span>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={isUploading}
                                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 rounded-lg border border-blue-500/20 hover:border-blue-500/30 disabled:opacity-50 transition-all"
                                        >
                                            {isUploading ? (
                                                <>
                                                    <div className="w-3 h-3 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" />
                                                    <span>Uploading...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Upload size={12} />
                                                    Upload
                                                </>
                                            )}
                                        </button>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            onChange={handleFileUpload}
                                            className="hidden"
                                            accept="image/*,.pdf,.doc,.docx,.txt,.zip"
                                        />
                                    </div>

                                    {attachments.length > 0 ? (
                                        <div className="space-y-2">
                                            {attachments.map((attachment) => (
                                                <div
                                                    key={attachment.id}
                                                    className="group flex items-center gap-3 p-3 bg-white dark:bg-zinc-800/50 border border-zinc-300 dark:border-zinc-700/50 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800/70 hover:border-zinc-400 dark:hover:border-zinc-600/50 transition-all"
                                                >
                                                    <div className={`flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-lg ${attachment.type === "image" ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400' : 'bg-zinc-200 dark:bg-zinc-700/50 text-zinc-600 dark:text-zinc-400'}`}>
                                                        {attachment.type === "image" ? (
                                                            <ImageIcon size={16} />
                                                        ) : (
                                                            <File size={16} />
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <a
                                                            href={attachment.url.startsWith('http') ? attachment.url : (() => {
                                                                const envUrl = import.meta.env.VITE_FILE_UPLOAD_BASE_URL;
                                                                if (envUrl) return `${envUrl}${attachment.url}`;
                                                                const hostname = window.location.hostname;
                                                                const baseUrl = (hostname !== 'localhost' && hostname !== '127.0.0.1')
                                                                    ? `http://${hostname}:8080`
                                                                    : 'http://localhost:8080';
                                                                return `${baseUrl}${attachment.url}`;
                                                            })()}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="block text-sm font-medium text-zinc-900 dark:text-zinc-200 hover:text-blue-600 dark:hover:text-blue-400 truncate transition-colors"
                                                        >
                                                            {attachment.filename}
                                                        </a>
                                                        <div className="flex items-center gap-1.5 mt-1">
                                                            <span className="text-xs text-zinc-500 dark:text-zinc-500">{formatFileSize(attachment.size)}</span>
                                                            <span className="text-zinc-400 dark:text-zinc-600">·</span>
                                                            <span className="text-xs text-zinc-500 dark:text-zinc-500">{new Date(attachment.uploaded_at).toLocaleDateString()}</span>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => handleDeleteAttachment(attachment.id)}
                                                        className="p-1.5 text-zinc-500 dark:text-zinc-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                                        title="Delete attachment"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-zinc-500 dark:text-zinc-500 text-sm bg-zinc-50 dark:bg-zinc-800/30 rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700/50">
                                            No attachments yet
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Subtasks Section */}
                            {dependencyViewMode !== 'graph' && (
                                <div className="border-t border-zinc-200 dark:border-zinc-800/50 pt-5">
                                    <div className="flex items-center gap-2 mb-4">
                                        <CheckSquare size={16} className="text-zinc-600 dark:text-zinc-400" />
                                        <h3 className="text-sm font-semibold text-zinc-900 dark:text-white uppercase tracking-wide">Subtasks</h3>
                                    </div>
                                    <SubtasksList
                                        subtasks={subtasks}
                                        onUpdate={setSubtasks}
                                    />
                                </div>
                            )}

                            {/* Time Tracking Section */}
                            {dependencyViewMode !== 'graph' && (
                                <div className="border-t border-zinc-200 dark:border-zinc-800/50 pt-5">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Clock size={16} className="text-zinc-600 dark:text-zinc-400" />
                                        <h3 className="text-sm font-semibold text-zinc-900 dark:text-white uppercase tracking-wide">Time Tracking</h3>
                                    </div>
                                    <TimeTracker taskId={task.id} />
                                </div>
                            )}

                            {/* Task Dependencies Section */}
                            <div className="border-t border-zinc-200 dark:border-zinc-800/50 pt-5">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <Network size={16} className="text-zinc-600 dark:text-zinc-400" />
                                        <h3 className="text-sm font-semibold text-zinc-900 dark:text-white uppercase tracking-wide">Dependencies</h3>
                                    </div>
                                    <div className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800/50 rounded-lg p-1">
                                        <button
                                            onClick={() => setDependencyViewMode('list')}
                                            className={`px-3 py-1.5 text-xs font-medium rounded transition-all flex items-center gap-1.5 ${dependencyViewMode === 'list'
                                                ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm'
                                                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-300'
                                                }`}
                                        >
                                            <List size={14} />
                                            List
                                        </button>
                                        <button
                                            onClick={() => setDependencyViewMode('graph')}
                                            className={`px-3 py-1.5 text-xs font-medium rounded transition-all flex items-center gap-1.5 ${dependencyViewMode === 'graph'
                                                ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm'
                                                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-300'
                                                }`}
                                        >
                                            <Network size={14} />
                                            Graph
                                        </button>
                                    </div>
                                </div>

                                {dependencyViewMode === 'list' ? (
                                    <TaskDependencies
                                        taskId={task.id}
                                        allTasks={allTasks}
                                        onUpdate={handleDependencyUpdate}
                                    />
                                ) : (
                                    <div className="mt-4">
                                        {isLoadingDependencies ? (
                                            <div className="flex items-center justify-center h-64 text-zinc-500">
                                                <div className="flex flex-col items-center gap-2">
                                                    <div className="w-6 h-6 border-2 border-zinc-400/30 border-t-zinc-400 rounded-full animate-spin" />
                                                    <span className="text-sm">Loading dependencies...</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <DependencyGraph
                                                rootTaskId={task.id}
                                                tasks={allTasks}
                                                dependenciesMap={dependenciesMap}
                                                onTaskClick={handleTaskClickInGraph}
                                                selectedTaskId={selectedTaskId}
                                            />
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Comments Section */}
                            {dependencyViewMode !== 'graph' && (
                                <div className="border-t border-zinc-200 dark:border-zinc-800/50 pt-5">
                                    <TaskComments taskId={task.id} />
                                </div>
                            )}

                            {/* AI Plan Section */}
                            {dependencyViewMode !== 'graph' && (
                                <div className="p-5 bg-gradient-to-br from-purple-500/10 via-blue-500/10 to-transparent border border-purple-500/20 rounded-xl">
                                    <div className="flex flex-col gap-4">
                                        <div className="flex items-center gap-2">
                                            <div className="p-1.5 bg-purple-500/20 rounded-lg">
                                                <Sparkles size={16} className="text-purple-400" />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-semibold text-white">AI Assistant</h4>
                                                <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest mt-0.5">Augment your workflow</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <button
                                                onClick={handleEnrich}
                                                disabled={isEnriching || isDecomposing}
                                                className="px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl flex flex-col gap-2 transition-all active:scale-[0.98] group"
                                            >
                                                <div className="flex items-center justify-between w-full">
                                                    <Edit3 size={16} className="text-blue-400" />
                                                    {isEnriching && <div className="w-3 h-3 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" />}
                                                </div>
                                                <div className="text-left">
                                                    <p className="text-xs font-bold text-white uppercase tracking-wider">Magic Plan</p>
                                                    <p className="text-[10px] text-zinc-500 mt-1 leading-relaxed">Fills description & checklist items.</p>
                                                </div>
                                            </button>

                                            <button
                                                onClick={handleDecompose}
                                                disabled={isEnriching || isDecomposing}
                                                className="px-4 py-3 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 rounded-xl flex flex-col gap-2 transition-all active:scale-[0.98] group shadow-[0_10px_30px_rgba(168,85,247,0.1)]"
                                            >
                                                <div className="flex items-center justify-between w-full">
                                                    <Network size={16} className="text-purple-400" />
                                                    {isDecomposing && <div className="w-3 h-3 border-2 border-purple-400/30 border-t-purple-400 rounded-full animate-spin" />}
                                                </div>
                                                <div className="text-left">
                                                    <p className="text-xs font-bold text-white uppercase tracking-wider">Magic Decompose</p>
                                                    <p className="text-[10px] text-zinc-500 mt-1 leading-relaxed">Splits into separate project cards.</p>
                                                </div>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Sidebar info / Graph Inspector */}
                        <div className="space-y-4">
                            {dependencyViewMode === 'graph' ? (
                                <div className="h-full bg-zinc-800/40 rounded-3xl p-6 border border-zinc-700/30 backdrop-blur-3xl flex flex-col gap-6">
                                    {(() => {
                                        const inspectorTask = allTasks.find(t => String(t.id) === String(selectedTaskId || task.id));
                                        if (!inspectorTask) return <div className="text-zinc-500 italic text-sm">Select a task on the graph to view details.</div>;
                                        return (
                                            <>
                                                <div>
                                                    <label className="block text-[10px] font-black text-indigo-400 mb-1.5 uppercase tracking-widest">Selected Task</label>
                                                    <h4 className="text-base font-bold text-white leading-tight">{inspectorTask.title}</h4>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="bg-black/20 rounded-2xl p-3 border border-white/5 text-center">
                                                        <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Status</p>
                                                        <span className="text-xs font-bold text-zinc-200">{inspectorTask.status}</span>
                                                    </div>
                                                    <div className="bg-black/20 rounded-2xl p-3 border border-white/5 text-center">
                                                        <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Priority</p>
                                                        <span className={`text-xs font-bold uppercase ${inspectorTask.priority === 'high' ? 'text-rose-400' : inspectorTask.priority === 'medium' ? 'text-amber-400' : 'text-emerald-400'}`}>
                                                            {inspectorTask.priority}
                                                        </span>
                                                    </div>
                                                </div>
                                                {inspectorTask.description && (
                                                    <div>
                                                        <label className="block text-[10px] font-black text-zinc-500 mb-1.5 uppercase tracking-widest">Description</label>
                                                        <p className="text-[11px] text-zinc-400 line-clamp-6 leading-relaxed bg-black/10 p-3 rounded-xl">
                                                            {inspectorTask.description}
                                                        </p>
                                                    </div>
                                                )}
                                                <div className="mt-auto pt-6 border-t border-white/5">
                                                    <button
                                                        onClick={() => setSelectedTaskId(null)}
                                                        className="w-full py-2.5 text-xs font-bold text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-all"
                                                    >
                                                        Focus Root Task
                                                    </button>
                                                </div>
                                            </>
                                        );
                                    })()}
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {/* Status Card */}
                                    <div className="bg-zinc-800/40 rounded-lg p-4 border border-zinc-700/30">
                                        <label className="block text-[10px] font-bold text-zinc-500 mb-2.5 uppercase tracking-wider">
                                            Status
                                        </label>
                                        <select
                                            value={status}
                                            onChange={(e) => setStatus(e.target.value)}
                                            className="w-full bg-zinc-900/60 border border-zinc-700/40 rounded-md px-3 py-2.5 text-sm font-medium text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 cursor-pointer transition-all appearance-none"
                                        >
                                            <option value="Todo">To Do</option>
                                            <option value="In_Progress">In Progress</option>
                                            <option value="Review">Review</option>
                                            <option value="Blocked">Blocked</option>
                                            <option value="Done">Done</option>
                                        </select>
                                    </div>

                                    {/* Priority Card */}
                                    <div className="bg-zinc-800/40 rounded-lg p-4 border border-zinc-700/30">
                                        <label className="block text-[10px] font-bold text-zinc-500 mb-2.5 uppercase tracking-wider">
                                            Priority
                                        </label>
                                        <div className="flex gap-1.5">
                                            {['low', 'medium', 'high'].map((p) => (
                                                <button
                                                    key={p}
                                                    type="button"
                                                    onClick={() => setPriority(p)}
                                                    className={`flex-1 px-2.5 py-2 rounded-md text-[11px] font-bold uppercase tracking-wide transition-all ${priority === p
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

                                    {/* Due Date Card */}
                                    <div className="bg-zinc-800/40 rounded-lg p-4 border border-zinc-700/30">
                                        <label className="block text-[10px] font-bold text-zinc-500 mb-2.5 uppercase tracking-wider">
                                            Due Date
                                        </label>
                                        <div className="space-y-2">
                                            <div className="relative">
                                                <Calendar size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
                                                <input
                                                    type="date"
                                                    value={dueDate}
                                                    onChange={(e) => setDueDate(e.target.value)}
                                                    className="w-full bg-zinc-900/60 border border-zinc-700/40 rounded-md pl-9 pr-2.5 py-2.5 text-sm font-medium text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 [color-scheme:dark] transition-all"
                                                />
                                            </div>
                                            {dueDate && (
                                                <button
                                                    onClick={() => setDueDate("")}
                                                    className="w-full py-2 text-xs font-medium text-zinc-500 hover:text-zinc-400 bg-zinc-700/40 hover:bg-zinc-700/60 rounded-md border border-zinc-600/40 hover:border-zinc-600/60 transition-all"
                                                >
                                                    Remove Deadline
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Tags Card */}
                                    <div className="bg-zinc-800/40 rounded-lg p-4 border border-zinc-700/30">
                                        <label className="block text-[10px] font-bold text-zinc-500 mb-2.5 uppercase tracking-wider flex items-center gap-1.5">
                                            <Hash size={12} />
                                            Tags
                                        </label>
                                        <TagInput
                                            tags={tags}
                                            availableTags={[]} // Can be enhanced to load from project
                                            onTagsChange={setTags}
                                            placeholder="Add tags..."
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-t from-zinc-900/60 via-zinc-900/40 to-transparent border-t border-zinc-800/40 backdrop-blur-sm flex justify-end gap-2 sm:gap-3 shrink-0">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800/60 text-sm font-medium transition-all duration-200 hover:scale-105 active:scale-95"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 hover:from-blue-500 hover:via-blue-400 hover:to-blue-500 disabled:opacity-50 text-white text-sm font-semibold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-200 hover:scale-105 active:scale-95 disabled:hover:scale-100"
                    >
                        {isSaving ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </div>
        </div>
    );
}
