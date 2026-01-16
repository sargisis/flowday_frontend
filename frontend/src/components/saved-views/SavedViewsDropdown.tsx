import { useState, useEffect, useRef } from "react";
import { Filter, Plus, Trash2, ChevronDown, X, Bookmark } from "lucide-react";
import { toast } from "sonner";
import {
  type SavedView,
  getSavedViews,
  deleteSavedView,
  createSavedView,
} from "../../api/savedViews";

interface SavedViewsDropdownProps {
  projectId?: string;
  currentFilters?: any;
  onSelectView?: (view: SavedView) => void;
  onApplyFilters?: (filters: SavedView["filters"]) => void;
}

export default function SavedViewsDropdown({
  projectId,
  currentFilters,
  onSelectView,
  onApplyFilters,
}: SavedViewsDropdownProps) {
  const [views, setViews] = useState<SavedView[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewName, setViewName] = useState("");
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadViews();
  }, [projectId]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const loadViews = async () => {
    try {
      const data = await getSavedViews(projectId);
      setViews(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error("Failed to load saved views");
      setViews([]);
    }
  };

  const handleDelete = async (viewId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Delete this saved view?")) return;
    try {
      await deleteSavedView(viewId);
      toast.success("View deleted");
      loadViews();
    } catch (error) {
      toast.error("Failed to delete view");
    }
  };

  const handleSaveCurrent = async () => {
    if (!viewName.trim()) {
      toast.error("Please enter a name");
      return;
    }

    setLoading(true);
    try {
      // ✅ FIX: Normalize filters to ensure status is always an array
      const normalizedFilters: any = {};
      if (currentFilters) {
        // Convert status to array if it's a string
        if (currentFilters.status) {
          normalizedFilters.status = Array.isArray(currentFilters.status)
            ? currentFilters.status
            : [currentFilters.status];
        }
        // Convert priority to array if it's a string
        if (currentFilters.priority) {
          normalizedFilters.priority = Array.isArray(currentFilters.priority)
            ? currentFilters.priority
            : [currentFilters.priority];
        }
        // Copy other filter properties
        Object.keys(currentFilters).forEach((key) => {
          if (key !== "status" && key !== "priority") {
            normalizedFilters[key] = currentFilters[key];
          }
        });
      }

      await createSavedView({
        name: viewName,
        project_id: projectId,
        filters: normalizedFilters,
      });
      toast.success("View saved successfully");
      setViewName("");
      setShowCreateModal(false);
      loadViews();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to save view");
    } finally {
      setLoading(false);
    }
  };

  const handleApplyView = (view: SavedView) => {
    onSelectView?.(view);
    onApplyFilters?.(view.filters);
    setIsOpen(false);
    toast.success(`Applied view: ${view.name}`);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Main Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-zinc-100 dark:bg-white/[0.03] hover:bg-zinc-200 dark:hover:bg-white/[0.08] border border-zinc-300 dark:border-white/10 text-zinc-700 dark:text-zinc-300 rounded-lg text-[10px] font-bold transition-all uppercase tracking-wider group"
      >
        <Bookmark className="w-3.5 h-3.5" />
        <span>Views</span>
        <ChevronDown
          className={`w-3.5 h-3.5 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-xl z-50 overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-800/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
                  Saved Views
                </h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 rounded transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Views List */}
          <div className="max-h-64 overflow-y-auto">
            {views && Array.isArray(views) && views.length > 0 ? (
              <div className="py-1">
                {views.map((view) => (
                  <div
                    key={view.id}
                    className="group flex items-center justify-between px-4 py-2.5 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer"
                    onClick={() => handleApplyView(view)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-zinc-900 dark:text-white truncate">
                        {view.name}
                      </div>
                      {view.description && (
                        <div className="text-xs text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
                          {view.description}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={(e) => handleDelete(view.id, e)}
                      className="ml-2 p-1.5 text-zinc-400 hover:text-red-500 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all rounded hover:bg-red-50 dark:hover:bg-red-500/10"
                      title="Delete view"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-4 py-8 text-center">
                <Bookmark className="w-8 h-8 text-zinc-400 dark:text-zinc-600 mx-auto mb-2" />
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  No saved views yet
                </p>
                <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
                  Save your current filters as a view
                </p>
              </div>
            )}
          </div>

          {/* Create New View */}
          {showCreateModal ? (
            <div className="border-t border-zinc-200 dark:border-zinc-800 p-4 bg-zinc-50 dark:bg-zinc-800/30">
              <div className="flex items-center gap-2 mb-3">
                <Plus className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
                <h4 className="text-sm font-semibold text-zinc-900 dark:text-white">
                  Save Current View
                </h4>
              </div>
              <input
                type="text"
                value={viewName}
                onChange={(e) => setViewName(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleSaveCurrent();
                  } else if (e.key === "Escape") {
                    setShowCreateModal(false);
                    setViewName("");
                  }
                }}
                placeholder="Enter view name..."
                className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg text-sm text-zinc-900 dark:text-white placeholder-zinc-500 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent mb-2"
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSaveCurrent}
                  disabled={loading || !viewName.trim()}
                  className="flex-1 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
                >
                  {loading ? "Saving..." : "Save"}
                </button>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setViewName("");
                  }}
                  className="px-3 py-2 bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 text-zinc-700 dark:text-zinc-300 text-sm font-medium rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="border-t border-zinc-200 dark:border-zinc-800 p-3 bg-zinc-50 dark:bg-zinc-800/30">
              <button
                onClick={() => setShowCreateModal(true)}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg text-sm font-medium transition-colors"
              >
                <Plus className="w-4 h-4" />
                Save Current View
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
