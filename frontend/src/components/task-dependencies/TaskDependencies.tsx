import { useState, useEffect } from "react";
import { Link, Plus, X, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import {
  getTaskDependencies,
  addTaskDependency,
  removeTaskDependency,
  type TaskDependency,
} from "../../api/taskDependencies";
import type { Task } from "../../api/tasks";

interface TaskDependenciesProps {
  taskId: string;
  allTasks: Task[];
  onUpdate?: () => void;
}

export default function TaskDependencies({
  taskId,
  allTasks,
  onUpdate,
}: TaskDependenciesProps) {
  const [dependencies, setDependencies] = useState<TaskDependency | null>(null);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState("");

  useEffect(() => {
    loadDependencies();
  }, [taskId]);

  const loadDependencies = async () => {
    try {
      const data = await getTaskDependencies(taskId);
      setDependencies(data);
    } catch (error) {
      console.error("Failed to load dependencies", error);
    }
  };

  const handleAdd = async () => {
    if (!selectedTaskId) {
      toast.error("Please select a task");
      return;
    }

    setLoading(true);
    try {
      await addTaskDependency(taskId, {
        depends_on_task_id: selectedTaskId,
      });
      toast.success("Dependency added");
      setShowAddModal(false);
      setSelectedTaskId("");
      loadDependencies();
      onUpdate?.();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to add dependency");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (dependsOnTaskId: string) => {
    setLoading(true);
    try {
      await removeTaskDependency(taskId, {
        depends_on_task_id: dependsOnTaskId,
      });
      toast.success("Dependency removed");
      loadDependencies();
      onUpdate?.();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to remove dependency");
    } finally {
      setLoading(false);
    }
  };

  const getTaskById = (id: string) => {
    return allTasks.find((t) => String(t.id) === String(id));
  };

  if (!dependencies) {
    return <div className="text-sm text-zinc-400">Loading dependencies...</div>;
  }

  const dependsOnTasks = dependencies.depends_on || [];
  const blocksTasks = dependencies.blocks || [];
  const blockedByTasks = dependencies.blocked_by || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link className="w-4 h-4 text-zinc-400" />
          <h3 className="text-sm font-semibold text-zinc-300">Dependencies</h3>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1 px-2 py-1 text-xs bg-indigo-600 hover:bg-indigo-700 rounded transition-colors"
        >
          <Plus className="w-3 h-3" />
          Add
        </button>
      </div>

      {/* Depends On */}
      {dependsOnTasks.length > 0 && (
        <div>
          <h4 className="text-xs text-zinc-500 mb-2">Depends On</h4>
          <div className="space-y-1">
            {dependsOnTasks.map((task: any) => {
              const taskData = getTaskById(task.id || task);
              if (!taskData) return null;
              return (
                <div
                  key={taskData.id}
                  className="flex items-center justify-between p-2 bg-zinc-800 rounded text-sm"
                >
                  <span className="text-zinc-300">{taskData.title}</span>
                  <button
                    onClick={() => handleRemove(taskData.id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Blocks */}
      {blocksTasks.length > 0 && (
        <div>
          <h4 className="text-xs text-zinc-500 mb-2">Blocks</h4>
          <div className="space-y-1">
            {blocksTasks.map((task: any) => {
              const taskData = getTaskById(task.id || task);
              if (!taskData) return null;
              return (
                <div
                  key={taskData.id}
                  className="p-2 bg-zinc-800 rounded text-sm text-zinc-300"
                >
                  {taskData.title}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Blocked By */}
      {blockedByTasks.length > 0 && (
        <div>
          <h4 className="text-xs text-zinc-500 mb-2 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-amber-400" />
            Blocked By
          </h4>
          <div className="space-y-1">
            {blockedByTasks.map((task: any) => {
              const taskData = getTaskById(task.id || task);
              if (!taskData) return null;
              return (
                <div
                  key={taskData.id}
                  className="p-2 bg-amber-500/10 border border-amber-500/20 rounded text-sm text-amber-300"
                >
                  {taskData.title}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {dependsOnTasks.length === 0 &&
        blocksTasks.length === 0 &&
        blockedByTasks.length === 0 && (
          <div className="text-sm text-zinc-500 text-center py-4">
            No dependencies
          </div>
        )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-zinc-900 rounded-lg w-full max-w-md p-6 border border-zinc-800">
            <h3 className="text-lg font-semibold mb-4">Add Dependency</h3>
            <select
              value={selectedTaskId}
              onChange={(e) => setSelectedTaskId(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg mb-4"
            >
              <option value="">Select a task...</option>
              {allTasks
                .filter((t) => String(t.id) !== String(taskId))
                .map((task) => (
                  <option key={task.id} value={task.id}>
                    {task.title}
                  </option>
                ))}
            </select>
            <div className="flex gap-2">
              <button
                onClick={handleAdd}
                disabled={loading || !selectedTaskId}
                className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg disabled:opacity-50"
              >
                Add
              </button>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setSelectedTaskId("");
                }}
                className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
