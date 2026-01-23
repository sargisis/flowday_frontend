import { useState, type KeyboardEvent } from 'react';
import { Plus, Check, X, GripVertical } from 'lucide-react';
import { toast } from 'sonner';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

interface SubtasksListProps {
  subtasks: Subtask[];
  onUpdate: (subtasks: Subtask[]) => void;
}

export default function SubtasksList({ subtasks = [], onUpdate }: SubtasksListProps) {
  const [newSubtask, setNewSubtask] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  const handleAddSubtask = () => {
    if (!newSubtask.trim()) return;

    const subtask: Subtask = {
      id: crypto.randomUUID(),
      title: newSubtask.trim(),
      completed: false,
    };

    onUpdate([...subtasks, subtask]);
    setNewSubtask('');
    toast.success('Subtask added');
  };

  const handleToggleSubtask = (id: string) => {
    const updated = subtasks.map((st) =>
      st.id === id ? { ...st, completed: !st.completed } : st
    );
    onUpdate(updated);
  };

  const handleDeleteSubtask = (id: string) => {
    const updated = subtasks.filter((st) => st.id !== id);
    onUpdate(updated);
    toast.success('Subtask removed');
  };

  const handleStartEdit = (subtask: Subtask) => {
    setEditingId(subtask.id);
    setEditingTitle(subtask.title);
  };

  const handleSaveEdit = () => {
    if (!editingTitle.trim()) return;

    const updated = subtasks.map((st) =>
      st.id === editingId ? { ...st, title: editingTitle.trim() } : st
    );
    onUpdate(updated);
    setEditingId(null);
    setEditingTitle('');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingTitle('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (editingId) {
        handleSaveEdit();
      } else {
        handleAddSubtask();
      }
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  const completedCount = subtasks.filter((st) => st.completed).length;
  const totalCount = subtasks.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div className="space-y-3">
      {/* Progress Bar */}
      {totalCount > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-400">
              {completedCount} of {totalCount} completed
            </span>
            <span className="text-zinc-500 font-medium">{Math.round(progress)}%</span>
          </div>
          <div className="h-1.5 bg-zinc-800/50 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Subtasks List */}
      <div className="space-y-2">
        {subtasks.map((subtask) => (
          <div
            key={subtask.id}
            className="group flex items-center gap-2 p-2.5 rounded-lg bg-zinc-800/30 border border-zinc-700/30 hover:border-zinc-600/40 hover:bg-zinc-800/50 transition-all"
          >
            {/* Drag Handle */}
            <button
              className="opacity-0 group-hover:opacity-40 hover:!opacity-100 text-zinc-500 cursor-grab active:cursor-grabbing transition-opacity"
              title="Drag to reorder"
            >
              <GripVertical size={14} />
            </button>

            {/* Checkbox */}
            <button
              onClick={() => handleToggleSubtask(subtask.id)}
              className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                subtask.completed
                  ? 'bg-indigo-500 border-indigo-500'
                  : 'border-zinc-600 hover:border-zinc-500'
              }`}
            >
              {subtask.completed && <Check size={12} className="text-white" />}
            </button>

            {/* Title */}
            {editingId === subtask.id ? (
              <input
                type="text"
                value={editingTitle}
                onChange={(e) => setEditingTitle(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={handleSaveEdit}
                className="flex-1 bg-zinc-900/50 border border-zinc-600 rounded px-2 py-1 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                autoFocus
              />
            ) : (
              <span
                onClick={() => handleStartEdit(subtask)}
                className={`flex-1 text-sm cursor-pointer ${
                  subtask.completed
                    ? 'text-zinc-500 line-through'
                    : 'text-zinc-200 hover:text-zinc-100'
                }`}
              >
                {subtask.title}
              </span>
            )}

            {/* Delete Button */}
            <button
              onClick={() => handleDeleteSubtask(subtask.id)}
              className="opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-red-400 transition-all"
              title="Delete subtask"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>

      {/* Add New Subtask */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={newSubtask}
          onChange={(e) => setNewSubtask(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add a subtask..."
          className="flex-1 bg-zinc-800/30 border border-zinc-700/30 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
        />
        <button
          onClick={handleAddSubtask}
          disabled={!newSubtask.trim()}
          className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 hover:text-indigo-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          title="Add subtask"
        >
          <Plus size={18} />
        </button>
      </div>
    </div>
  );
}
