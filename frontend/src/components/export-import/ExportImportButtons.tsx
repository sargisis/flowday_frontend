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
      if (!blob || blob.size === 0) {
        toast.error("Export failed: Empty file received");
        return;
      }
      downloadCSV(blob, `tasks_export_${new Date().toISOString().split("T")[0]}.csv`);
      toast.success("Tasks exported to CSV");
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || "Failed to export tasks";
      console.error("Export CSV error:", error);
      toast.error(errorMessage);
    }
  };

  const handleExportJSON = async () => {
    try {
      const data = await exportTasksJSON(projectId);
      if (!data || (Array.isArray(data) && data.length === 0)) {
        toast.warning("No tasks to export");
        return;
      }
      downloadJSON(data, `tasks_export_${new Date().toISOString().split("T")[0]}.json`);
      toast.success("Tasks exported to JSON");
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || "Failed to export tasks";
      console.error("Export JSON error:", error);
      toast.error(errorMessage);
    }
  };

  const handleImportCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.name.endsWith('.csv')) {
      toast.error("Please select a CSV file");
      if (e.target) e.target.value = "";
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      if (e.target) e.target.value = "";
      return;
    }

    setImporting(true);
    try {
      const result = await importTasksCSV(file);
      if (result.imported > 0) {
        toast.success(`Successfully imported ${result.imported} task${result.imported !== 1 ? 's' : ''}`);
      } else {
        toast.warning("No tasks were imported");
      }
      if (result.errors.length > 0) {
        console.error("Import errors:", result.errors);
        toast.error(`${result.errors.length} error${result.errors.length !== 1 ? 's' : ''} occurred. Check console for details.`, {
          duration: 5000,
        });
      }
      onImportComplete?.();
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || "Failed to import tasks";
      console.error("Import CSV error:", error);
      toast.error(errorMessage);
    } finally {
      setImporting(false);
      if (e.target) e.target.value = "";
    }
  };

  const handleImportJSON = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.name.endsWith('.json')) {
      toast.error("Please select a JSON file");
      if (e.target) e.target.value = "";
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      if (e.target) e.target.value = "";
      return;
    }

    setImporting(true);
    try {
      const text = await file.text();
      let tasks;
      try {
        tasks = JSON.parse(text);
      } catch (parseError) {
        toast.error("Invalid JSON file format");
        console.error("JSON parse error:", parseError);
        return;
      }

      if (!Array.isArray(tasks) && typeof tasks !== 'object') {
        toast.error("JSON file must contain an array of tasks or a task object");
        return;
      }

      const result = await importTasksJSON(Array.isArray(tasks) ? tasks : [tasks]);
      if (result.imported > 0) {
        toast.success(`Successfully imported ${result.imported} task${result.imported !== 1 ? 's' : ''}`);
      } else {
        toast.warning("No tasks were imported");
      }
      if (result.errors.length > 0) {
        console.error("Import errors:", result.errors);
        toast.error(`${result.errors.length} error${result.errors.length !== 1 ? 's' : ''} occurred. Check console for details.`, {
          duration: 5000,
        });
      }
      onImportComplete?.();
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || "Failed to import tasks";
      console.error("Import JSON error:", error);
      toast.error(errorMessage);
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
