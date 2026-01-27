import { useState, useEffect, useRef, useMemo } from "react";
import { Clock } from "lucide-react";
import { useUndoRedo } from "../../hooks/useUndoRedo";
import { useAutoSave } from "../../hooks/useAutoSave";
import type { Tag } from "../../types/tags";
import type { Task, Attachment } from "../../api/tasks";
import { duplicateTask, uploadTaskAttachment, getTaskAttachments, deleteTaskAttachment, getTasksByProject } from "../../api/tasks";
import { useTasks } from "../../context/TaskContext";
import { useProject } from "../../context/ProjectContext";
import TaskComments from "./TaskComments";
import TimeTracker from "../time-tracking/TimeTracker";

import { TaskModalHeader } from "./task-details/TaskModalHeader";
import { TaskModalSidebar } from "./task-details/TaskModalSidebar";
import { TaskDescriptionTab } from "./task-details/TaskDescriptionTab";
import { TaskSubtasksTab } from "./task-details/TaskSubtasksTab";
import { TaskAttachments } from "./task-details/TaskAttachments";
import { TaskDependenciesSection } from "./task-details/TaskDependenciesSection";
import { TaskAIAssistant } from "./task-details/TaskAIAssistant";
import { getTaskDependencies, getBatchTaskDependencies, type TaskDependency } from "../../api/taskDependencies";

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

    const handleFileUpload = async (file: File) => {
        if (!task) return;

        // ✅ ENHANCED: Client-side validation
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            toast.error(`File size exceeds maximum allowed size (10MB). Current size: ${(file.size / (1024 * 1024)).toFixed(2)} MB`);
            return;
        }

        if (file.size < 1) {
            toast.error("File is empty or too small");
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

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-md p-0 sm:p-4">
            <div className={`
                w-full h-full sm:h-auto bg-gradient-to-br from-white via-white to-zinc-50 dark:from-zinc-900/98 dark:via-zinc-900/95 dark:to-zinc-950/98 border-0 sm:border border-zinc-200/80 dark:border-zinc-700/50 rounded-none sm:rounded-3xl shadow-2xl overflow-hidden backdrop-blur-2xl ring-0 sm:ring-1 ring-white/5 dark:ring-white/10 flex flex-col sm:block transition-all duration-500
                ${dependencyViewMode === 'graph' ? 'sm:max-w-6xl' : 'sm:max-w-3xl'}
            `}>
                {/* Header */}
                <TaskModalHeader
                    isAutoSaving={isAutoSaving}
                    lastSaved={lastSaved}
                    onUndo={handleUndo}
                    canUndo={canUndo}
                    onRedo={handleRedo}
                    canRedo={canRedo}
                    onDuplicate={handleDuplicate}
                    onDelete={handleDelete}
                    onClose={onClose}
                />

                <div className={`p-6 transition-all ${dependencyViewMode === 'graph' ? 'h-[85vh] overflow-hidden' : 'max-h-[70vh] overflow-y-auto'}`}>
                    <div className={`grid grid-cols-1 ${dependencyViewMode === 'graph' ? 'md:grid-cols-4' : 'md:grid-cols-3'} gap-6 h-full`}>
                        {/* Main Content */}
                        <div className={`${dependencyViewMode === 'graph' ? 'md:col-span-3' : 'md:col-span-2'} space-y-5 h-full`}>
                            {dependencyViewMode !== 'graph' && (
                                <TaskDescriptionTab
                                    title={title}
                                    onTitleChange={setTitle}
                                    description={description}
                                    onDescriptionChange={setDescription}
                                    isPreview={isPreview}
                                    onTogglePreview={() => setIsPreview(!isPreview)}
                                    activeProjectId={activeProjectId || undefined}
                                />
                            )}

                            {/* Attachments Section */}
                            {dependencyViewMode !== 'graph' && (
                                <TaskAttachments
                                    attachments={attachments}
                                    isUploading={isUploading}
                                    onUpload={handleFileUpload}
                                    onDelete={handleDeleteAttachment}
                                />
                            )}

                            {/* Subtasks Section */}
                            {dependencyViewMode !== 'graph' && (
                                <TaskSubtasksTab
                                    subtasks={subtasks}
                                    onUpdate={setSubtasks}
                                />
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
                            <TaskDependenciesSection
                                taskId={task.id}
                                allTasks={allTasks}
                                dependenciesMap={dependenciesMap}
                                viewMode={dependencyViewMode}
                                onViewModeChange={setDependencyViewMode}
                                isLoading={isLoadingDependencies}
                                onDependencyUpdate={handleDependencyUpdate}
                                onTaskClickInGraph={handleTaskClickInGraph}
                                selectedTaskId={selectedTaskId}
                            />

                            {/* Comments Section */}
                            {dependencyViewMode !== 'graph' && (
                                <div className="border-t border-zinc-200 dark:border-zinc-800/50 pt-5">
                                    <TaskComments taskId={task.id} />
                                </div>
                            )}

                            {/* AI Plan Section */}
                            {dependencyViewMode !== 'graph' && (
                                <TaskAIAssistant
                                    onEnrich={handleEnrich}
                                    onDecompose={handleDecompose}
                                    isEnriching={isEnriching}
                                    isDecomposing={isDecomposing}
                                />
                            )}
                        </div>


                        {/* Sidebar info / Graph Inspector */}
                        <TaskModalSidebar
                            task={task}
                            status={status}
                            onStatusChange={setStatus}
                            priority={priority}
                            onPriorityChange={setPriority}
                            dueDate={dueDate}
                            onDueDateChange={setDueDate}
                            tags={tags}
                            onTagsChange={setTags}
                            dependencyViewMode={dependencyViewMode}
                            allTasks={allTasks}
                            selectedTaskId={selectedTaskId}
                            onSelectTask={setSelectedTaskId}
                        />
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
