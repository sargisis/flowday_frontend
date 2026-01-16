import { useState, useEffect } from "react";
import { X, Save, FileText, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  createTaskTemplate,
  updateTaskTemplate,
  getTaskTemplate,
} from "../../api/templates";

interface TaskTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  templateId?: string;
  projectId?: string;
  onSuccess?: () => void;
}

export default function TaskTemplateModal({
  isOpen,
  onClose,
  templateId,
  projectId,
  onSuccess,
}: TaskTemplateModalProps) {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [title, setTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [estimatedHours, setEstimatedHours] = useState<number | undefined>();
  const [subtasks, setSubtasks] = useState<
    Array<{ id: string; title: string; completed: boolean }>
  >([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");

  useEffect(() => {
    if (isOpen && templateId) {
      loadTemplate();
    } else if (isOpen) {
      resetForm();
    }
  }, [isOpen, templateId]);

  const loadTemplate = async () => {
    if (!templateId) return;
    setLoading(true);
    try {
      const template = await getTaskTemplate(templateId);
      setName(template.name);
      setDescription(template.description || "");
      setTitle(template.title);
      setTaskDescription(template.task_description || "");
      setPriority(template.priority);
      setEstimatedHours(template.estimated_hours);
      setSubtasks(template.subtasks || []);
    } catch (error: any) {
      toast.error("Failed to load template");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setTitle("");
    setTaskDescription("");
    setPriority("medium");
    setEstimatedHours(undefined);
    setSubtasks([]);
    setNewSubtaskTitle("");
  };

  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    setSubtasks([
      ...subtasks,
      {
        id: Date.now().toString(),
        title: newSubtaskTitle,
        completed: false,
      },
    ]);
    setNewSubtaskTitle("");
  };

  const handleRemoveSubtask = (id: string) => {
    setSubtasks(subtasks.filter((st) => st.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !title.trim()) {
      toast.error("Name and title are required");
      return;
    }

    setLoading(true);
    try {
      const data = {
        name,
        description,
        title,
        task_description: taskDescription,
        priority,
        estimated_hours: estimatedHours,
        subtasks,
        project_id: projectId,
      };

      if (templateId) {
        await updateTaskTemplate(templateId, data);
        toast.success("Template updated successfully");
      } else {
        await createTaskTemplate(data);
        toast.success("Template created successfully");
      }

      resetForm();
      onSuccess?.();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to save template");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-zinc-900 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-zinc-800">
        <div className="flex items-center justify-between p-6 border-b border-zinc-800">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <FileText className="w-5 h-5" />
            {templateId ? "Edit Template" : "Create Template"}
          </h2>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Template Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g., Weekly Review"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              rows={2}
              placeholder="Template description..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Task Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Task title when created from template"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Task Description
            </label>
            <textarea
              value={taskDescription}
              onChange={(e) => setTaskDescription(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              rows={3}
              placeholder="Task description..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Estimated Hours
              </label>
              <input
                type="number"
                value={estimatedHours || ""}
                onChange={(e) =>
                  setEstimatedHours(
                    e.target.value ? parseFloat(e.target.value) : undefined
                  )
                }
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Optional"
                min="0"
                step="0.5"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Subtasks</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddSubtask();
                  }
                }}
                className="flex-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Add subtask..."
              />
              <button
                type="button"
                onClick={handleAddSubtask}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2">
              {subtasks.map((subtask) => (
                <div
                  key={subtask.id}
                  className="flex items-center gap-2 p-2 bg-zinc-800 rounded-lg"
                >
                  <span className="flex-1 text-sm">{subtask.title}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSubtask(subtask.id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-zinc-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {loading ? "Saving..." : templateId ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
