import React from "react";
import { Calendar, Hash } from "lucide-react";
import TagInput from "../../tags/TagInput";
import type { Tag } from "../../../types/tags";
import type { Task } from "../../../api/tasks";

interface TaskModalSidebarProps {
    task: Task;
    status: string;
    onStatusChange: (status: string) => void;
    priority: string;
    onPriorityChange: (priority: string) => void;
    dueDate: string;
    onDueDateChange: (date: string) => void;
    tags: Tag[];
    onTagsChange: (tags: Tag[]) => void;
    dependencyViewMode: 'list' | 'graph';
    allTasks: Task[];
    selectedTaskId: string | null;
    onSelectTask: (taskId: string | null) => void;
}

export const TaskModalSidebar: React.FC<TaskModalSidebarProps> = ({
    task,
    status,
    onStatusChange,
    priority,
    onPriorityChange,
    dueDate,
    onDueDateChange,
    tags,
    onTagsChange,
    dependencyViewMode,
    allTasks,
    selectedTaskId,
    onSelectTask,
}) => {
    if (dependencyViewMode === 'graph') {
        const inspectorTask = allTasks.find(t => String(t.id) === String(selectedTaskId || task.id));
        if (!inspectorTask) return <div className="text-zinc-500 italic text-sm">Select a task on the graph to view details.</div>;

        return (
            <div className="h-full bg-zinc-800/40 rounded-3xl p-6 border border-zinc-700/30 backdrop-blur-3xl flex flex-col gap-6">
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
                        onClick={() => onSelectTask(null)}
                        className="w-full py-2.5 text-xs font-bold text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-all"
                    >
                        Focus Root Task
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Status Card */}
            <div className="bg-zinc-800/40 rounded-lg p-4 border border-zinc-700/30">
                <label className="block text-[10px] font-bold text-zinc-500 mb-2.5 uppercase tracking-wider">
                    Status
                </label>
                <select
                    value={status}
                    onChange={(e) => onStatusChange(e.target.value)}
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
                            onClick={() => onPriorityChange(p)}
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
                            onChange={(e) => onDueDateChange(e.target.value)}
                            className="w-full bg-zinc-900/60 border border-zinc-700/40 rounded-md pl-9 pr-2.5 py-2.5 text-sm font-medium text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 [color-scheme:dark] transition-all"
                        />
                    </div>
                    {dueDate && (
                        <button
                            onClick={() => onDueDateChange("")}
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
                    onTagsChange={onTagsChange}
                    placeholder="Add tags..."
                />
            </div>
        </div>
    );
};
