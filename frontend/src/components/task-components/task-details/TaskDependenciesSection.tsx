import { Network, List } from "lucide-react";
import TaskDependencies from "../../task-dependencies/TaskDependencies";
import { DependencyGraph } from "../../task-dependencies/DependencyGraph";
import type { Task } from "../../../api/tasks";
import type { TaskDependency } from "../../../api/taskDependencies";

interface TaskDependenciesSectionProps {
    taskId: string;
    allTasks: Task[];
    dependenciesMap: Map<string, TaskDependency>;
    viewMode: 'list' | 'graph';
    onViewModeChange: (mode: 'list' | 'graph') => void;
    isLoading: boolean;
    onDependencyUpdate: () => Promise<void>;
    onTaskClickInGraph: (taskId: string) => void;
    selectedTaskId: string | null;
}

export function TaskDependenciesSection({
    taskId,
    allTasks,
    dependenciesMap,
    viewMode,
    onViewModeChange,
    isLoading,
    onDependencyUpdate,
    onTaskClickInGraph,
    selectedTaskId
}: TaskDependenciesSectionProps) {
    return (
        <div className="border-t border-zinc-200 dark:border-zinc-800/50 pt-5">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Network size={16} className="text-zinc-600 dark:text-zinc-400" />
                    <h3 className="text-sm font-semibold text-zinc-900 dark:text-white uppercase tracking-wide">Dependencies</h3>
                </div>
                <div className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800/50 rounded-lg p-1">
                    <button
                        onClick={() => onViewModeChange('list')}
                        className={`px-3 py-1.5 text-xs font-medium rounded transition-all flex items-center gap-1.5 ${viewMode === 'list'
                            ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm'
                            : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-300'
                            }`}
                    >
                        <List size={14} />
                        List
                    </button>
                    <button
                        onClick={() => onViewModeChange('graph')}
                        className={`px-3 py-1.5 text-xs font-medium rounded transition-all flex items-center gap-1.5 ${viewMode === 'graph'
                            ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm'
                            : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-300'
                            }`}
                    >
                        <Network size={14} />
                        Graph
                    </button>
                </div>
            </div>

            {viewMode === 'list' ? (
                <TaskDependencies
                    taskId={taskId}
                    allTasks={allTasks}
                    onUpdate={onDependencyUpdate}
                />
            ) : (
                <div className="mt-4">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-64 text-zinc-500">
                            <div className="flex flex-col items-center gap-2">
                                <div className="w-6 h-6 border-2 border-zinc-400/30 border-t-zinc-400 rounded-full animate-spin" />
                                <span className="text-sm">Loading dependencies...</span>
                            </div>
                        </div>
                    ) : (
                        <DependencyGraph
                            rootTaskId={taskId}
                            tasks={allTasks}
                            dependenciesMap={dependenciesMap}
                            onTaskClick={onTaskClickInGraph}
                            selectedTaskId={selectedTaskId}
                        />
                    )}
                </div>
            )}
        </div>
    );
}
