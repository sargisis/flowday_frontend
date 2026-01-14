import { useState, useEffect, useRef } from "react";
import { X, Calendar, Trash2, Sparkles, Edit3, Eye, CheckSquare, Square, Copy, Paperclip, Image as ImageIcon, File, Upload } from "lucide-react";
import ReactMarkdown from "react-markdown";
import type { Task, Attachment } from "../../api/tasks";
import { duplicateTask, uploadTaskAttachment, getTaskAttachments, deleteTaskAttachment } from "../../api/tasks";
import { useTasks } from "../../context/TaskContext";
import TaskComments from "./TaskComments";

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
    const [subtasks, setSubtasks] = useState<{ id: string; title: string; completed: boolean }[]>([]);
    const [status, setStatus] = useState("");
    const [priority, setPriority] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [isEnriching, setIsEnriching] = useState(false);
    const [isPreview, setIsPreview] = useState(false);
    const [attachments, setAttachments] = useState<Attachment[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (task && isOpen) {
            setTitle(task.title || "");
            setDescription(task.description || "");
            setSubtasks(task.subtasks || []);
            setStatus(task.status || "Todo");
            setPriority(task.priority || "medium");
            setDueDate(task.due_date ? new Date(task.due_date).toISOString().split('T')[0] : "");
            // Load attachments
            loadAttachments();
        }
    }, [task, isOpen]);

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

        setIsUploading(true);
        try {
            const attachment = await uploadTaskAttachment(task.id, file);
            setAttachments([...attachments, attachment]);
            toast.success("File uploaded successfully");
        } catch (error) {
            console.error("Failed to upload file", error);
            toast.error("Failed to upload file");
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="w-full max-w-3xl bg-zinc-900/95 border border-zinc-800/50 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl">
                {/* Header */}
                <div className="flex justify-between items-center px-6 py-4 border-b border-zinc-800/50 bg-zinc-900/50">
                    <h2 className="text-xl font-semibold text-white">Task Details</h2>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={handleDuplicate}
                            className="p-2 text-zinc-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                            title="Duplicate Task"
                        >
                            <Copy size={18} />
                        </button>
                        <button
                            onClick={handleDelete}
                            className="p-2 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                            title="Delete Task"
                        >
                            <Trash2 size={18} />
                        </button>
                        <button 
                            onClick={onClose} 
                            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>

                <div className="p-6 max-h-[70vh] overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Main Content */}
                        <div className="md:col-span-2 space-y-5">
                            <div>
                                <label className="block text-xs font-semibold text-zinc-400 mb-2 uppercase tracking-wide">
                                    Title
                                </label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full bg-zinc-800/80 border border-zinc-700/50 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-base font-medium transition-all"
                                    placeholder="Enter task title..."
                                />
                            </div>

                            {/* Subtasks / Magic Checklist Section */}
                            {subtasks.length > 0 && (
                                <div className="bg-zinc-800/30 rounded-xl p-4 border border-zinc-700/50">
                                    <div className="flex items-center justify-between mb-3">
                                        <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wide">
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
                                                className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                                                    subtask.completed
                                                        ? "bg-green-500/10 border-green-500/30"
                                                        : "bg-zinc-800/50 border-zinc-700/50 hover:bg-zinc-800/70 hover:border-zinc-600/50"
                                                }`}
                                            >
                                                <div className={`mt-0.5 transition-colors ${subtask.completed ? "text-green-400" : "text-zinc-500"}`}>
                                                    {subtask.completed ? <CheckSquare size={16} /> : <Square size={16} />}
                                                </div>
                                                <span className={`text-sm flex-1 ${subtask.completed ? "text-zinc-500 line-through" : "text-zinc-200"}`}>
                                                    {subtask.title}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wide">
                                        Description
                                    </label>
                                    <button
                                        onClick={() => setIsPreview(!isPreview)}
                                        className="text-xs text-zinc-400 hover:text-blue-400 flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-blue-500/10 transition-colors"
                                    >
                                        {isPreview ? <Edit3 size={12} /> : <Eye size={12} />}
                                        {isPreview ? "Edit" : "Preview"}
                                    </button>
                                </div>

                                <div className="min-h-[140px] bg-zinc-800/50 border border-zinc-700/50 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500/50 focus-within:border-blue-500/50 transition-all">
                                    {isPreview ? (
                                        <div className="p-4 text-sm text-zinc-200 leading-relaxed overflow-y-auto max-h-[300px] prose prose-invert prose-sm max-w-none">
                                            <ReactMarkdown>{description || "*No description yet.*"}</ReactMarkdown>
                                        </div>
                                    ) : (
                                        <textarea
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            rows={6}
                                            placeholder="Add more details about this task..."
                                            className="w-full bg-transparent p-4 text-zinc-200 placeholder-zinc-600 focus:outline-none resize-none text-sm leading-relaxed"
                                        />
                                    )}
                                </div>
                            </div>

                            {/* Attachments Section */}
                            <div className="border-t border-zinc-800/50 pt-5">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <Paperclip size={16} className="text-zinc-400" />
                                        <h3 className="text-sm font-semibold text-white uppercase tracking-wide">Attachments</h3>
                                        {attachments.length > 0 && (
                                            <span className="text-xs text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded-full">
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
                                                Uploading...
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
                                                className="group flex items-center gap-3 p-3 bg-zinc-800/50 border border-zinc-700/50 rounded-lg hover:bg-zinc-800/70 hover:border-zinc-600/50 transition-all"
                                            >
                                                <div className={`flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-lg ${attachment.type === "image" ? 'bg-blue-500/20 text-blue-400' : 'bg-zinc-700/50 text-zinc-400'}`}>
                                                    {attachment.type === "image" ? (
                                                        <ImageIcon size={16} />
                                                    ) : (
                                                        <File size={16} />
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <a
                                                        href={attachment.url.startsWith('http') ? attachment.url : `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1'}${attachment.url}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="block text-sm font-medium text-zinc-200 hover:text-blue-400 truncate transition-colors"
                                                    >
                                                        {attachment.filename}
                                                    </a>
                                                    <div className="flex items-center gap-1.5 mt-1">
                                                        <span className="text-xs text-zinc-500">{formatFileSize(attachment.size)}</span>
                                                        <span className="text-zinc-600">·</span>
                                                        <span className="text-xs text-zinc-500">{new Date(attachment.uploaded_at).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleDeleteAttachment(attachment.id)}
                                                    className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                                    title="Delete attachment"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-zinc-500 text-sm bg-zinc-800/30 rounded-lg border border-dashed border-zinc-700/50">
                                        No attachments yet
                                    </div>
                                )}
                            </div>

                            {/* Comments Section */}
                            <div className="border-t border-zinc-800/50 pt-5">
                                <TaskComments taskId={task.id} />
                            </div>

                            {/* AI Plan Section */}
                            <div className="p-5 bg-gradient-to-br from-purple-500/10 via-blue-500/10 to-transparent border border-purple-500/20 rounded-xl">
                                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="p-1.5 bg-purple-500/20 rounded-lg">
                                                <Sparkles size={16} className="text-purple-400" />
                                            </div>
                                            <h4 className="text-sm font-semibold text-white">AI Plan Generator</h4>
                                        </div>
                                        <p className="text-xs text-zinc-400 leading-relaxed">
                                            Generate an intelligent execution plan with AI in seconds.
                                        </p>
                                    </div>
                                    <button
                                        onClick={handleEnrich}
                                        disabled={isEnriching}
                                        className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg flex items-center gap-2 shadow-lg shadow-purple-500/20 transition-all"
                                    >
                                        {isEnriching ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Generating...
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles size={14} />
                                                Generate Plan
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Sidebar info */}
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
                                            className={`flex-1 px-2.5 py-2 rounded-md text-[11px] font-bold uppercase tracking-wide transition-all ${
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
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-zinc-900/50 border-t border-zinc-800/50 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 text-sm font-medium transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 disabled:opacity-50 text-white text-sm font-semibold shadow-lg shadow-blue-500/20 transition-all"
                    >
                        {isSaving ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </div>
        </div>
    );
}
