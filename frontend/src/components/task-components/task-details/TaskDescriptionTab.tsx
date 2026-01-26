import React, { lazy, Suspense } from "react";
import { Edit3, Eye } from "lucide-react";
import MentionAutocomplete from "../../mentions/MentionAutocomplete";

// Lazy load ReactMarkdown
const ReactMarkdown = lazy(() => import("react-markdown"));

interface TaskDescriptionTabProps {
    title: string;
    onTitleChange: (title: string) => void;
    description: string;
    onDescriptionChange: (desc: string) => void;
    isPreview: boolean;
    onTogglePreview: () => void;
    activeProjectId?: string;
}

export const TaskDescriptionTab: React.FC<TaskDescriptionTabProps> = ({
    title,
    onTitleChange,
    description,
    onDescriptionChange,
    isPreview,
    onTogglePreview,
    activeProjectId,
}) => {
    return (
        <div className="space-y-5">
            <div>
                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-2 uppercase tracking-wide">
                    Title
                </label>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => onTitleChange(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-300 dark:border-zinc-700/50 rounded-lg px-4 py-3 text-zinc-900 dark:text-white placeholder-zinc-500 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-base font-medium transition-all"
                    placeholder="Enter task title..."
                />
            </div>

            <div>
                <div className="flex justify-between items-center mb-2">
                    <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wide">
                        Description
                    </label>
                    <button
                        onClick={onTogglePreview}
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
                            onChange={onDescriptionChange}
                            projectId={activeProjectId}
                            placeholder="Add more details about this task... (Type @ to mention someone)"
                            className="w-full bg-transparent p-4 text-zinc-900 dark:text-zinc-200 placeholder-zinc-500 dark:placeholder-zinc-600 focus:outline-none resize-none text-sm leading-relaxed"
                            rows={6}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};
