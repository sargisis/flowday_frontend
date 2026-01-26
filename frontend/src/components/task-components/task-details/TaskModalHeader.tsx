import React from "react";
import { X, Copy, Trash2, Undo2, Redo2 } from "lucide-react";

interface TaskModalHeaderProps {
    isAutoSaving: boolean;
    lastSaved: Date | null;
    onUndo: () => void;
    canUndo: boolean;
    onRedo: () => void;
    canRedo: boolean;
    onDuplicate: () => void;
    onDelete: () => void;
    onClose: () => void;
}

export const TaskModalHeader: React.FC<TaskModalHeaderProps> = ({
    isAutoSaving,
    lastSaved,
    onUndo,
    canUndo,
    onRedo,
    canRedo,
    onDuplicate,
    onDelete,
    onClose,
}) => {
    return (
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
                        onClick={onUndo}
                        disabled={!canUndo}
                        className="p-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Undo (Ctrl+Z)"
                    >
                        <Undo2 size={18} />
                    </button>
                    <button
                        onClick={onRedo}
                        disabled={!canRedo}
                        className="p-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Redo (Ctrl+Y)"
                    >
                        <Redo2 size={18} />
                    </button>
                </div>
                <button
                    onClick={onDuplicate}
                    className="p-2.5 text-zinc-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-500/10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
                    title="Duplicate Task"
                >
                    <Copy size={18} strokeWidth={2.5} />
                </button>
                <button
                    onClick={onDelete}
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
    );
};
