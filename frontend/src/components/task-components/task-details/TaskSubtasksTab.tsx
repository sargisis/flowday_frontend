import React from "react";
import { CheckSquare } from "lucide-react";
import SubtasksList from "../../subtasks/SubtasksList";

interface TaskSubtasksTabProps {
    subtasks: { id: string; title: string; completed: boolean }[];
    onUpdate: (subtasks: { id: string; title: string; completed: boolean }[]) => void;
}

export const TaskSubtasksTab: React.FC<TaskSubtasksTabProps> = ({
    subtasks,
    onUpdate,
}) => {
    return (
        <div className="border-t border-zinc-200 dark:border-zinc-800/50 pt-5">
            <div className="flex items-center gap-2 mb-4">
                <CheckSquare size={16} className="text-zinc-600 dark:text-zinc-400" />
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-white uppercase tracking-wide">Subtasks</h3>
            </div>
            <SubtasksList
                subtasks={subtasks}
                onUpdate={onUpdate}
            />
        </div>
    );
};
