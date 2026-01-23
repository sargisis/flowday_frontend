import { useState } from "react";
import { X, Trash2, Tag, Calendar, CheckSquare } from "lucide-react";

interface BulkActionsBarProps {
    selectedCount: number;
    onClose: () => void;
    onChangeStatus: (status: string) => void;
    onChangePriority: (priority: string) => void;
    onDelete: () => void;
    onClearSelection: () => void;
}

export default function BulkActionsBar({
    selectedCount,
    onClose,
    onChangeStatus,
    onChangePriority,
    onDelete,
    onClearSelection
}: BulkActionsBarProps) {
    const [showStatusMenu, setShowStatusMenu] = useState(false);
    const [showPriorityMenu, setShowPriorityMenu] = useState(false);

    const statuses = [
        { value: 'Todo', label: 'To Do', color: 'zinc' },
        { value: 'In_Progress', label: 'In Progress', color: 'blue' },
        { value: 'Blocked', label: 'Blocked', color: 'rose' },
        { value: 'Done', label: 'Done', color: 'emerald' }
    ];

    const priorities = [
        { value: 'low', label: 'Low', color: 'green' },
        { value: 'medium', label: 'Medium', color: 'amber' },
        { value: 'high', label: 'High', color: 'red' }
    ];

    return (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4 duration-300">
            <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl shadow-2xl shadow-indigo-500/50 p-1">
                <div className="bg-zinc-900/95 backdrop-blur-xl rounded-xl px-6 py-4 flex items-center gap-6 border border-white/10">
                    {/* Selection Count */}
                    <div className="flex items-center gap-3 pr-6 border-r border-white/10">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-indigo-500/20 border border-indigo-500/30">
                            <CheckSquare size={18} className="text-indigo-400" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-white">{selectedCount} Selected</p>
                            <button
                                onClick={onClearSelection}
                                className="text-xs text-zinc-400 hover:text-white transition-colors"
                            >
                                Clear selection
                            </button>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                        {/* Change Status */}
                        <div className="relative">
                            <button
                                onClick={() => {
                                    setShowStatusMenu(!showStatusMenu);
                                    setShowPriorityMenu(false);
                                }}
                                className="px-4 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-sm font-medium text-white transition-all flex items-center gap-2"
                            >
                                <Tag size={16} />
                                Change Status
                            </button>

                            {showStatusMenu && (
                                <div className="absolute bottom-full left-0 mb-2 w-48 bg-zinc-800 backdrop-blur-xl rounded-lg border border-white/10 shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
                                    {statuses.map((status) => (
                                        <button
                                            key={status.value}
                                            onClick={() => {
                                                onChangeStatus(status.value);
                                                setShowStatusMenu(false);
                                            }}
                                            className="w-full px-4 py-2.5 text-left text-sm font-medium hover:bg-white/10 transition-colors text-white flex items-center gap-3"
                                        >
                                            <div className={`w-2 h-2 rounded-full bg-${status.color}-500`} />
                                            {status.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Change Priority */}
                        <div className="relative">
                            <button
                                onClick={() => {
                                    setShowPriorityMenu(!showPriorityMenu);
                                    setShowStatusMenu(false);
                                }}
                                className="px-4 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-sm font-medium text-white transition-all flex items-center gap-2"
                            >
                                <Calendar size={16} />
                                Change Priority
                            </button>

                            {showPriorityMenu && (
                                <div className="absolute bottom-full left-0 mb-2 w-48 bg-zinc-800 backdrop-blur-xl rounded-lg border border-white/10 shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
                                    {priorities.map((priority) => (
                                        <button
                                            key={priority.value}
                                            onClick={() => {
                                                onChangePriority(priority.value);
                                                setShowPriorityMenu(false);
                                            }}
                                            className="w-full px-4 py-2.5 text-left text-sm font-medium hover:bg-white/10 transition-colors text-white flex items-center gap-3"
                                        >
                                            <div className={`w-2 h-2 rounded-full bg-${priority.color}-500`} />
                                            {priority.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Delete */}
                        <button
                            onClick={onDelete}
                            className="px-4 py-2.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 hover:border-rose-500/30 text-sm font-medium text-rose-400 hover:text-rose-300 transition-all flex items-center gap-2"
                        >
                            <Trash2 size={16} />
                            Delete
                        </button>
                    </div>

                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="ml-2 p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-all"
                        aria-label="Close bulk actions"
                    >
                        <X size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
}
