import { useState } from "react";
import { Download, Upload, FileText, FileJson } from "lucide-react";
import { toast } from "sonner";
import {
  exportTasksCSV,
  exportTasksJSON,
  importTasksCSV,
  importTasksJSON,
  downloadCSV,
  downloadJSON,
} from "../../api/exportImport";

interface ExportImportButtonsProps {
  projectId?: string;
  onImportComplete?: () => void;
}

export default function ExportImportButtons({
  projectId,
  onImportComplete,
}: ExportImportButtonsProps) {
  const [importing, setImporting] = useState(false);

  const handleExportCSV = async () => {
    try {
      const blob = await exportTasksCSV(projectId);
      downloadCSV(blob, `tasks_export_${new Date().toISOString().split("T")[0]}.csv`);
      toast.success("Tasks exported to CSV");
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to export tasks");
    }
  };

  const handleExportJSON = async () => {
    try {
      const data = await exportTasksJSON(projectId);
      downloadJSON(data, `tasks_export_${new Date().toISOString().split("T")[0]}.json`);
      toast.success("Tasks exported to JSON");
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to export tasks");
    }
  };

  const handleImportCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    try {
      const result = await importTasksCSV(file);
      toast.success(`Imported ${result.imported} tasks`);
      if (result.errors.length > 0) {
        toast.warning(`${result.errors.length} errors occurred`);
      }
      onImportComplete?.();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to import tasks");
    } finally {
      setImporting(false);
      if (e.target) e.target.value = "";
    }
  };

  const handleImportJSON = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    try {
      const text = await file.text();
      const tasks = JSON.parse(text);
      const result = await importTasksJSON(Array.isArray(tasks) ? tasks : [tasks]);
      toast.success(`Imported ${result.imported} tasks`);
      if (result.errors.length > 0) {
        toast.warning(`${result.errors.length} errors occurred`);
      }
      onImportComplete?.();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to import tasks");
    } finally {
      setImporting(false);
      if (e.target) e.target.value = "";
    }
  };

  return (
    <div className="flex items-center gap-2">
      {/* Export */}
      <div className="relative group">
        <button className="flex items-center gap-2 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors">
          <Download className="w-4 h-4" />
          <span className="text-sm">Export</span>
        </button>
        <div className="absolute top-full left-0 mt-2 w-48 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
          <button
            onClick={handleExportCSV}
            className="w-full flex items-center gap-2 px-4 py-2 hover:bg-zinc-800 rounded-t-lg transition-colors"
          >
            <FileText className="w-4 h-4" />
            <span className="text-sm">Export as CSV</span>
          </button>
          <button
            onClick={handleExportJSON}
            className="w-full flex items-center gap-2 px-4 py-2 hover:bg-zinc-800 rounded-b-lg transition-colors"
          >
            <FileJson className="w-4 h-4" />
            <span className="text-sm">Export as JSON</span>
          </button>
        </div>
      </div>

      {/* Import */}
      <div className="relative">
        <label className="flex items-center gap-2 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors cursor-pointer">
          <Upload className="w-4 h-4" />
          <span className="text-sm">{importing ? "Importing..." : "Import"}</span>
          <input
            type="file"
            accept=".csv,.json"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              if (file.name.endsWith(".csv")) {
                handleImportCSV(e);
              } else if (file.name.endsWith(".json")) {
                handleImportJSON(e);
              }
            }}
            className="hidden"
            disabled={importing}
          />
        </label>
      </div>
    </div>
  );
}
