import { X, Keyboard } from "lucide-react";

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const shortcuts = [
  { keys: ["C"], description: "Create new task" },
  { keys: ["/"], description: "Focus search" },
  { keys: ["S"], description: "Toggle selection mode" },
  { keys: ["Ctrl", "S"], description: "Save current changes" },
  { keys: ["Delete"], description: "Delete selected items" },
  { keys: ["Q"], description: "Quick add task" },
  { keys: ["Esc"], description: "Close modal / Cancel" },
  { keys: ["?", "Shift"], description: "Show keyboard shortcuts" },
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
          <div className="space-y-4">
            {shortcuts.map((shortcut, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors"
              >
                <span className="text-zinc-300">{shortcut.description}</span>
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
