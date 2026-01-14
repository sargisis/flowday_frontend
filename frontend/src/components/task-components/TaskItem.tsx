import { useState, useEffect } from "react";
import { type Task, updateTask, deleteTask } from "../../api/tasks"
import { useNavigate } from "react-router-dom";
import { Maximize2 } from "lucide-react";
import StatusSelector from "../status-bar-components/StatusSelector";
import { toast } from "sonner";

interface TaskItemProps {
    task: Task;
    onUpdate: () => void;
    onView: (task: Task) => void;
}

export default function TaskItem({ task, onUpdate, onView }: TaskItemProps) {
    const navigate = useNavigate();
    const [optimisticStatus, setOptimisticStatus] = useState(task.status);

    // Sync optimistic state if parent updates (e.g. initial load or other user changes)
    useEffect(() => {
        setOptimisticStatus(task.status);
    }, [task.status]);

    const handleDelete = async () => {
        if (window.confirm("Are you sure you want to delete this task?")) {
            try {
                await deleteTask(task.id);
                onUpdate();
                toast.success("Task deleted successfully");
            } catch {
                toast.error("Failed to delete task");
            }
        }
    };

    return (
        <div className="task-row group">
            {/* Title Column */}
            <div className="min-w-0 pr-4">
                <h3 className="task-title">
                    {task.title}
                </h3>
                {/* Description rendering removed - now uses Modal */}
            </div>

            {/* Priority Column */}
            <div>
                <span className={`priority-badge ${task.priority.toLowerCase() === 'high' ? 'priority-high' :
                    task.priority.toLowerCase() === 'medium' ? 'priority-medium' :
                        'priority-low'
                    }`}>
                    {task.priority}
                </span>
            </div>

            {/* Status Column */}
            <div className="-ml-2">
                <StatusSelector
                    currentStatus={optimisticStatus}
                    onStatusChange={async (newStatus) => {
                        const previousStatus = optimisticStatus;
                        // 1. Optimistic Update
                        setOptimisticStatus(newStatus);

                        try {
                            // 2. API Call in background
                            await updateTask(task.id, { status: newStatus });
                            // 3. Sync with parent (optional, but good for consistency)
                            onUpdate();
                        } catch {
                            // 4. Rollback on failure
                            setOptimisticStatus(previousStatus);
                            toast.error("Failed to update status");
                        }
                    }}
                />
            </div>


            {/* Actions Column */}
            <div className="task-actions">
                {/* New Focus Mode Button */}
                <button
                    className="action-btn view"
                    onClick={() => navigate(`/app/v1/focus/${task.id}`)}
                    title="Enter Focus Mode"
                >
                    <Maximize2 size={16} />
                </button>

                {/* View Description Button (Only if description exists) */}
                {task.description && (
                    <button
                        onClick={() => onView(task)}
                        className="action-btn view"
                        title="View Description"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                            <circle cx="12" cy="12" r="3" />
                        </svg>
                    </button>
                )}

                <button
                    onClick={() => navigate(`/app/v1/focus/${task.id}`)}
                    className="action-btn focus"
                    title="Focus Mode"
                >
                    <span className="text-xs">⚡</span>
                </button>
                <button
                    onClick={handleDelete}
                    className="action-btn delete"
                    title="Delete Task"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
                </button>
            </div>
        </div>
    );
}
