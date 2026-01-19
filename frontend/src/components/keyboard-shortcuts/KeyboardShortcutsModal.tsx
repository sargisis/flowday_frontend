import { X, Keyboard } from "lucide-react";

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const shortcuts = [
  { category: "Navigation", shortcuts: [
    { keys: ["↑", "↓"], description: "Navigate tasks in list" },
    { keys: ["Home"], description: "Jump to first task" },
    { keys: ["End"], description: "Jump to last task" },
    { keys: ["Enter"], description: "Open selected task / Edit task" },
  ]},
  { category: "Tasks", shortcuts: [
    { keys: ["C"], description: "Create new task" },
    { keys: ["D"], description: "Delete selected task" },
  ]},
  { category: "Selection", shortcuts: [
    { keys: ["S"], description: "Toggle selection mode" },
    { keys: ["Ctrl", "A"], description: "Select all tasks" },
    { keys: ["1", "2", "3", "4"], description: "Bulk change status (1=Todo, 2=In Progress, 3=Blocked, 4=Done)" },
    { keys: ["Delete"], description: "Delete selected items" },
    { keys: ["Esc"], description: "Cancel selection" },
  ]},
  { category: "Search & Navigation", shortcuts: [
    { keys: ["/"], description: "Open global search" },
    { keys: ["Ctrl", "K"], description: "Open command palette" },
    { keys: ["Shift", "?"], description: "Show keyboard shortcuts" },
  ]},
  { category: "Actions", shortcuts: [
    { keys: ["Ctrl", "S"], description: "Save current changes" },
    { keys: ["Esc"], description: "Close modal / Cancel" },
  ]},
];

export default function KeyboardShortcutsModal({
  isOpen,
  onClose,
}: KeyboardShortcutsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-zinc-900 rounded-lg w-full max-w-2xl max-h-[80vh] overflow-y-auto border border-zinc-800">
        <div className="flex items-center justify-between p-6 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <Keyboard className="w-5 h-5 text-indigo-400" />
            <h2 className="text-xl font-semibold">Keyboard Shortcuts</h2>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="space-y-6">
            {shortcuts.map((category, categoryIndex) => (
              <div key={categoryIndex}>
                <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">
                  {category.category}
                </h3>
                <div className="space-y-2">
                  {category.shortcuts.map((shortcut, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg hover:bg-zinc-700/50 transition-colors"
                    >
                      <span className="text-zinc-300 text-sm">{shortcut.description}</span>
                      <div className="flex items-center gap-1">
                        {shortcut.keys.map((key, keyIndex) => (
                          <span key={keyIndex}>
                            <kbd className="px-2 py-1 text-xs font-semibold text-zinc-300 bg-zinc-700 border border-zinc-600 rounded">
                              {key}
                            </kbd>
                            {keyIndex < shortcut.keys.length - 1 && (
                              <span className="mx-1 text-zinc-500">+</span>
                            )}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
            <p className="text-sm text-zinc-400">
              💡 Tip: Press <kbd className="px-1.5 py-0.5 text-xs bg-zinc-700 rounded">?</kbd>{" "}
              to open this dialog anytime
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
